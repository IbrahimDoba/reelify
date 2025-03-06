'use client'

import { Activity, Upload, Video, Edit } from "lucide-react"
import { format } from "date-fns"

type ActivityType = {
  id: string
  type: 'upload' | 'edit' | 'render'
  title: string
  timestamp: Date
  description?: string
}

const activities: ActivityType[] = [
  {
    id: '1',
    type: 'upload',
    title: 'New video uploaded',
    timestamp: new Date('2024-03-20'),
    description: 'nature-background.mp4'
  },
  {
    id: '2',
    type: 'render',
    title: 'Video rendering completed',
    timestamp: new Date('2024-03-19'),
    description: 'Morning Motivation'
  },
  {
    id: '3',
    type: 'edit',
    title: 'Project edited',
    timestamp: new Date('2024-03-18'),
    description: 'Daily Inspiration'
  },
]

const getActivityIcon = (type: ActivityType['type']) => {
  switch (type) {
    case 'upload': return <Upload className="h-4 w-4" />
    case 'render': return <Video className="h-4 w-4" />
    case 'edit': return <Edit className="h-4 w-4" />
    default: return <Activity className="h-4 w-4" />
  }
}

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className="bg-muted p-2 rounded-full">
              {getActivityIcon(activity.type)}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{activity.title}</h4>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
            <time className="text-xs text-muted-foreground">
              {format(activity.timestamp, 'MMM dd, h:mm a')}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}