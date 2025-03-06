
"use server";

import { UTApi } from "uploadthing/server";
import ffmpeg from "fluent-ffmpeg";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { readFile as fsReadFile } from 'node:fs/promises';

const utapi = new UTApi();

interface MergeResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export async function mergeVideoAudio(
  videoUrl: string,
  audioUrl: string
): Promise<MergeResult> {
  try {
    // Download video and audio files
    const [videoResponse, audioResponse] = await Promise.all([
      fetch(videoUrl),
      fetch(audioUrl),
    ]);

    const videoBuffer = await videoResponse.arrayBuffer();
    const audioBuffer = await audioResponse.arrayBuffer();

    // Create temporary files
    const tempDir = join(process.cwd(), 'temp');
    const videoPath = join(tempDir, `video-${Date.now()}.mp4`);
    const audioPath = join(tempDir, `audio-${Date.now()}.mp3`);
    const outputPath = join(tempDir, `output-${Date.now()}.mp4`);

    await Promise.all([
      writeFile(videoPath, Buffer.from(videoBuffer)),
      writeFile(audioPath, Buffer.from(audioBuffer)),
    ]);

    // Process video with FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest'
        ])
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // Upload result
    const outputFile = await readFile(outputPath);
    const uploadResponse = await utapi.uploadFiles([
      new File([outputFile], `merged-video-${Date.now()}.mp4`),
    ]);

    // Cleanup temporary files
    await Promise.all([
      unlink(videoPath),
      unlink(audioPath),
      unlink(outputPath),
    ]);

    return {
      success: true,
      videoUrl: uploadResponse[0].data?.url,
    };
  } catch (error) {
    console.error("Video merge error:", error);
    return {
      success: false,
      error: "Failed to merge video and audio",
    };
  }
}


async function readFile(outputPath: string): Promise<Buffer> {
    return fsReadFile(outputPath);
}
// "use server";

// import { UTApi } from "uploadthing/server";
// import { tmpdir } from "os";
// import { join } from "path";
// import { writeFile, unlink, readFile } from "fs/promises";
// import { existsSync } from "fs";
// import OpenAI from "openai";
// // import { getAudioDurationInSeconds } from 'get-audio-duration';
// // Import editly with a dynamic import to avoid SSR issues
// // We'll use this approach in the processing function

// // Use the UTApi constructor pattern as recommended in UploadThing docs
// const utapi = new UTApi();

// interface ProcessingResult {
//   success: boolean;
//   error?: string;
//   videoUrl?: string;
//   subtitlesUrl?: string;
// }

// export async function processVideoWithEditly(
//   formData: FormData
// ): Promise<ProcessingResult> {
//   const tempFiles: string[] = [];
  
//   try {
//     // 1. Validate and extract inputs
//     const videoFile = formData.get("video") as File;
//     const audioFile = formData.get("audio") as File;
    
//     if (!videoFile || !audioFile) {
//       return { success: false, error: "Missing video or audio file" };
//     }

//     // 2. Create temporary files
//     const tempDir = tmpdir();
//     const videoPath = join(tempDir, `input-${Date.now()}.mp4`);
//     const audioPath = join(tempDir, `audio-${Date.now()}.mp3`);
    
//     await Promise.all([
//       writeFile(videoPath, Buffer.from(await videoFile.arrayBuffer())),
//       writeFile(audioPath, Buffer.from(await audioFile.arrayBuffer())),
//     ]);
//     tempFiles.push(videoPath, audioPath);

//     // 3. Generate subtitles from audio
//     const subtitles = await generateSubtitles(audioPath);
//     const subtitlePath = await createSubtitleFile(subtitles);
//     tempFiles.push(subtitlePath);

//     // 4. Get audio duration
//     const audioDuration = await getAudioDuration(audioPath);

//     // 5. Dynamically import editly to avoid SSR issues
//     const { default: editly } = await import('editly');

//     // Check for font file existence for better error handling
//     const fontPath = join(process.cwd(), 'public/fonts/Inter-Regular.ttf');
//     const fontExists = existsSync(fontPath);
    
