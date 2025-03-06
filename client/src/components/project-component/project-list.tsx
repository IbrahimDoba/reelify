import db from "@/lib/db";
import { EmptyState } from "./empty-state";
import { ProjectItem } from "./project-item";
import { getSession } from "@/lib/serverSession";


export async function ProjectList({ searchQuery }: { searchQuery?: string }) {
  const session = await getSession();
  if (!session?.user) return null;

  const projects = await db.project.findMany({
    where: {
      userId: session.user.id,
      title: {
        contains: searchQuery,
        mode: 'insensitive',
      }
    },
    include: {
      renderedVideos: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectItem 
          key={project.id} 
          project={project} 
          latestRender={project.renderedVideos[0]}
        />
      ))}
    </div>
  )
}