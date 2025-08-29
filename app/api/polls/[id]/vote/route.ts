import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { option_index, is_anonymous = false } = body

    // Validate option_index
    if (typeof option_index !== "number" || option_index < 0) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 })
    }

    // Get poll to check if it exists and is valid
    const { data: poll, error: pollError } = await supabase.from("polls").select("*").eq("id", params.id).single()

    if (pollError || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 })
    }

    // Validate option index against poll options
    if (option_index >= poll.options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 })
    }

    if (is_anonymous || !poll.settings?.isPublic) {
      // Anonymous vote
      const { data: vote, error: voteError } = await supabase
        .from("anonymous_votes")
        .insert({
          poll_id: params.id,
          option_index,
          ip_hash: request.headers.get("x-forwarded-for") || "unknown",
        })
        .select()
        .single()

      if (voteError) {
        return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
      }

      return NextResponse.json({ vote, message: "Vote recorded successfully" })
    } else {
      // Authenticated vote
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("poll_id", params.id)
        .eq("user_id", user.id)
        .single()

      if (existingVote && !poll.settings?.allowMultipleVotes) {
        return NextResponse.json({ error: "You have already voted on this poll" }, { status: 400 })
      }

      const { data: vote, error: voteError } = await supabase
        .from("votes")
        .insert({
          poll_id: params.id,
          user_id: user.id,
          option_index,
        })
        .select()
        .single()

      if (voteError) {
        return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
      }

      return NextResponse.json({ vote, message: "Vote recorded successfully" })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
