"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Upload } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/video/file-uploader";
import { TEMPLATE_VIDEOS } from "@/lib/video-constants";
interface VideoUploadProps {
  onVideoSelected: (url: string) => void;
  projectId : string | null;
}
export default function VideoUpload({ onVideoSelected, projectId  }: VideoUploadProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);

  const handleSelectTemplateVideo = (videoUrl: string, videoName: string) => {
    setSelectedVideoUrl(videoUrl);
    setSelectedVideoName(videoName);
    onVideoSelected(videoUrl); 
    setShowTemplates(false);
    toast.success(`Selected template: ${videoName}`);
  };

  const handleVideoUploadComplete = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    onVideoSelected(videoUrl); 
    setSelectedVideoName("Uploaded Video");
    toast.success("Video uploaded successfully");
  };

  const handleVideoUploadError = (error: string) => {
    toast.error(error || "An error occurred during upload");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Video Selection</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Video Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant={!showTemplates ? "default" : "outline"}
              size="lg"
              className="flex-1 h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => setShowTemplates(false)}
            >
              <Upload className="h-6 w-6" />
              <div>
                <div>Upload Video</div>
                <div className="text-xs text-muted-foreground">
                  (1 min, max 10MB)
                </div>
              </div>
            </Button>
            <Button
              variant={showTemplates ? "default" : "outline"}
              size="lg"
              className="flex-1 h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => setShowTemplates(true)}
            >
              <div>Use Template Videos</div>
            </Button>
          </div>

          {showTemplates ? (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {TEMPLATE_VIDEOS.map((video) => (
                  <div
                    key={video.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleSelectTemplateVideo(video.url, video.name)}
                  >
                    <div className="relative rounded-md overflow-hidden">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.name}
                        className="w-full min-h-[120px] object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-sm mt-1">{video.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <FileUpload
              onUploadComplete={handleVideoUploadComplete}
              onUploadError={handleVideoUploadError}
              maxSizeMB={10}
            />
          )}

          {selectedVideoUrl && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">Selected Video: {selectedVideoName}</h3>
              <video
                src={selectedVideoUrl}
                className="w-full max-h-[400px] object-contain rounded-md"
                controls
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}