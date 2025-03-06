import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
      <div className="text-6xl text-muted-foreground">
        🎬
      </div>
      <h2 className="text-2xl font-bold">No Projects Yet</h2>
      <p className="text-muted-foreground max-w-md">
        Start creating your first video project. It&apos;s easy to get started!
      </p>
      
      <Button asChild size="lg">
        <Link href="/new-project">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Project
        </Link>
      </Button>
    </div>
  )
}