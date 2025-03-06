// import { UTApi, UTFile } from "uploadthing/server";
// import ffmpeg from 'fluent-ffmpeg';
// import { tmpdir } from 'node:os';
// import path from 'node:path';
// import { v4 as uuidv4 } from 'uuid';
// import { Readable } from 'node:stream';
// import fs from 'node:fs';
// import fsPromises from 'node:fs/promises';
// import type { ReadableStream } from 'web-streams-polyfill';
// import ffprobe from 'ffprobe';
// import ffprobeStatic from 'ffprobe-static';
// import SpeechToTextService, { type WordTimestamp } from "./speech-to-text.service";

// // Add FFmpeg path configuration
// try {
//   // Try to use ffmpeg-static if available
//   const ffmpegStatic = require('ffmpeg-static');
//   if (ffmpegStatic) {
//     console.log(`Setting FFmpeg path to: ${ffmpegStatic}`);
//     ffmpeg.setFfmpegPath(ffmpegStatic);
//   }
// } catch (error) {
//   console.warn('ffmpeg-static not found. Make sure FFmpeg is installed and in PATH.');
// }

// // Initialize SpeechToTextService
// const speechToTextService = new SpeechToTextService(process.env.OPENAI_API_KEY);

// // Instead of p-limit, use a simple queue
// let processing = false;
// const queue: Array<() => Promise<any>> = [];

// const enqueue = async (fn: () => Promise<any>) => {
//   // If already processing, add to queue
//   if (processing) {
//     return new Promise((resolve, reject) => {
//       queue.push(async () => {
//         try {
//           const result = await fn();
//           resolve(result);
//         } catch (error) {
//           reject(error);
//         }
//       });
//     });
//   }
  
//   // Otherwise process immediately
//   processing = true;
//   try {
//     return await fn();
//   } finally {
//     // Process next item in queue if available
//     if (queue.length > 0) {
//       const next = queue.shift();
//       if (next) next();
//     } else {
//       processing = false;
//     }
//   }
// };

// // Create a custom temporary directory function
// const createTempDir = () => {
//   const uniqueFolder = path.join(tmpdir(), uuidv4());
//   fs.mkdirSync(uniqueFolder, { recursive: true });
//   return uniqueFolder;
// };

// // Initialize UploadThing API
// const utapi = new UTApi();

// // Function to ensure a URL is absolute
// const ensureAbsoluteUrl = (url: string, baseUrl?: string): string => {
//   try {
//     // Check if it's already a valid URL
//     new URL(url);
//     return url;
//   } catch (error) {
//     // If it's not a valid URL, it might be a relative path
//     if (url.startsWith('/')) {
//       // If baseUrl is provided, use it
//       if (baseUrl) {
//         try {
//           return new URL(url, baseUrl).toString();
//         } catch (e) {
//           // If baseUrl is invalid, fallback to current origin
//           const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
//           return new URL(url, origin).toString();
//         }
//       } else {
//         // Fallback to localhost if no baseUrl provided
//         return new URL(url, 'http://localhost:3000').toString();
//       }
//     } else {
//       // If it doesn't start with '/', prepend '/' and try again
//       return ensureAbsoluteUrl('/' + url, baseUrl);
//     }
//   }
// };

// const getMediaDuration = async (filePath: string): Promise<number> => {
//   try {
//     const info = await ffprobe(filePath, { path: ffprobeStatic.path });
    
//     // Get duration from the first stream
//     const formatDuration = info.streams[0]?.duration;
//     if (!formatDuration) {
//       throw new Error('Could not determine media duration');
//     }

//     // Alternative: Get duration from streams (example for video stream)
//     const videoStream = info.streams.find(s => s.codec_type === 'video');
//     const videoDuration = videoStream?.duration;
    
//     // Use format duration as fallback and convert to number
//     return Number.parseFloat(videoDuration || formatDuration);
//   } catch (error) {
//     throw new Error(`FFprobe error: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// };

// // Generate subtitle file in VTT format for word-by-word display
// const generateWordByWordSubtitles = async (wordTimestamps: WordTimestamp[], outputPath: string): Promise<void> => {
//   try {
//     // Create WebVTT content
//     let vttContent = 'WEBVTT\n\n';
    
//     // Add each word as a separate cue
//     for (const { word, start, end } of wordTimestamps) {
//       if (word.trim() === '') continue;
      
