"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Share2, BarChart3 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import type { Poll } from "@/types/database"

interface PollListProps {
  polls: Poll[]
}

export function PollList({ polls }: PollListProps) {
  if (polls.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">No polls yet</CardTitle>
          <CardDescription className="mb-4">Create your first poll to get started</CardDescription>
          <Button asChild>
            <Link href="/polls/create">Create Your First Poll</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg line-clamp-2">{poll.title}</CardTitle>
                {poll.description && <CardDescription className="line-clamp-2">{poll.description}</CardDescription>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/polls/${poll.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Poll
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/polls/${poll.id}/results`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Results
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/p/${poll.share_id}`}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Link
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={poll.settings.isPublic ? "default" : "secondary"}>
                  {poll.settings.isPublic ? "Public" : "Private"}
                </Badge>
                <span className="text-sm text-muted-foreground">{poll.options.length} options</span>
              </div>
              <span className="text-sm text-muted-foreground">{new Date(poll.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" asChild className="flex-1">
                <Link href={`/polls/${poll.id}`}>View</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href={`/polls/${poll.id}/results`}>Results</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
