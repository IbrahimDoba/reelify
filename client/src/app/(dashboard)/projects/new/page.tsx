"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/create-project";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    setIsCreating(true);
    try {
      const newProject = await createProject(projectName);
      
      if ('id' in newProject) {
        toast.success("Project created successfully");
        router.push(`/projects/${newProject.id}`);
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Project creation failed:", error);
      toast.error("An error occurred while creating the project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-xl">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Start your video creation journey by giving your project a name
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isCreating}
            className="w-full"
          />
          
          <Button 
            onClick={handleCreateProject} 
            disabled={isCreating || !projectName.trim()}
            className="w-full"
          >
            {isCreating ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}