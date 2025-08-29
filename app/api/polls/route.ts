import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, options, settings, expires_at } = body

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Poll title is required" }, { status: 400 })
    }

    const validOptions = options?.filter((option: any) => option.text?.trim())
    if (!validOptions || validOptions.length < 2) {
      return NextResponse.json({ error: "At least 2 options are required" }, { status: 400 })
    }

    // Generate unique share_id
    const share_id = Math.random().toString(36).substring(2, 15)

    const pollData = {
      title: title.trim(),
      description: description?.trim() || null,
      creator_id: user.id,
      share_id,
      options: validOptions,
      settings: settings || {
        allowMultipleVotes: false,
        showResults: "after_vote",
        isPublic: true,
      },
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    }

    const { data: poll, error: insertError } = await supabase.from("polls").insert(pollData).select().single()

    if (insertError) {
      console.error("Database error:", insertError)
      return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
    }

    return NextResponse.json({ poll }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: polls, error } = await supabase
      .from("polls")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
    }

    return NextResponse.json({ polls })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
