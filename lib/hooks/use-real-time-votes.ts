"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Vote {
  option_index: number
}

export function useRealTimeVotes(pollId: string, initialVotes: Vote[] = []) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const supabase = createClient()

  useEffect(() => {
    // Set initial votes
    setVotes(initialVotes)

    // Subscribe to real-time changes for authenticated votes
    const votesChannel = supabase
      .channel(`poll-votes-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log("[v0] New vote received:", payload.new)
          setVotes((prev) => [...prev, { option_index: payload.new.option_index }])
        },
      )
      .subscribe()

    // Subscribe to real-time changes for anonymous votes
    const anonymousVotesChannel = supabase
      .channel(`poll-anonymous-votes-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anonymous_votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log("[v0] New anonymous vote received:", payload.new)
          setVotes((prev) => [...prev, { option_index: payload.new.option_index }])
        },
      )
      .subscribe()

    return () => {
      votesChannel.unsubscribe()
      anonymousVotesChannel.unsubscribe()
    }
  }, [pollId, supabase])

  return votes
}
