import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PollList } from "@/components/polls/poll-list"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { BarChart3, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">PollCraft</h1>
          </div>
          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Polls</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Create and manage your interactive polls</p>
          </div>
          <Button asChild>
            <Link href="/polls/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Link>
          </Button>
        </div>

        <PollList polls={polls || []} />
      </main>
    </div>
  )
}
