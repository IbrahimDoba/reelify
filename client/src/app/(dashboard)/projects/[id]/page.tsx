"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TextToSpeech from "@/components/project-page/text-to-speech";
import { VideoProcessor } from "@/components/project-page/video-processor";
import VideoUpload from "@/components/project-page/video-upload";
import { fetchProjectDetails } from "@/app/actions/fetch-project";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const params = useParams();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const projectId = params.id as string;
        const project = await fetchProjectDetails(projectId);
        
        if (project) {
          setProjectId(project.id);
          setProjectName(project.title);
        }
      } catch (error) {
        toast.error("Failed to load project");
        console.error(error);
      }
    }

    loadProject();
  }, [params.id]);

  // If project is not loaded yet
  if (!projectId) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Project Header */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h1 className="text-2xl font-bold">{projectName}</h1>
      </div>

      {/* Video Upload Section */}
      <VideoUpload 
        onVideoSelected={(url) => setVideoUrl(url)}
        projectId={projectId}
      />

      {/* Text-to-Speech Section */}
      <TextToSpeech 
        onAudioGenerated={(url) => setAudioUrl(url)}
        projectId={projectId}
      />

      {/* Video Processing Section */}
      <VideoProcessor 
        videoUrl={videoUrl}
        audioUrl={audioUrl}
        projectId={projectId}
      />
    </div>
  );
}