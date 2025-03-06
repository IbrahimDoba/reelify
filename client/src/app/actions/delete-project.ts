'use server';

import db from "@/lib/db";
import { getSession } from "@/lib/serverSession";
import { revalidatePath } from "next/cache";

export async function deleteProject(projectId: string) {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Ensure the user can only delete their own projects
  const project = await db.project.findUnique({
    where: { 
      id: projectId,
      userId: session.user.id 
    }
  });

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }

  // Delete the project and its associated rendered videos
  await db.project.delete({
    where: { id: projectId }
  });

  // Revalidate the projects page to reflect the deletion
  revalidatePath('/projects');

  return { success: true };
}