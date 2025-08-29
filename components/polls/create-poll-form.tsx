"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, X } from "lucide-react"
import type { PollOption } from "@/types/database"

export function CreatePollForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ])
  const [isPublic, setIsPublic] = useState(true)
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const addOption = () => {
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: "",
    }
    setOptions([...options, newOption])
  }

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((option) => option.id !== id))
    }
  }

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, text } : option)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!title.trim()) {
      setError("Poll title is required")
      setLoading(false)
      return
    }

    const validOptions = options.filter((option) => option.text.trim())
    if (validOptions.length < 2) {
      setError("At least 2 options are required")
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to create a poll")
        setLoading(false)
        return
      }

      const pollData = {
        title: title.trim(),
        description: description.trim() || null,
        creator_id: user.id,
        options: validOptions,
        settings: {
          allowMultipleVotes,
          showResults: "after_vote" as const,
          isPublic,
        },
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      }

      const { data: poll, error: insertError } = await supabase.from("polls").insert(pollData).select().single()

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push(`/polls/${poll.id}`)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Poll Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context to your poll..."
            rows={3}
          />
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-4">
        <Label>Poll Options *</Label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <Card key={option.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Option {index + 1}</span>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Enter option ${index + 1}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addOption} className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <Label>Poll Settings</Label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Public Poll</Label>
              <p className="text-sm text-muted-foreground">Allow anyone to vote without signing in</p>
            </div>
            <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowMultiple">Allow Multiple Votes</Label>
              <p className="text-sm text-muted-foreground">Let users select multiple options</p>
            </div>
            <Switch id="allowMultiple" checked={allowMultipleVotes} onCheckedChange={setAllowMultipleVotes} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Poll
      </Button>
    </form>
  )
}
