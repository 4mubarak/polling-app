import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import Link from "next/link"
import { BarChart3, Users, Zap, QrCode } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">PollCraft</h1>
          </div>
          <UserNav />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Create Engaging Polls in Seconds
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
            Build interactive polls, gather real-time responses, and share with QR codes. Perfect for events,
            classrooms, and team meetings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Watch votes come in live with instant updates and beautiful visualizations
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">QR Code Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate QR codes for instant poll access - perfect for events and presentations
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Anonymous Voting</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Support both authenticated and anonymous voting for maximum participation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
