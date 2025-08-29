import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ResultsView } from "@/components/polls/results-view"
import { UserNav } from "@/components/auth/user-nav"
import { BarChart3, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const supabase = await createServerSupabaseClient()

  const { data: poll } = await supabase.from("polls").select("*").eq("id", params.id).single()

  if (!poll) {
    notFound()
  }

  // Get vote counts
  const { data: votes } = await supabase.from("votes").select("option_index").eq("poll_id", params.id)

  const { data: anonymousVotes } = await supabase
    .from("anonymous_votes")
    .select("option_index")
    .eq("poll_id", params.id)

  const allVotes = [...(votes || []), ...(anonymousVotes || [])]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">PollCraft</h1>
            </div>
          </div>
          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ResultsView poll={poll} votes={allVotes} />
      </main>
    </div>
  )
}