//     // 6. Create Editly specification
//     const outPath = join(tempDir, `final-${Date.now()}.mp4`);
//     tempFiles.push(outPath);
    
//     const editSpec = {
//       outPath,
//       fast: process.env.NODE_ENV === 'development',
//       width: 720,
//       height: 1280, // 9:16 aspect ratio
//       fps: 30,
//       defaults: {
//         duration: audioDuration,
//         transition: {
//           duration: 0.5,
//           name: 'fade', // Simple crossfade
//         },
//         layer: {
//           fontPath: fontExists ? fontPath : undefined, // Only use if it exists
//           fontSize: 24,
//           textColor: '#FFFFFF',
//           position: 'bottom',
//         }
//       },
//       clips: [
//         {
//           layers: [
//             {
//               type: 'video',
//               path: videoPath,
//               resizeMode: 'contain',
//               backgroundColor: '#000000',
//             },
//             {
//               type: 'subtitle',
//               path: subtitlePath,
//               text: '', // Actual text comes from SRT file
//               position: 'bottom',
//               backgroundOpacity: 0.5,
//             }
//           ]
//         }
//       ],
//       audioTracks: [
//         {
//           path: audioPath,
//           mixVolume: 1.0,
//           start: 0,
//         }
//       ],
//       audioNorm: {
//         enable: true,
//         gaussSize: 5,
//         maxGain: 30
//       }
//     };

//     // 7. Render video with Editly
//     await editly(editSpec);

//     // 8. Upload final video
//     const finalVideoBuffer = await readFile(outPath);
//     const finalVideoFile = new File([finalVideoBuffer], "final-video.mp4", { type: "video/mp4" });
    
//     const finalUpload = await utapi.uploadFiles([finalVideoFile]);
//     const subtitlesUrl = await uploadSubtitles(subtitles);

//     return {
//       success: true,
//       videoUrl: finalUpload[0]?.data?.url,
//       subtitlesUrl,
//     };
//   } catch (error) {
//     console.error("Processing error:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   } finally {
//     // Clean up temporary files
//     await cleanupFiles(tempFiles);
//   }
// }

// // Helper functions
// async function generateSubtitles(audioPath: string): Promise<string> {
//   try {
//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
//     // Read the file from disk rather than passing the File object directly
//     const audioBuffer = await readFile(audioPath);
    
//     // Create a temporary file specifically for OpenAI upload
//     const tempAudioFile = new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" });
    
//     const transcription = await openai.audio.transcriptions.create({
//       file: tempAudioFile,
//       model: "whisper-1",
//       response_format: "srt",
//     });

//     return transcription as unknown as string;
//   } catch (error) {
//     console.error("Subtitle generation error:", error);
//     // Return empty subtitles in case of error to allow processing to continue
//     return "";
//   }
// }

// // async function getAudioDuration(audioPath: string): Promise<number> {
// //   try {
// //     return await getAudioDurationInSeconds(audioPath);
// //   } catch (error) {
// //     console.error("Error getting audio duration:", error);
// //     // Return a default duration in case of error
// //     return 30; // Default to 30 seconds
// //   }
// // }

// async function createSubtitleFile(srtContent: string): Promise<string> {
//   const tempDir = tmpdir();
//   const subtitlePath = join(tempDir, `subtitles-${Date.now()}.srt`);
//   await writeFile(subtitlePath, srtContent);
//   return subtitlePath;
// }

// async function uploadSubtitles(srtContent: string): Promise<string> {
//   try {
//     if (!srtContent.trim()) {
//       return "";
//     }
    
//     const subtitleFile = new File([srtContent], "subtitles.srt", { type: "application/x-subrip" });
//     const response = await utapi.uploadFiles([subtitleFile]);
//     return response[0]?.data?.url || "";
//   } catch (error) {
//     console.error("Subtitle upload error:", error);
//     return "";
//   }
// }

// async function cleanupFiles(paths: string[]) {
//   await Promise.all(
//     paths.map(async (path) => {
//       try {
//         await unlink(path);
//       } catch (error) {
//         console.warn(`Failed to delete temp file ${path}:`, error);
//       }
//     })
//   );
// }