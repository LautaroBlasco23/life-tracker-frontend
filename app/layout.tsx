import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AppProvider } from "@/context/AppContext"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Productivity App",
  description: "Minimalistic productivity app for activities and finance tracking",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground`}>
        <Suspense fallback={null}>
          <AppProvider>{children}</AppProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
