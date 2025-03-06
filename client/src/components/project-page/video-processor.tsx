"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PreviewVideoPlayer } from "../video/video-processing-preview";
import { mergeAndSaveVideo } from "@/app/actions/merge";

interface VideoProcessorProps {
  videoUrl: string | null;
  audioUrl: string | null;
  projectId: string;
}

export function VideoProcessor({ videoUrl, audioUrl, projectId }: VideoProcessorProps) {
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateVideo = async () => {
    if (!videoUrl || !audioUrl) {
      toast.error("Please select both a video and generate audio first");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await mergeAndSaveVideo(videoUrl, audioUrl, projectId);
      console.log(result)
      if (result.success && result.videoUrl) {
        setMergedUrl(result.videoUrl);
        setIsModalOpen(true);
        toast.success("Video created and saved successfully");
      } else {
        toast.error(result.error || "Failed to create video");
      }
    } catch (error) {
      toast.error("Video creation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!mergedUrl) return;

    const link = document.createElement('a');
    link.href = mergedUrl;
    link.download = `project_${projectId}_video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Button
        size="lg"
        onClick={handleCreateVideo}
        disabled={isProcessing || !videoUrl || !audioUrl || !!mergedUrl}
        className="w-full"
      >
        {mergedUrl ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Video Created
          </>
        ) : isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {!mergedUrl && !isProcessing && "Create Final Video"}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Generated Video Preview</DialogTitle>
            <DialogDescription>
              Your video has been successfully created. You can preview and download it below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <PreviewVideoPlayer
              src={mergedUrl || ''}
              controls
              className="w-full rounded-lg"
            />
            
            <Button 
              onClick={handleDownloadVideo} 
              className="w-full"
              disabled={!mergedUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}