//       // Format the timestamp for WebVTT (HH:MM:SS.mmm)
//       const formatTime = (seconds: number) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = Math.floor(seconds % 60);
//         const milliseconds = Math.floor((seconds % 1) * 1000);
        
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
//       };
      
//       // Add the cue with styling for center alignment and bold text
//       vttContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
//       vttContent += `<c.subtitle><b>${word}</b></c>\n\n`;
//     }
    
//     // Write to file
//     await fsPromises.writeFile(outputPath, vttContent);
//     console.log(`Subtitle file generated: ${outputPath}`);
//   } catch (error) {
//     console.error('Error generating subtitles:', error);
//     throw error;
//   }
// };

// // NEW FUNCTION: Generate SRT format subtitles for better compatibility with FFmpeg
// const generateSRTSubtitles = async (wordTimestamps: WordTimestamp[], outputPath: string): Promise<void> => {
//   try {
//     let srtContent = '';
//     let cueNumber = 1;
    
//     // Add each word as a separate cue
//     for (const { word, start, end } of wordTimestamps) {
//       if (word.trim() === '') continue;
      
//       // Format the timestamp for SRT (HH:MM:SS,mmm)
//       const formatTime = (seconds: number) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = Math.floor(seconds % 60);
//         const milliseconds = Math.floor((seconds % 1) * 1000);
        
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
//       };
      
//       // Add the cue
//       srtContent += `${cueNumber}\n`;
//       srtContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
//       srtContent += `${word}\n\n`;
      
//       cueNumber++;
//     }
    
//     // Write to file
//     await fsPromises.writeFile(outputPath, srtContent);
//     console.log(`SRT subtitle file generated: ${outputPath}`);
//   } catch (error) {
//     console.error('Error generating SRT subtitles:', error);
//     throw error;
//   }
// };


// export default {
//   async mergeVideoAudio(videoUrl: string, audioUrl: string, baseUrl?: string, withSubtitles = true) {
//     console.log("Merge video audio called with:", { videoUrl, audioUrl, withSubtitles });
//     // Ensure URLs are absolute
//     const absoluteVideoUrl = ensureAbsoluteUrl(videoUrl, baseUrl);
//     const absoluteAudioUrl = ensureAbsoluteUrl(audioUrl, baseUrl);
//     console.log("Using absolute URLs:", { absoluteVideoUrl, absoluteAudioUrl });
    
//     return enqueue(() => this.processVideoAudio(absoluteVideoUrl, absoluteAudioUrl, withSubtitles));
//   },

//   async processVideoAudio(videoUrl: string, audioUrl: string, withSubtitles = true) {
//     console.log("Processing video and audio");
//     // Use our custom temp directory function
//     const tempDir = createTempDir();
    
//     const downloadFile = async (url: string, filePath: string) => {
//       try {
//         // Ensure URL is absolute before fetching
//         const absoluteUrl = ensureAbsoluteUrl(url);
//         console.log(`Downloading from: ${absoluteUrl} to ${filePath}`);
        
//         const response = await fetch(absoluteUrl);
//         if (!response.ok) throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
//         if (!response.body) throw new Error('Response body is empty');
        
//         // Convert web streams to Node.js streams
//         const webStream = response.body as unknown as ReadableStream<Uint8Array>;
//         const nodeStream = Readable.fromWeb(webStream);
        
//         // Ensure directory exists
//         await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        
//         // Write file using regular fs
//         const writeStream = fs.createWriteStream(filePath);
//         nodeStream.pipe(writeStream);
        
//         return new Promise<void>((resolve, reject) => {
//           writeStream.on('finish', () => resolve());
//           writeStream.on('error', reject);
//         });
//       } catch (error) {
//         const message = error instanceof Error ? error.message : String(error);
//         throw new Error(`Download failed for ${url}: ${message}`);
//       }
//     };

//     try {
//       const videoPath = path.join(tempDir, 'video.mp4');
//       const audioPath = path.join(tempDir, 'audio.mp3');
//       const outputPath = path.join(tempDir, 'output.mp4');
//       const vttSubtitlePath = path.join(tempDir, 'subtitles.vtt');
//       const srtSubtitlePath = path.join(tempDir, 'subtitles.srt');

//       console.log("Downloading files to", tempDir);
//       // Download files in parallel
//       await Promise.all([
//         downloadFile(videoUrl, videoPath),
//         downloadFile(audioUrl, audioPath)
//       ]);

