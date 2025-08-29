"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus } from "lucide-react"
import type { Poll } from "@/types/database"

interface EditPollFormProps {
  poll: Poll
}

export function EditPollForm({ poll }: EditPollFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: poll.title,
    description: poll.description || "",
    options: poll.options,
    settings: poll.settings,
    expires_at: poll.expires_at ? new Date(poll.expires_at).toISOString().slice(0, 16) : "",
  })

  const addOption = () => {
    const newOption = { id: Date.now().toString(), text: "" }
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const updateOption = (index: number, text: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? { ...option, text } : option)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update poll")
      }

      toast({
        title: "Poll updated",
        description: "Your poll has been successfully updated.",
      })

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Poll Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter your poll question"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add more context to your poll"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Poll Options</Label>
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="w-full bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <div className="space-y-4">
            <Label>Poll Settings</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Make poll public</Label>
              <Switch
                id="isPublic"
                checked={formData.settings.isPublic}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, isPublic: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMultipleVotes">Allow multiple votes per user</Label>
              <Switch
                id="allowMultipleVotes"
                checked={formData.settings.allowMultipleVotes}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, allowMultipleVotes: checked },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="showResults">Show results</Label>
              <Select
                value={formData.settings.showResults}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, showResults: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="after_vote">After voting</SelectItem>
                  <SelectItem value="always">Always visible</SelectItem>
                  <SelectItem value="never">Never show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Poll"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
