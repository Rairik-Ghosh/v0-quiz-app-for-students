"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useQuiz } from "@/lib/quiz-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Plus, Settings, Clock, Users, Shield, Edit } from "lucide-react"
import { QuizBuilder } from "@/components/quiz-builder"
import { QuizManager } from "@/components/quiz-manager"
import { NotificationCenter } from "@/components/notification-center"

type View = "dashboard" | "create" | "manage"

export function TeacherDashboard() {
  const { user, logout } = useAuth()
  const { quizzes } = useQuiz()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)

  const liveQuizzes = quizzes.filter((quiz) => quiz.isLive)
  const draftQuizzes = quizzes.filter((quiz) => !quiz.isLive)

  if (currentView === "create") {
    return <QuizBuilder onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "manage") {
    return <QuizManager onBack={() => setCurrentView("dashboard")} selectedQuizId={selectedQuizId} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">QuizMaster</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("create")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create Quiz
              </CardTitle>
              <CardDescription>Build new quizzes with custom questions and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Creating</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("manage")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Manage Quizzes
              </CardTitle>
              <CardDescription>View, edit, and monitor your existing quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View All Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Overview */}
        <div className="space-y-6">
          {/* Live Quizzes */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Live Quizzes ({liveQuizzes.length})
            </h2>
            {liveQuizzes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No live quizzes at the moment
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                          Live
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quiz.timeLimit}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {Object.values(quiz.securitySettings).filter(Boolean).length} rules
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuizId(quiz.id)
                            setCurrentView("manage")
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Draft Quizzes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Draft Quizzes ({draftQuizzes.length})</h2>
            {draftQuizzes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No draft quizzes. Create your first quiz to get started!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quiz.timeLimit}m
                        </div>
                        <div>{quiz.questions.length} questions</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuizId(quiz.id)
                            setCurrentView("manage")
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