//       // Verify files exist and have content
//       const [videoStats, audioStats] = await Promise.all([
//         fsPromises.stat(videoPath),
//         fsPromises.stat(audioPath)
//       ]);
      
//       if (videoStats.size === 0) throw new Error('Downloaded video file is empty');
//       if (audioStats.size === 0) throw new Error('Downloaded audio file is empty');

//       console.log("Files downloaded successfully. Starting FFmpeg processing");
      
//       // Get media durations
//       const [videoDuration, audioDuration] = await Promise.all([
//         getMediaDuration(videoPath),
//         getMediaDuration(audioPath)
//       ]);
//       console.log('Durations:', { videoDuration, audioDuration });

//       if (!videoDuration || !audioDuration) {
//         throw new Error('Failed to get media durations');
//       }
      
//       // Generate word-by-word subtitles if enabled
//       let wordTimestamps: WordTimestamp[] = [];
//       if (withSubtitles) {
//         console.log("Generating speech-to-text subtitles");
//         wordTimestamps = await speechToTextService.transcribeAudioWithWordTimestamps(audioPath);
//         // Generate both VTT and SRT subtitles for better compatibility
//         await generateWordByWordSubtitles(wordTimestamps, vttSubtitlePath);
//         await generateSRTSubtitles(wordTimestamps, srtSubtitlePath);
//       }
          
//       // Check if FFmpeg is available before processing
//       await new Promise<void>((resolve, reject) => {
//         ffmpeg.getAvailableFormats((err, formats) => {
//           if (err) {
//             console.error('FFmpeg not properly configured:', err.message);
//             reject(new Error(`FFmpeg not properly configured: ${err.message}`));
//           } else {
//             console.log('FFmpeg is properly configured');
//             resolve();
//           }
//         });
//       });
      
//       // Create a FFmpeg command, adding subtitles if enabled
//       await new Promise<void>((resolve, reject) => {
//         console.log(`Processing video with ${withSubtitles ? 'subtitles' : 'no subtitles'}`);
        
//         let command = ffmpeg()
//           .input(videoPath)
//           .input(audioPath);
        
//         // Updated complex filter setup for processing
//         let filters = [
//           // Scale video to vertical format (9:16) maintaining aspect ratio
//           'scale=1080:1920:force_original_aspect_ratio=decrease[scaled]',
//           // Add black padding to fill the frame
//           '[scaled]pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[padded]',
//           // Trim video to match audio duration
//           `[padded]trim=0:${audioDuration}[trimmed_video]`
//         ];
        
//         // Add subtitle burning if enabled
//         if (withSubtitles && fs.existsSync(srtSubtitlePath)) {
//           // First create a properly escaped path
//           // For Windows, need to handle paths very carefully for FFmpeg
//           const escapedPath = srtSubtitlePath
//             .replace(/\\/g, '/')          // Convert backslashes to forward slashes
//             .replace(/:/g, '\\:')         // Escape colons
//             .replace(/'/g, "\\'")         // Escape single quotes
//             .replace(/\[/g, '\\[')        // Escape square brackets
//             .replace(/\]/g, '\\]');
            
//           // Create a simpler subtitle filter with minimal styling
//           // The subtitles filter in FFmpeg can be finicky with too many style options
//           filters.push(
//             `[trimmed_video]subtitles='${escapedPath}':force_style='Fontname=Arial,Fontsize=24,Alignment=10'[final]`
//           );
//         } else {
//           // If no subtitles, just rename the last output
//           filters[filters.length - 1] = filters[filters.length - 1].replace('[trimmed_video]', '[final]');
//         }
        
//         // Alternative approach if the above still fails
//         // Uncomment this block to use the drawtext approach instead of the subtitles filter
//         /*
//         if (withSubtitles && fs.existsSync(srtSubtitlePath)) {
//           try {
//             // Create a drawtext filter for each word instead of using subtitles filter
//             // This is more complex but gives better control
            
//             // First, create a text overlay approach instead
//             const drawTextFilters = [];
            
//             // Set a fixed position in the center bottom of the video
//             const xPosition = "w/2-text_w/2"; // Center horizontally
//             const yPosition = "h-200";        // Fixed position from bottom
            
//             let lastStartTime = 0;
//             for (const { word, start, end } of wordTimestamps) {
//               if (word.trim() === '') continue;
              
//               // Calculate display time in seconds
//               const displayTime = end - start;
              
