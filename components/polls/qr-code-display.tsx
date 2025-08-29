"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Share2, Check, QrCode, Smartphone } from "lucide-react"
import type { Poll } from "@/types/database"
import Image from "next/image"

interface QRCodeDisplayProps {
  poll: Poll
}

export function QRCodeDisplay({ poll }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const pollUrl = `${window.location.origin}/p/${poll.share_id}`
  const qrCodeUrl = `/api/qr/${poll.id}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadQRCode = async () => {
    setDownloading(true)
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `poll-${poll.share_id}-qr.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Failed to download QR code:", err)
    } finally {
      setDownloading(false)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: `Vote on this poll: ${poll.title}`,
          url: pollUrl,
        })
      } catch (err) {
        // User cancelled sharing or sharing failed
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Poll Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && <CardDescription className="text-base">{poll.description}</CardDescription>}
            </div>
            <Badge variant={poll.settings.isPublic ? "default" : "secondary"}>
              {poll.settings.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* QR Code Display */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-6 w-6" />
            QR Code
          </CardTitle>
          <CardDescription>Scan with any QR code reader or camera app to access the poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <Image
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code for ${poll.title}`}
                width={400}
                height={400}
                className="w-64 h-64 md:w-80 md:h-80"
                priority
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={downloadQRCode} disabled={downloading} variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Downloading..." : "Download"}
            </Button>
            <Button onClick={shareNative} variant="outline" className="bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={copyToClipboard} variant="outline" className="bg-transparent">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share Link</CardTitle>
          <CardDescription>Copy this link to share your poll directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareUrl">Poll URL</Label>
            <div className="flex gap-2">
              <Input id="shareUrl" value={pollUrl} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} size="sm" variant="outline" className="bg-transparent">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro tip:</strong> Most smartphones can scan QR codes directly with their camera app. Just point
              and tap the notification that appears!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium">Display the QR Code</h4>
                <p className="text-sm text-muted-foreground">
                  Show the QR code on a screen, projector, or print it out for your audience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium">Participants Scan</h4>
                <p className="text-sm text-muted-foreground">
                  Users scan with their phone camera or QR code app to instantly access the poll
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium">Watch Results Live</h4>
                <p className="text-sm text-muted-foreground">
                  See votes come in real-time as participants submit their responses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
