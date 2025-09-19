"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {user.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  )
}
