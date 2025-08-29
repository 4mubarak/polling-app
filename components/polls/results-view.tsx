"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeVotes } from "@/lib/hooks/use-real-time-votes"
import { Users, TrendingUp } from "lucide-react"
import type { Poll } from "@/types/database"

interface ResultsViewProps {
  poll: Poll
  votes: Array<{ option_index: number }>
}

export function ResultsView({ poll, votes: initialVotes }: ResultsViewProps) {
  const votes = useRealTimeVotes(poll.id, initialVotes)

  const voteCounts = poll.options.map((_, index) => votes.filter((vote) => vote.option_index === index).length)
  const totalVotes = votes.length
  const maxVotes = Math.max(...voteCounts)

  const getPercentage = (count: number) => {
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && <CardDescription className="text-base">{poll.description}</CardDescription>}
            </div>
            <Badge variant={poll.settings.isPublic ? "default" : "secondary"}>
              {poll.settings.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{totalVotes} total votes</span>
            </div>
            <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {poll.options.map((option, index) => (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.text}</span>
                    {voteCounts[index] === maxVotes && maxVotes > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Leading
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {voteCounts[index]} votes ({getPercentage(voteCounts[index])}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      voteCounts[index] === maxVotes && maxVotes > 0 ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${getPercentage(voteCounts[index])}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Results update in real-time
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
