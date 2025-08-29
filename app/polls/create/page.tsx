import { CreatePollForm } from "@/components/polls/create-poll-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserNav } from "@/components/auth/user-nav"
import { BarChart3, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CreatePollPage() {
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Poll</CardTitle>
              <CardDescription>Build an engaging poll with multiple options and real-time results</CardDescription>
            </CardHeader>
            <CardContent>
              <CreatePollForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
