import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/project-component/project-list";
import { ProjectSearch } from "@/components/project-component/project-search";
import { getCurrentUser } from "@/lib/serverSession";
import { redirect } from "next/navigation";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { query?: string }
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
        <div className="flex items-center gap-4">
          <ProjectSearch />
          <Button asChild size="sm">
            <Link href="/projects/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>
      
      <ProjectList searchQuery={searchParams?.query || ""} />
    </div>
  )
}