import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ProjectList } from "./project-list"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Video
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Available Credits"
          value="120"
          description="Purchase more credits"
          trend="up"
        />
        <StatsCard
          title="Videos Generated"
          value="8"
          description="This month"
        />
        <StatsCard
          title="Storage Used"
          value="2.4GB"
          description="Of 10GB quota"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectList />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              Import Script
            </Button>
            <Button className="w-full" variant="outline">
              Browse Templates
            </Button>
            <Button className="w-full" variant="outline">
              View Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}