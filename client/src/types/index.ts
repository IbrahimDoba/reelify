export type Project = {
    id: string
    title: string
    content: string
    backgroundVideo: string
    createdAt: Date
  }

  // Export all types from a central location for better imports
import { SubtitleSegment } from "@/components/video/video-player"

// Word-level timestamp interface
export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// Enhanced subtitle segment with word-level detail
export interface EnhancedSubtitleSegment extends SubtitleSegment {
  words: WordTimestamp[];
}

// Result interface for text-to-speech operations
export interface TextToSpeechResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

// Result interface for video processing operations
export interface VideoProcessingResult {
  success: boolean;
  videoUrl?: string;
  subtitles?: SubtitleSegment[];
  error?: string;
}