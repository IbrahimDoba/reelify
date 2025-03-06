"use server"

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/serverSession";
import { redirect } from "next/navigation";

export async function fetchProjectDetails(projectId: string) {
  const session = await getCurrentUser();
  console.log(session)
  if (!session) {
    redirect("/login");
  }

  try {
    const project = await db.project.findUnique({
      where: { 
        id: projectId,
        userId: session.id 
      },
      select: {
        id: true,
        title: true,
        uploadedVideoUrl: true,
        ttsAudioUrl: true,
      }
    });

    if (!project) {
      redirect("/projects");
    }

    return project;
  } catch (error) {
    console.error("Project fetch error:", error);
    redirect("/projects");
  }
}