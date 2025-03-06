import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { UTApi } from "uploadthing/server";
import type { SubtitleSegment } from "@/components/video/video-player";
import { promises as fs } from 'fs';

const utapi = new UTApi();

export async function POST(request: Request) {
  try {
    const { videoUrl, audioUrl, subtitles, fontFamily, textColor } = await request.json();

    if (!subtitles || !Array.isArray(subtitles)) {
      throw new Error("Invalid subtitles data");
    }

    // Create subtitles string in SRT format
    const subtitlesStr = subtitles
      .map((sub: SubtitleSegment, i: number) => {
        const start = formatTime(sub.startTime);
        const end = formatTime(sub.endTime);
        return `${i + 1}\n${start} --> ${end}\n${sub.text}\n`;
      })
      .join("\n");

    // Create a temporary file for subtitles
    const subtitlePath = `/tmp/subtitles-${Date.now()}.srt`;
    await fs.writeFile(subtitlePath, subtitlesStr);

    // Process video with ffmpeg
    const outputPath = `/tmp/processed-${Date.now()}.mp4`;

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoUrl)
        .input(audioUrl)
        .input(subtitlePath)  // Use the file path instead of pipe
        .addOptions([
          '-map 0:v',
          '-map 1:a',
          '-c:v copy',
          '-c:a aac',
          `-vf subtitles=${subtitlePath}:force_style='FontName=${fontFamily},FontSize=24,PrimaryColour=${textColor}'`
        ])
        .format('mp4')
        .on('error', reject)
        .on('end', resolve)
        .save(outputPath);
    });

    // Upload to UploadThing
    const processedFileBuffer = await fs.readFile(outputPath);
    const processedFile = new File([processedFileBuffer], 'processed.mp4', { type: 'video/mp4' });
    const uploadResponse = await utapi.uploadFiles([processedFile]);

    // Clean up temporary files
    await Promise.all([
      fs.unlink(subtitlePath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {})
    ]);

    if (!uploadResponse[0]?.data?.url) {
      throw new Error("Failed to upload processed video");
    }

    return NextResponse.json({ 
      success: true, 
      videoUrl: uploadResponse[0].data.url 
    });

  } catch (error) {
    console.error("Video processing error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Video processing failed" 
    }, { status: 500 });
  }
}

// Helper function to format time for subtitles (HH:MM:SS,mmm)
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}