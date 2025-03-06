import type { SubtitleSegment } from "@/components/video/video-player"

export type VideoProcessingResult = {
  success: boolean
  videoUrl?: string
  subtitles?: SubtitleSegment[]
  error?: string
} 

// Template video options for the application
export const TEMPLATE_VIDEOS = [
  {
    id: 'template-1',
    name: 'Business Presentation',
    url: 'https://example.com/videos/business-presentation.mp4',
    thumbnail: '/thumbnails/business-presentation.jpg',
    duration: 60, // in seconds
    category: 'business'
  },
  {
    id: 'template-2',
    name: 'Product Showcase',
    url: 'https://example.com/videos/product-showcase.mp4',
    thumbnail: '/thumbnails/product-showcase.jpg',
    duration: 45,
    category: 'marketing'
  },
  {
    id: 'template-3',
    name: 'Social Media Ad',
    url: 'https://example.com/videos/social-media-ad.mp4',
    thumbnail: '/thumbnails/social-media-ad.jpg',
    duration: 30,
    category: 'social'
  },
  {
    id: 'template-4',
    name: 'Educational Tutorial',
    url: 'https://example.com/videos/educational-tutorial.mp4',
    thumbnail: '/thumbnails/educational-tutorial.jpg',
    duration: 120,
    category: 'education'
  },
  {
    id: 'template-5',
    name: 'Travel Montage',
    url: 'https://example.com/videos/travel-montage.mp4',
    thumbnail: '/thumbnails/travel-montage.jpg',
    duration: 90,
    category: 'travel'
  },
  {
    id: 'template-6',
    name: 'Event Promotion',
    url: 'https://example.com/videos/event-promotion.mp4',
    thumbnail: '/thumbnails/event-promotion.jpg',
    duration: 60,
    category: 'events'
  }
];