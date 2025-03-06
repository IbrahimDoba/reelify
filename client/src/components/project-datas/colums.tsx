'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Project } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Edit, Trash, Eye } from 'lucide-react'
import Link from 'next/link'

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('title')}
        <div className="text-xs text-muted-foreground mt-1">
          ID: {row.original.id.slice(0, 8)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'content',
    header: 'Content Preview',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-sm">
        {row.getValue('content')}
      </div>
    ),
  },
  {
    accessorKey: 'backgroundVideo',
    header: 'Background',
    cell: ({ row }) => {
      const videoUrl = row.getValue('backgroundVideo') as string
      return (
        <div className="text-sm">
          {videoUrl.split('/').pop()}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/editor/${project.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-red-600 cursor-pointer">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <Link href={`/preview/${project.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]