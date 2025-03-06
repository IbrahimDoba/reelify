import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit2, MoreVertical, Play, Trash } from "lucide-react"
import Link from "next/link"

export function ProjectList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Marketing Video</TableCell>
          <TableCell>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
              Completed
            </span>
          </TableCell>
          <TableCell>Apr 23, 2024</TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="icon">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        {/* Add more rows as needed */}
      </TableBody>
    </Table>
  )
} 