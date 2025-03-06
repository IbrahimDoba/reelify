"use client"
import { useState } from "react";
import TextToSpeech from "@/components/project-page/text-to-speech";
import { VideoProcessor } from "@/components/project-page/video-processor";
import VideoUpload from "@/components/project-page/video-upload";
import { createProject } from "@/app/actions/create-project";

export default function VideoCreationPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    
    try {
      const newProject = await createProject(projectName);
      if ('id' in newProject) {
        setProjectId(newProject.id);
      }
    } catch (error) {
      console.error("Project creation failed:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Project Creation Section */}
      {!projectId ? (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Project Header */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h1 className="text-2xl font-bold">{projectName}</h1>
            {/* <p className="text-gray-600">Project ID: {projectId}</p> */}
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
        </>
      )}
    </div>
  );
}