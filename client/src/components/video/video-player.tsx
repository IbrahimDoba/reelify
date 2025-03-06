"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  videoSrc?: string
  audioSrc?: string
  subtitles?: SubtitleSegment[]
  fontFamily?: string
  textColor?: string
  className?: string
}

export interface SubtitleSegment {
  text: string
  startTime: number
  endTime: number
}

export function VideoPlayer({
  videoSrc,
  audioSrc,
  subtitles = [],
  fontFamily = "Arial",
  textColor = "white",
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("")

  // Initialize audio element when audioSrc changes
  useEffect(() => {
    if (!audioSrc) return

    const audio = new Audio(audioSrc)
    audioRef.current = audio

    audio.addEventListener("timeupdate", handleAudioTimeUpdate)
    audio.addEventListener("ended", handleMediaEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleAudioTimeUpdate)
      audio.removeEventListener("ended", handleMediaEnded)
      audio.pause()
      audioRef.current = null
    }
  }, [audioSrc])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      updateCurrentSubtitle(video.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(video.duration)
    }

    video.addEventListener("timeupdate", handleVideoTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("ended", handleMediaEnded)

    return () => {
      video.removeEventListener("timeupdate", handleVideoTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("ended", handleMediaEnded)
    }
  }, [])

  // Handle audio time update
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return
    updateCurrentSubtitle(audioRef.current.currentTime)
  }

  // Update current subtitle based on time
  const updateCurrentSubtitle = (time: number) => {
    const subtitle = subtitles.find((sub) => time >= sub.startTime && time <= sub.endTime)
    setCurrentSubtitle(subtitle ? subtitle.text : "")
  }

  // Handle play/pause
  const togglePlayback = () => {
    const video = videoRef.current
    const audio = audioRef.current

    if (!video) return

    if (isPlaying) {
      video.pause()
      if (audio) audio.pause()
    } else {
      video.play()
      if (audio) {
        audio.currentTime = video.currentTime
        audio.play()
      }
    }

    setIsPlaying(!isPlaying)
  }

  // Handle media ended
  const handleMediaEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentSubtitle("")
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    const audio = audioRef.current

    if (!video) return

    if (audio) {
      audio.muted = !isMuted
    } else {
      video.muted = !isMuted
    }

    setIsMuted(!isMuted)
  }

  // Format time display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full max-h-[200px] h-auto"
        playsInline
        loop={false}
        muted={audioRef.current ? true : isMuted}
      />

      {/* Subtitles */}
      {currentSubtitle && (
        <div
          className="absolute bottom-16 left-0 right-0 text-center px-4 py-2"
          style={{
            textShadow: "0px 0px 4px rgba(0, 0, 0, 0.8)",
            fontFamily: fontFamily || "Arial",
            color: textColor || "white",
          }}
        >
          <p className="text-xl font-semibold">{currentSubtitle}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="text-xs text-white">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1 mx-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number.parseFloat(e.target.value)
              setCurrentTime(newTime)

              if (videoRef.current) {
                videoRef.current.currentTime = newTime
              }

              if (audioRef.current) {
                audioRef.current.currentTime = newTime
              }

              updateCurrentSubtitle(newTime)
            }}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

