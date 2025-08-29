import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditPollForm } from "@/components/polls/edit-poll-form"

interface EditPollPageProps {
  params: {
    id: string
  }
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", params.id)
    .eq("creator_id", user.id)
    .single()

  if (error || !poll) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Poll</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Update your poll details and settings</p>
          </div>
          <EditPollForm poll={poll} />
        </div>
      </div>
    </div>
  )
}
