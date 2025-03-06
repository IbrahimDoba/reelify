'use server'

import { UTApi } from "uploadthing/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";

// Initialize the UploadThing API
const utapi = new UTApi();

// Define the response type
type UploadResponse = {
  success: boolean;
  videoUrl?: string;
  error?: string;
  projectId?: string;
}

export async function uploadVideo(file: File,projectId:string): Promise<UploadResponse> {
  try {
    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File is too large. Maximum file size is 10MB."
      };
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      return {
        success: false,
        error: "Please upload a valid video file."
      };
    }

    // Upload using the UploadThing API
    const response = await utapi.uploadFiles([file]);

    // Validate the response
    if (!response || !response[0] || !response[0].data?.ufsUrl) {
      return {
        success: false,
        error: "Upload failed. Please try again."
      };
    }
    await db.project.update({
      where: { id: projectId },
      data: { uploadedVideoUrl: response[0].data?.ufsUrl },
    });

    // Revalidate the path to update the UI
    revalidatePath('/');

    // Return success with the video URL
    return {
      success: true,
      videoUrl: response[0].data?.ufsUrl
    };
  } catch (error) {
    console.error("Video upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during upload. Please try again."
    };
  }
}