import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Import utility functions and services
import { enqueue } from '../utils/queue';
import { createTempDir, downloadFile, cleanupDir } from '../utils/file.utils';
import { ensureAbsoluteUrl } from '../utils/url.utils';
import ffmpegService from './ffmpeg.service';
import subtitleService from './subtitle.service';
import uploadService from './upload.service';
import SpeechToTextService from './speech-to-text.service';

// Initialize SpeechToTextService
const speechToTextService = new SpeechToTextService(process.env.OPENAI_API_KEY);

const mediaProcessingService = {
  async mergeVideoAudio(videoUrl: string, audioUrl: string, baseUrl?: string, withSubtitles = true) {
    console.log("Merge video audio called with:", { videoUrl, audioUrl, withSubtitles });
    // Ensure URLs are absolute
    const absoluteVideoUrl = ensureAbsoluteUrl(videoUrl, baseUrl);
    const absoluteAudioUrl = ensureAbsoluteUrl(audioUrl, baseUrl);
    console.log("Using absolute URLs:", { absoluteVideoUrl, absoluteAudioUrl });
    
    return enqueue(() => this.processVideoAudio(absoluteVideoUrl, absoluteAudioUrl, withSubtitles));
  },

  async processVideoAudio(videoUrl: string, audioUrl: string, withSubtitles = true) {
    console.log("Processing video and audio");
    // Use our custom temp directory function
    const tempDir = createTempDir();
    
    try {
      const videoPath = path.join(tempDir, 'video.mp4');
      const audioPath = path.join(tempDir, 'audio.mp3');
      const outputPath = path.join(tempDir, 'output.mp4');
      const vttSubtitlePath = path.join(tempDir, 'subtitles.vtt');
      const srtSubtitlePath = path.join(tempDir, 'subtitles.srt');

      console.log("Downloading files to", tempDir);
      // Download files in parallel
      await Promise.all([
        downloadFile(videoUrl, videoPath),
        downloadFile(audioUrl, audioPath)
      ]);

      // Verify files exist and have content
      const [videoStats, audioStats] = await Promise.all([
        fsPromises.stat(videoPath),
        fsPromises.stat(audioPath)
      ]);
      
      if (videoStats.size === 0) throw new Error('Downloaded video file is empty');
      if (audioStats.size === 0) throw new Error('Downloaded audio file is empty');

      console.log("Files downloaded successfully. Starting FFmpeg processing");
      
      // Get media durations
      const [videoDuration, audioDuration] = await Promise.all([
        ffmpegService.getMediaDuration(videoPath),
        ffmpegService.getMediaDuration(audioPath)
      ]);
      console.log('Durations:', { videoDuration, audioDuration });

      if (!videoDuration || !audioDuration) {
        throw new Error('Failed to get media durations');
      }
      
      // Generate word-by-word subtitles if enabled
      let wordTimestamps = [];
      if (withSubtitles) {
        console.log("Generating speech-to-text subtitles");
        wordTimestamps = await speechToTextService.transcribeAudioWithWordTimestamps(audioPath);
        // Generate both VTT and SRT subtitles for better compatibility
        await subtitleService.generateWordByWordSubtitles(wordTimestamps, vttSubtitlePath);
        await subtitleService.generateSRTSubtitles(wordTimestamps, srtSubtitlePath);
      }
          
      // Check if FFmpeg is available before processing
      await ffmpegService.verifyFfmpegConfiguration();
      
      // Process the video with FFmpeg
      await ffmpegService.mergeVideoAudio(
        videoPath, 
        audioPath, 
        outputPath, 
        withSubtitles ? srtSubtitlePath : undefined,
        audioDuration
      );

      console.log("FFmpeg processing complete. Uploading result");
      
      // Upload the processed file
      const fileName = `processed_${uuidv4()}.mp4`;
      const uploadResult = await uploadService.uploadFileFromPath(outputPath, fileName);
      console.log("Upload complete:", uploadResult);
      
      return uploadResult;
    } catch (error) {
      console.error('Video processing error:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Video processing failed: ${message}`);
    } finally {
      // Clean up temp directory
      await cleanupDir(tempDir);
    }
  },
  
  async generateSubtitlesFromAudio(audioUrl: string) {
    console.log("Generating subtitles from audio:", audioUrl);
    try {
      const absoluteAudioUrl = ensureAbsoluteUrl(audioUrl);
      const wordTimestamps = await speechToTextService.transcribeAudioFromUrl(absoluteAudioUrl);
      return wordTimestamps;
    } catch (error) {
      console.error('Subtitle generation error:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Subtitle generation failed: ${message}`);
    }
  },
  
  // Simple utility function to upload any file to UploadThing
  async uploadFileToUploadThing(filePath: string, fileName?: string) {
    return uploadService.uploadFileFromPath(filePath, fileName);
  }
};

export default mediaProcessingService;