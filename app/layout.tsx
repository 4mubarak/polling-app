import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import cn from "classnames"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontSans = GeistSans
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${fontSans.style.fontFamily};
  --font-sans: ${fontSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
