"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useQuiz } from "@/lib/quiz-store"
import { useStudent } from "@/lib/student-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Play, Clock, Shield, CheckCircle, AlertCircle, BookOpen } from "lucide-react"
import { QuizTaking } from "@/components/quiz-taking"

type View = "dashboard" | "taking-quiz"

export function StudentDashboard() {
  const { user, logout } = useAuth()
  const { quizzes } = useQuiz()
  const { getQuizAttempts } = useStudent()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)

  // Filter live quizzes that students can take
  const availableQuizzes = quizzes.filter((quiz) => quiz.isLive)

  // Get completed quizzes for this student
  const completedQuizzes = availableQuizzes.filter((quiz) => {
    const attempts = getQuizAttempts(quiz.id, user?.id || "")
    return attempts.some((attempt) => attempt.isCompleted)
  })

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId)
    setCurrentView("taking-quiz")
  }

  const handleQuizComplete = () => {
    setCurrentView("dashboard")
    setSelectedQuizId(null)
  }

  if (currentView === "taking-quiz" && selectedQuizId) {
    return (
      <QuizTaking quizId={selectedQuizId} onComplete={handleQuizComplete} onBack={() => setCurrentView("dashboard")} />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">QuizMaster</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{availableQuizzes.length}</p>
                    <p className="text-sm text-muted-foreground">Available Quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedQuizzes.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{availableQuizzes.length - completedQuizzes.length}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Quizzes */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Available Quizzes
            </h2>
            {availableQuizzes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No quizzes available</p>
                  <p>Check back later for new quizzes from your teachers</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableQuizzes.map((quiz) => {
                  const attempts = getQuizAttempts(quiz.id, user?.id || "")
                  const isCompleted = attempts.some((attempt) => attempt.isCompleted)
                  const hasActiveAttempt = attempts.some((attempt) => !attempt.isCompleted)

                  return (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <div className="flex gap-1">
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                            {hasActiveAttempt && !isCompleted && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {Object.values(quiz.securitySettings).filter(Boolean).length} security rules
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p>{quiz.questions.length} questions</p>
                          {Object.values(quiz.securitySettings).some(Boolean) && (
                            <p className="text-amber-600 mt-1">⚠️ Security monitoring enabled</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {isCompleted ? (
                            <Button variant="outline" className="w-full bg-transparent" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </Button>
                          ) : (
                            <Button className="w-full" onClick={() => handleStartQuiz(quiz.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              {hasActiveAttempt ? "Continue Quiz" : "Start Quiz"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Completed Quizzes */}
          {completedQuizzes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Completed Quizzes
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedQuizzes.map((quiz) => {
                  const attempts = getQuizAttempts(quiz.id, user?.id || "")
                  const completedAttempt = attempts.find((attempt) => attempt.isCompleted)

                  return (
                    <Card key={quiz.id} className="opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          <p>Completed on: {completedAttempt?.completedAt?.toLocaleDateString()}</p>
                          <p>
                            {quiz.questions.length} questions • {quiz.timeLimit} minutes
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
