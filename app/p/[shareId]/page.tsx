import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PollView } from "@/components/polls/poll-view"
import { BarChart3 } from "lucide-react"

interface PublicPollPageProps {
  params: {
    shareId: string
  }
}

export default async function PublicPollPage({ params }: PublicPollPageProps) {
  const supabase = await createServerSupabaseClient()

  const { data: poll } = await supabase.from("polls").select("*").eq("share_id", params.shareId).single()

  if (!poll) {
    notFound()
  }

  // Get vote counts
  const { data: votes } = await supabase.from("votes").select("option_index").eq("poll_id", poll.id)

  const { data: anonymousVotes } = await supabase.from("anonymous_votes").select("option_index").eq("poll_id", poll.id)

  const allVotes = [...(votes || []), ...(anonymousVotes || [])]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">PollCraft</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <PollView poll={poll} votes={allVotes} />
      </main>
    </div>
  )
}
