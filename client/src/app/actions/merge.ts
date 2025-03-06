// app/lib/merge.ts
"use server"

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/serverSession";



export async function mergeAndSaveVideo(
  videoUrl: string,
  audioUrl: string,
  projectId: string
) {
  try {
    // Verify user authentication
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Verify project ownership
    const project = await db.project.findUnique({
      where: { id: projectId, userId: user.id },
    });
    if (!project) throw new Error("Project not found or access denied");

    // Call merge API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/video/v1/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl, audioUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Merge failed');
    }

    const data = await response.json();
    console.log("Response Data:", data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to merge video and audio");
    }

    // Extracting URL correctly
    const videoData = Array.isArray(data.videoUrl) && data.videoUrl.length > 0 ? data.videoUrl[0].data : null;
    const finalUrl = videoData?.url || videoData?.appUrl || null;

    if (!finalUrl) {
      throw new Error("Failed to extract video URL");
    }

    // Save to database
    const renderedVideo = await db.renderedVideo.create({
      data: {
        videoUrl: finalUrl,
        projectId: projectId,
        resolution: "1080p",
        watermark: false,
      },
    });

    return {
      success: data.status === "completed",
      videoUrl: renderedVideo.videoUrl,
      error: null,
    };
  } catch (error) {
    console.error("Video merge error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Merge failed",
    };
  }
}