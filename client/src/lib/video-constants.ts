export type VideoSource = {
  id: string
  name: string
  url: string
  thumbnail: string
}

export const TEMPLATE_VIDEOS: VideoSource[] = [
  {
    id: "nature1",
    name: "Forest Stream",
    url: "/videos/forest-stream.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "minecraft1",
    name: "minecraft video",
    url: "/videos/minecraft.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "minecraft2",
    name: "minecraft video 2",
    url: "/videos/minescraft-2.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  // ... rest of the template videos
] 