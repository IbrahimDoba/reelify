"use server"

import { revalidatePath } from "next/cache"
import { UTApi } from "uploadthing/server"
import OpenAI from "openai"
import db from "@/lib/db"
import type { TextToSpeechResult } from "@/lib/text-to-speech-types"

const utapi = new UTApi()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Map of voice IDs to OpenAI voice names
const VOICE_MAP: Record<string, string> = {
  alloy: "alloy",
  echo: "echo",
  fable: "fable",
  onyx: "onyx",
  nova: "nova",
  shimmer: "shimmer"
}

export async function convertTextToSpeech(text: string, voiceId: string, projectId: string): Promise<TextToSpeechResult> {
  console.log(projectId)
  try {
    if (!text || !voiceId) {
      return {
        success: false,
        error: "Text and voice selection are required",
      }
    }

    // Get OpenAI voice name from voice ID
    const voice = VOICE_MAP[voiceId] || "alloy"

    // Generate speech using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
    })

    // Convert to blob
    const buffer = Buffer.from(await mp3.arrayBuffer())
    const audioBlob = new Blob([buffer], { type: "audio/mpeg" })
    const audioFile = new File([audioBlob], `speech-${Date.now()}.mp3`, { type: "audio/mpeg" })

    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles([audioFile])

    if (!uploadResponse[0]?.data?.url) {
      throw new Error("Failed to upload audio file")
    }

    revalidatePath("/new-video")

    await db.project.update({
      where: { id: projectId },
      data: { ttsAudioUrl:  uploadResponse[0].data.url },
    });

    return {
      success: true,
      audioUrl: uploadResponse[0].data.url,
    }

  } catch (error) {
    console.error("Text-to-speech conversion error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to test voice samples
export async function getVoiceSample(voiceId: string, projectId: string): Promise<TextToSpeechResult> {
  const sampleText = "This is a sample of my voice. How do I sound?"
  return convertTextToSpeech(sampleText, voiceId, projectId)
}