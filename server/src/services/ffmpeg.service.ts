import ffmpeg from 'fluent-ffmpeg';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fs from 'node:fs';

// Initialize FFmpeg with paths
try {
  // Try to use ffmpeg-static if available
  const ffmpegStatic = require('ffmpeg-static');
  if (ffmpegStatic) {
    console.log(`Setting FFmpeg path to: ${ffmpegStatic}`);
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }
} catch (error) {
  console.warn('ffmpeg-static not found. Make sure FFmpeg is installed and in PATH.');
}

// Video resolution options
export type VideoResolution = '720p' | '1080p';

export interface VideoResolutionConfig {
  width: number;
  height: number;
  label: string;
}

export const VIDEO_RESOLUTIONS: Record<VideoResolution, VideoResolutionConfig> = {
  '720p': { width: 720, height: 1280, label: '720p (HD)' },
  '1080p': { width: 1080, height: 1920, label: '1080p (Full HD)' }
};

// Get media duration using ffprobe
export const getMediaDuration = async (filePath: string): Promise<number> => {
  try {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path });
    
    // Get duration from the first stream
    const formatDuration = info.streams[0]?.duration;
    if (!formatDuration) {
      throw new Error('Could not determine media duration');
    }

    // Alternative: Get duration from streams (example for video stream)
    const videoStream = info.streams.find(s => s.codec_type === 'video');
    const videoDuration = videoStream?.duration;
    
    // Use format duration as fallback and convert to number
    return Number.parseFloat(videoDuration || formatDuration);
  } catch (error) {
    throw new Error(`FFprobe error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get media framerate using ffprobe
export const getMediaFramerate = async (filePath: string): Promise<number> => {
  try {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path });
    
    // Find video stream
    const videoStream = info.streams.find(s => s.codec_type === 'video');
    if (!videoStream) {
      throw new Error('No video stream found');
    }

    // Get frame rate - it can be in different formats like "30/1" or just "30"
    const frameRateStr = videoStream.r_frame_rate || videoStream.avg_frame_rate;
    if (!frameRateStr) {
      // Default to 25 if we can't determine
      return 25;
    }
    
    // Handle fraction format (e.g., "30/1")
    if (frameRateStr.includes('/')) {
      const [numerator, denominator] = frameRateStr.split('/').map(Number);
      return numerator / denominator;
    }
    
    return Number.parseFloat(frameRateStr);
  } catch (error) {
    console.warn(`Warning: Could not determine framerate, using default of 25fps: ${error}`);
    return 25; // Default framerate if we can't determine
  }
};

// Verify FFmpeg is properly configured
export const verifyFfmpegConfiguration = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.error('FFmpeg not properly configured:', err.message);
        reject(new Error(`FFmpeg not properly configured: ${err.message}`));
      } else {
        console.log('FFmpeg is properly configured');
        resolve();
      }
    });
  });
};

// Merge video and audio with optional subtitles
export const mergeVideoAudio = async (
  videoPath: string, 
  audioPath: string, 
  outputPath: string, 
  srtSubtitlePath?: string,
  audioDuration?: number,
  resolution: VideoResolution = '720p' // Default to 720p for less resource usage
): Promise<void> => {
  // Get video duration outside of the Promise executor
  if (!audioDuration) {
    throw new Error('Audio duration is required');
  }
  
  const videoDuration = await getMediaDuration(videoPath);
  console.log(`Video duration: ${videoDuration}s, Audio duration: ${audioDuration}s`);
  
  // Get resolution config
  const resolutionConfig = VIDEO_RESOLUTIONS[resolution];
  console.log(`Using resolution: ${resolutionConfig.label} (${resolutionConfig.width}x${resolutionConfig.height})`);
  
  // Now use a normal (non-async) Promise executor
  return new Promise<void>((resolve, reject) => {
    try {
      console.log(`Processing video with ${srtSubtitlePath ? 'subtitles' : 'no subtitles'}`);
      
      let command = ffmpeg()
        .input(videoPath)
        .input(audioPath);
      
      // Build the filter chain
      let filterChain = [];
      
      // Handle video scaling first with the selected resolution
      filterChain.push(`[0:v]scale=${resolutionConfig.width}:${resolutionConfig.height}:force_original_aspect_ratio=decrease,pad=${resolutionConfig.width}:${resolutionConfig.height}:(ow-iw)/2:(oh-ih)/2:black[v0]`);
      
      // If audio is longer than video, we need to handle looping
      if (audioDuration > videoDuration) {
        console.log('Audio is longer than video. Setting up video loop.');
        
        // Calculate how many complete loops we need
        const loopCount = Math.ceil(audioDuration / videoDuration);
        console.log(`Need to loop video ${loopCount} times to match audio duration`);
        
        // For each loop, create a reference to the original scaled video
        for (let i = 1; i < loopCount; i++) {
          filterChain.push(`[0:v]scale=${resolutionConfig.width}:${resolutionConfig.height}:force_original_aspect_ratio=decrease,pad=${resolutionConfig.width}:${resolutionConfig.height}:(ow-iw)/2:(oh-ih)/2:black[v${i}]`);
        }
        
        // Build the concat inputs string
        let concatInputs = '';
        for (let i = 0; i < loopCount; i++) {
          concatInputs += `[v${i}]`;
        }
        
        // Add the concat filter
        filterChain.push(`${concatInputs}concat=n=${loopCount}:v=1:a=0[concatenated]`);
        
        // Trim to the exact audio duration
        filterChain.push(`[concatenated]trim=0:${audioDuration}[video_trimmed]`);
      } else {
        // Just trim the video if it's longer than audio
        filterChain.push(`[v0]trim=0:${audioDuration}[video_trimmed]`);
      }
      
      // Add subtitle burning if enabled
      if (srtSubtitlePath && fs.existsSync(srtSubtitlePath)) {
        // First create a properly escaped path
        // For Windows, need to handle paths very carefully for FFmpeg
        const escapedPath = srtSubtitlePath
          .replace(/\\/g, '/')          // Convert backslashes to forward slashes
          .replace(/:/g, '\\:')         // Escape colons
          .replace(/'/g, "\\'")         // Escape single quotes
          .replace(/\[/g, '\\[')        // Escape square brackets
          .replace(/\]/g, '\\]');
          
        // Create a simpler subtitle filter with minimal styling
        filterChain.push(`[video_trimmed]subtitles='${escapedPath}':force_style='Fontname=Arial,Fontsize=24,Alignment=10'[final]`);
      } else {
        // If no subtitles, just rename the last output
        filterChain[filterChain.length - 1] = filterChain[filterChain.length - 1].replace('[video_trimmed]', '[final]');
      }
      
      // Apply the filter chain
      command = command.complexFilter(filterChain.join(';'));
      
      // Build output options
      const outputOptions = [
        // Map the processed video and audio to the output
        '-map [final]',
        '-map 1:a',
        // Video codec
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        // Audio codec
        '-c:a aac',
        '-b:a 192k',
        // Make sure video plays well in browser
        '-movflags +faststart',
        // Set the duration explicitly
        `-t ${audioDuration}`
      ];
      
      command = command.outputOptions(outputOptions);
      
      command.output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing progress:', progress.percent, '%');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .run();
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  getMediaDuration,
  verifyFfmpegConfiguration,
  mergeVideoAudio,
  getMediaFramerate,
  VIDEO_RESOLUTIONS
};