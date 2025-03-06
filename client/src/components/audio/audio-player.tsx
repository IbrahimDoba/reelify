"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface AudioPlayerProps {
  src?: string
  onPlay?: () => void
  onEnded?: () => void
  className?: string
}

export function AudioPlayer({ src, onPlay, onEnded, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!src) {
      setIsLoaded(false)
      setIsPlaying(false)
      return
    }

    // Create a new audio element when the src changes
    const audio = new Audio(src)
    audioRef.current = audio

    audio.addEventListener("canplaythrough", () => {
      setIsLoaded(true)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    })

    audio.addEventListener("error", (e) => {
      console.error("Audio loading error:", e)
      setIsLoaded(false)
    })

    // Clean up
    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("canplaythrough", () => {})
      audio.removeEventListener("ended", () => {})
      audio.removeEventListener("error", () => {})
      audioRef.current = null
    }
  }, [src, onEnded])

  const togglePlayback = () => {
    if (!audioRef.current || !isLoaded) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      if (onPlay) onPlay()
    }

    setIsPlaying(!isPlaying)
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className={`h-8 w-8 ${className}`}
      onClick={togglePlayback}
      disabled={!isLoaded}
    >
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </Button>
  )
}

