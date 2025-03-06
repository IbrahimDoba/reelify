// text-to-speech-types.ts
// Type definitions and constants (no "use server" directive)

// Voice type definition
export type Voice = {
    id: string
    name: string
  }
  
  // Result type definition
  export type TextToSpeechResult = {
    success: boolean
    audioUrl?: string
    error?: string
    projectId?: string
  }
  
  // Available voices as a constant
  export const AVAILABLE_VOICES = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" }
  ]