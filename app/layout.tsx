import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth"
import { QuizProvider } from "@/lib/quiz-store"
import { StudentProvider } from "@/lib/student-store"
import { SecurityProvider } from "@/lib/security-monitor"
import { NotificationProvider } from "@/lib/notification-store"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "QuizMaster - Educational Quiz Platform",
  description: "A comprehensive quiz platform for students and teachers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <QuizProvider>
              <StudentProvider>
                <NotificationProvider>
                  <SecurityProvider>
                    {children}
                    <Toaster />
                  </SecurityProvider>
                </NotificationProvider>
              </StudentProvider>
            </QuizProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