//               // Add drawtext filter for this word
//               drawTextFilters.push(
//                 `drawtext=text='${word}':x=${xPosition}:y=${yPosition}:fontsize=50:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,${start},${end})':fontfile=/path/to/arial.ttf`
//               );
//             }
            
//             // Add all drawtext filters to the main video
//             if (drawTextFilters.length > 0) {
//               // Combine all drawtext filters with commas
//               const textOverlayFilter = drawTextFilters.join(',');
//               filters.push(`[trimmed_video]${textOverlayFilter}[final]`);
//             } else {
//               filters[filters.length - 1] = filters[filters.length - 1].replace('[trimmed_video]', '[final]');
//             }
//           } catch (error) {
//             // Fallback if the drawtext approach fails
//             console.warn('Advanced subtitling failed, falling back to simpler method:', error);
//             filters[filters.length - 1] = filters[filters.length - 1].replace('[trimmed_video]', '[final]');
//           }
//         }
//         */
        
//         command = command.complexFilter(filters);
        
//         // Build output options
//         const outputOptions = [
//           // Map the processed video and audio to the output
//           '-map [final]',
//           '-map 1:a',
//           // Video codec
//           '-c:v libx264',
//           '-preset fast',
//           '-crf 23',
//           // Audio codec
//           '-c:a aac',
//           '-b:a 192k',
//           // Make sure video plays well in browser
//           '-movflags +faststart',
//           // Set the duration explicitly
//           `-t ${audioDuration}`
//         ];
        
//         command = command.outputOptions(outputOptions);
        
//         command.output(outputPath)
//           .on('start', (commandLine) => {
//             console.log('FFmpeg process started:', commandLine);
//           })
//           .on('progress', (progress) => {
//             console.log('Processing progress:', progress.percent, '%');
//           })
//           .on('end', () => {
//             console.log('FFmpeg processing finished');
//             resolve();
//           })
//           .on('error', (err) => {
//             console.error('FFmpeg error:', err.message);
//             reject(new Error(`FFmpeg processing failed: ${err.message}`));
//           })
//           .run();
//       });

//       console.log("FFmpeg processing complete. Uploading result");
//       // Read the processed file to upload with UploadThing
//       const fileBuffer = await fsPromises.readFile(outputPath);
//       const fileName = `processed_${uuidv4()}.mp4`;
      
//       // Create UTFile from the buffer
//       const file = new UTFile([fileBuffer], fileName, {
//         customId: uuidv4()
//       });
//       // Upload to UploadThing
//       const uploadResult = await utapi.uploadFiles([file]);
//       console.log("Upload complete:", uploadResult);
      
//       return uploadResult;
//     } catch (error) {
//       console.error('Video processing error:', error);
//       const message = error instanceof Error ? error.message : String(error);
//       throw new Error(`Video processing failed: ${message}`);
//     } finally {
//       // Clean up temp directory
//       try {
//         await fsPromises.rm(tempDir, { recursive: true, force: true });
//       } catch (cleanupError) {
//         console.warn('Cleanup error (non-fatal):', cleanupError);
//       }
//     }
//   },
  

//   async generateSubtitlesFromAudio(audioUrl: string) {
//     console.log("Generating subtitles from audio:", audioUrl);
//     try {
//       const absoluteAudioUrl = ensureAbsoluteUrl(audioUrl);
//       const wordTimestamps = await speechToTextService.transcribeAudioFromUrl(absoluteAudioUrl);
//       return wordTimestamps;
//     } catch (error) {
//       console.error('Subtitle generation error:', error);
//       const message = error instanceof Error ? error.message : String(error);
//       throw new Error(`Subtitle generation failed: ${message}`);
//     }
//   },
  
//   // Simple utility function to upload any file to UploadThing
//   async uploadFileToUploadThing(filePath: string, fileName?: string) {
//     try {
//       const fileBuffer = await fsPromises.readFile(filePath);
//       const actualFileName = fileName || path.basename(filePath);
      
//       // Create UTFile from the buffer
//       const file = new UTFile([fileBuffer], actualFileName, {
//         customId: uuidv4()
//       });
      
//       // Upload to UploadThing
//       const response = await utapi.uploadFiles([file]);
//       return response;
//     } catch (error) {
//       console.error('UploadThing upload error:', error);
//       const message = error instanceof Error ? error.message : String(error);
//       throw new Error(`UploadThing upload failed: ${message}`);
//     }
//   }
// };