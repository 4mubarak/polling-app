import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET(request: NextRequest, { params }: { params: { pollId: string } }) {
  try {
    const supabase = await createServerSupabaseClient()

    // Verify poll exists and get share_id
    const { data: poll, error } = await supabase.from("polls").select("share_id").eq("id", params.pollId).single()

    if (error || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Generate QR code URL
    const pollUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/p/${poll.share_id}`

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(pollUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#1f2937", // gray-800
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })

    // Convert data URL to buffer
    const base64Data = qrCodeDataURL.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("QR code generation error:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
