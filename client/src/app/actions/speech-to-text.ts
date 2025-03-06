// "use server"

// import OpenAI from "openai"
// import fs from 'fs'
// import path from 'path'
// import os from 'os'
// import { SubtitleSegment } from "@/components/video/video-player"

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// })

// // Interface for word-level timestamps
// export interface WordTimestamp {
//   word: string;
//   start: number;
//   end: number;
// }

// // Enhanced subtitle segment with word-level detail
// export interface EnhancedSubtitleSegment extends SubtitleSegment {
//   words: WordTimestamp[];
// }

// // Interface for OpenAI response with word-level timestamps
// interface WhisperResponse {
//   text: string;
//   segments?: Array<{
//     id: number;
//     text: string;
//     start: number;
//     end: number;
//     words?: Array<{
//       word: string;
//       start: number;
//       end: number;
//     }>;
//   }>;
// }

// // Generate transcription with word-level timestamps using OpenAI Whisper
// export async function generateTranscription(audioUrl: string): Promise<EnhancedSubtitleSegment[]> {
//   try {
//     // Download the audio file temporarily
//     const audioResponse = await fetch(audioUrl);
//     const audioBuffer = await audioResponse.arrayBuffer();
//     const tempFilePath = path.join(os.tmpdir(), `temp-audio-${Date.now()}.mp3`);
//     fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer));

//     // Create a readable stream from the file
//     const audioFile = fs.createReadStream(tempFilePath);

//     // Use OpenAI's Whisper model to transcribe with word timestamps
//     const transcriptionResponse = await openai.audio.transcriptions.create({
//       file: audioFile,
//       model: "whisper-1",
//       response_format: "verbose_json",
//       timestamp_granularities: ["word"]
//     });

//     // Cast the response to our custom interface
//     const transcription = transcriptionResponse as unknown as WhisperResponse;

//     // Clean up temp file
//     fs.unlinkSync(tempFilePath);

//     // Process the transcription data, handling potential undefined values
//     if (!transcription.segments) {
//       // If no segments are available, create a single segment from the full text
//       return [{
//         text: transcription.text.trim(),
//         startTime: 0,
//         endTime: 10, // Default duration if unknown
//         words: []
//       }];
//     }

//     const segments = transcription.segments.map(segment => {
//       const words: WordTimestamp[] = segment.words ? segment.words.map(word => ({
//         word: word.word,
//         start: word.start,
//         end: word.end
//       })) : [];

//       return {
//         text: segment.text.trim(),
//         startTime: segment.start,
//         endTime: segment.end,
//         words
//       };
//     });

//     return segments;
//   } catch (error) {
//     console.error("Transcription error:", error);
//     throw new Error(`Failed to generate transcription: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// // Generate subtitles from audio using transcription
// export async function generateSubtitles(text: string, audioUrl: string): Promise<SubtitleSegment[]> {
//   try {
//     // Use the transcription function we created
//     const enhancedSegments = await generateTranscription(audioUrl);
    
//     // Convert the enhanced segments to the original SubtitleSegment format if needed
//     const segments: SubtitleSegment[] = enhancedSegments.map(segment => ({
//       text: segment.text,
//       startTime: segment.startTime,
//       endTime: segment.endTime
//     }));
    
//     return segments;
//   } catch (error) {
//     console.error("Subtitle generation error:", error);
    
//     // Fallback to the original method if transcription fails
//     const audioDuration = 60; // Default to 60 seconds if we don't know
//     const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
//     const segmentDuration = audioDuration / sentences.length;
    
//     return sentences.map((sentence, index) => ({
//       text: sentence.trim(),
//       startTime: index * segmentDuration,
//       endTime: (index + 1) * segmentDuration,
//     }));
//   }
// }

// // Helper function to format time for SRT files
// export async function formatSrtTime(seconds: number): Promise<string> {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);
//   const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);
  
//   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
// }