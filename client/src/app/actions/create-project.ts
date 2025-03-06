// app/actions/project-actions.ts
"use server"

import db from "@/lib/db";
import { getSession } from "@/lib/serverSession";



export async function createProject(projectName: string) {
  try {
    const user = await getSession();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!projectName.trim()) {
      throw new Error("Project name cannot be empty");
    }

    const newProject = await db.project.create({
      data: {
        title: projectName,
        content: "",
        userId: user.user.id
      }
    });

    return newProject;
  } catch (error) {
    console.error("Project creation failed:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to create project"
    };
  }
}