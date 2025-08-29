"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRealTimeVotes } from "@/lib/hooks/use-real-time-votes"
import { Loader2, Share2, QrCode, Users } from "lucide-react"
import type { Poll } from "@/types/database"
import Link from "next/link"

interface PollViewProps {
  poll: Poll
  votes: Array<{ option_index: number }>
}

export function PollView({ poll, votes: initialVotes }: PollViewProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<number[]>([])
  const { user } = useAuth()
  const supabase = createClient()

  const votes = useRealTimeVotes(poll.id, initialVotes)

  const voteCounts = poll.options.map((_, index) => votes.filter((vote) => vote.option_index === index).length)
  const totalVotes = votes.length

  useEffect(() => {
    const checkUserVote = async () => {
      if (user) {
        const { data: existingVotes } = await supabase
          .from("votes")
          .select("option_index")
          .eq("poll_id", poll.id)
          .eq("user_id", user.id)

        if (existingVotes && existingVotes.length > 0) {
          const userVoteIndexes = existingVotes.map((v) => v.option_index)
          setUserVote(userVoteIndexes)
          setHasVoted(true)
        }
      }
    }

    checkUserVote()
  }, [user, poll.id, supabase])

  const handleOptionSelect = (index: number) => {
    if (hasVoted) return // Prevent selection if already voted

    if (poll.settings.allowMultipleVotes) {
      setSelectedOptions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
    } else {
      setSelectedOptions([index])
    }
  }

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      setError("Please select at least one option")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (user) {
        // Authenticated vote
        for (const optionIndex of selectedOptions) {
          const { error: voteError } = await supabase.from("votes").insert({
            poll_id: poll.id,
            user_id: user.id,
            option_index: optionIndex,
          })

          if (voteError) {
            setError(voteError.message)
            setLoading(false)
            return
          }
        }
      } else {
        // Anonymous vote
        const sessionId = crypto.randomUUID()
        for (const optionIndex of selectedOptions) {
          const { error: voteError } = await supabase.from("anonymous_votes").insert({
            poll_id: poll.id,
            option_index: optionIndex,
            session_id: sessionId,
          })

          if (voteError) {
            setError(voteError.message)
            setLoading(false)
            return
          }
        }
      }

      setUserVote(selectedOptions)
      setHasVoted(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

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
            <div className="flex items-center gap-2">
              <Badge variant={poll.settings.isPublic ? "default" : "secondary"}>
                {poll.settings.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{totalVotes} votes</span>
            </div>
            <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
            {poll.expires_at && <span>Expires {new Date(poll.expires_at).toLocaleDateString()}</span>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!hasVoted ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOptions.includes(index)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedOptions.includes(index) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        />
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{voteCounts[index]} votes</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleVote} disabled={loading || selectedOptions.length === 0} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Vote{selectedOptions.length > 1 ? "s" : ""}
              </Button>

              {poll.settings.allowMultipleVotes && (
                <p className="text-sm text-muted-foreground text-center">You can select multiple options</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Thank you for voting! You voted for: {userVote.map((index) => poll.options[index].text).join(", ")}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.text}</span>
                        {userVote.includes(index) && (
                          <Badge variant="outline" className="text-xs">
                            Your vote
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {voteCounts[index]} votes ({getPercentage(voteCounts[index])}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          userVote.includes(index) ? "bg-blue-600" : "bg-gray-400"
                        }`}
                        style={{ width: `${getPercentage(voteCounts[index])}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Results update in real-time
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href={`/p/${poll.share_id}`}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href={`/polls/${poll.id}/qr`}>
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
