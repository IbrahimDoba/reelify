import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown,  } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description: string
  trend?: "up" | "down"
}

export function StatsCard({ title, value, description, trend }: StatsCardProps) {
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}