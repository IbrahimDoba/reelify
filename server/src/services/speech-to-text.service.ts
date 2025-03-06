import OpenAI from "openai";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { v4 as uuidv4 } from "uuid";

// Define interface for word-level timestamps
export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export class SpeechToTextService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    // Use provided API key or environment variable
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API key is required. Please provide it or set OPENAI_API_KEY environment variable."
      );
    }
  }

  
  async transcribeAudioWithWordTimestamps(
    audioFilePath: string
  ): Promise<WordTimestamp[]> {
    try {
      console.log(`Transcribing audio file: ${audioFilePath}`);
  
      // Ensure file exists
      const stats = await fsPromises.stat(audioFilePath);
      if (stats.size === 0) {
        throw new Error("Audio file is empty");
      }
  
      // Create a readable stream for the file
      const audioFile = fs.createReadStream(audioFilePath);
  
      // Call OpenAI's transcription API with timestamps enabled
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      });
  
      const wordTimestamps: WordTimestamp[] = [];
  
      // Check if words array exists directly in the response
      if (transcription.words && Array.isArray(transcription.words)) {
        // Process words from the top-level array
        for (const word of transcription.words as any[]) {
          wordTimestamps.push({
            word: word.word.trim(),
            start: word.start,
            end: word.end,
          });
        }
      } else {
        // Fallback to segments approach if the structure changes
        const segments = transcription.segments || [];
        
        for (const segment of segments) {
          const segmentWithWords = segment as unknown as {
            words: Array<{ word: string; start: number; end: number }>;
          };
  
          if (segmentWithWords.words) {
            for (const word of segmentWithWords.words) {
              wordTimestamps.push({
                word: word.word.trim(),
                start: word.start,
                end: word.end,
              });
            }
          }
        }
      }
  
      console.log(
        `Transcription complete. Found ${wordTimestamps.length} words with timestamps.`
      );
      return wordTimestamps;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Audio transcription failed: ${message}`);
    }
  }

 
  async transcribeAudioFromUrl(audioUrl: string): Promise<WordTimestamp[]> {
    try {
      // Create a temporary directory
      const tempDir = path.join(tmpdir(), uuidv4());
      await fsPromises.mkdir(tempDir, { recursive: true });

      // Download the audio file
      const audioPath = path.join(tempDir, "audio.mp3");
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download audio: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      await fsPromises.writeFile(audioPath, Buffer.from(buffer));

      // Transcribe the downloaded audio
      const result = await this.transcribeAudioWithWordTimestamps(audioPath);

      // Clean up
      await fsPromises.rm(tempDir, { recursive: true, force: true });

      return result;
    } catch (error) {
      console.error("Error processing audio from URL:", error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Audio URL processing failed: ${message}`);
    }
  }
}

export default SpeechToTextService;
