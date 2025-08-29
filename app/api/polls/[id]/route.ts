import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: poll, error } = await supabase.from("polls").select("*").eq("id", params.id).single()

    if (error) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify ownership
    const { data: existingPoll, error: fetchError } = await supabase
      .from("polls")
      .select("creator_id")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (existingPoll.creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData = {
      title: title?.trim(),
      description: description?.trim() || null,
      options,
      settings,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { data: poll, error: updateError } = await supabase
      .from("polls")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify ownership
    const { data: existingPoll, error: fetchError } = await supabase
      .from("polls")
      .select("creator_id")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (existingPoll.creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: deleteError } = await supabase.from("polls").delete().eq("id", params.id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 })
    }

    return NextResponse.json({ message: "Poll deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
