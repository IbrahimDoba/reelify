'use client';

import { useState } from 'react';
import { Film, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import type { Project, RenderedVideo } from "@prisma/client";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // Assuming you're using sonner for notifications
import { deleteProject } from '@/app/actions/delete-project';

interface ProjectItemProps {
  project: Project;
  latestRender?: RenderedVideo | null;
}

export function ProjectItem({ project, latestRender }: ProjectItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (latestRender?.videoUrl) {
      const link = document.createElement('a');
      link.href = latestRender.videoUrl;
      link.download = `${project.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      router.refresh(); // Refresh the page to remove the deleted project
    } catch (error) {
      console.error('Failed to delete project', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row justify-between items-start">
        <CardTitle className="line-clamp-2">{project.title}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="icon" 
              className="w-8 h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the project "{project.title}" 
                and cannot be undone. All associated data will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {latestRender?.videoUrl ? (
          <div className="w-full aspect-video">
            <video 
              src={latestRender.videoUrl} 
              controls 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-muted-foreground">
            <Film className="h-8 w-8 mr-2" />
            No video available
          </div>
        )}
      </CardContent>
      
      <div className="p-4 pt-0 flex space-x-2">
        <Button 
          onClick={handleDownload} 
          disabled={!latestRender?.videoUrl}
          className="flex-1"
        >
          Download Video
        </Button>
      </div>
    </Card>
  )
}