// app/actions/video-processing.ts
"use server";

export async function mergeVideoAudio(videoUrl: string, audioUrl: string) {
  try {
    // Connect to your Node.js backend
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${apiUrl}/api/v1/video/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl, audioUrl }),
      // Include this if needed for server-side fetching in Next.js
      next: { revalidate: 0 }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error response from API:", data);
      return {
        success: false,
        videoUrl: null,
        error: data.error || 'Video processing failed'
      };
    }
    
    // Process the successful response
    return {
      success: true,
      videoUrl: Array.isArray(data.videoUrl) 
        ? data.videoUrl[0].url 
        : data.videoUrl,
      error: null
    };
  } catch (error) {
    console.error("Error in mergeVideoAudio server action:", error);
    return {
      success: false,
      videoUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}