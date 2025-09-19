"use client"

import { useState } from "react"
import { useQuiz, type Quiz } from "@/lib/quiz-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Shield, Play, Square, Trash2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizManagerProps {
  onBack: () => void
  selectedQuizId?: string | null
}

export function QuizManager({ onBack, selectedQuizId }: QuizManagerProps) {
  const { quizzes, updateQuiz, deleteQuiz } = useQuiz()
  const { toast } = useToast()
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(
    selectedQuizId ? quizzes.find((q) => q.id === selectedQuizId) || null : null,
  )

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
  }

  const handleTimeUpdate = (timeLimit: number) => {
    if (selectedQuiz) {
      updateQuiz(selectedQuiz.id, { timeLimit })
      setSelectedQuiz({ ...selectedQuiz, timeLimit })
    }
  }

  const handleSecurityUpdate = (setting: keyof Quiz["securitySettings"], value: boolean) => {
    if (selectedQuiz) {
      const newSettings = { ...selectedQuiz.securitySettings, [setting]: value }
      updateQuiz(selectedQuiz.id, { securitySettings: newSettings })
      setSelectedQuiz({ ...selectedQuiz, securitySettings: newSettings })
    }
  }

  const handleToggleLive = () => {
    if (selectedQuiz) {
      const newStatus = !selectedQuiz.isLive
      updateQuiz(selectedQuiz.id, { isLive: newStatus })
      setSelectedQuiz({ ...selectedQuiz, isLive: newStatus })
      toast({
        title: newStatus ? "Quiz is now live!" : "Quiz taken offline",
        description: newStatus ? "Students can now take this quiz" : "Quiz is no longer available to students",
      })
    }
  }

  const handleDeleteQuiz = () => {
    if (selectedQuiz) {
      deleteQuiz(selectedQuiz.id)
      setSelectedQuiz(null)
      toast({
        title: "Quiz deleted",
        description: "The quiz has been permanently removed",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Manage Quizzes</h1>
            <p className="text-sm text-muted-foreground">Configure quiz settings and monitor activity</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quiz List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Your Quizzes</h2>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`cursor-pointer transition-all ${
                    selectedQuiz?.id === quiz.id ? "ring-2 ring-primary" : "hover:shadow-md"
                  }`}
                  onClick={() => handleQuizSelect(quiz)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{quiz.title}</CardTitle>
                      <Badge variant={quiz.isLive ? "secondary" : "outline"}>{quiz.isLive ? "Live" : "Draft"}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {quiz.questions.length} questions • {quiz.timeLimit}m
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {quizzes.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No quizzes created yet</CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="lg:col-span-2">
            {selectedQuiz ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedQuiz.title}
                      <div className="flex gap-2">
                        <Button onClick={handleToggleLive} variant={selectedQuiz.isLive ? "destructive" : "default"}>
                          {selectedQuiz.isLive ? (
                            <>
                              <Square className="h-4 w-4 mr-2" />
                              Take Offline
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Make Live
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleDeleteQuiz}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{selectedQuiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          value={selectedQuiz.timeLimit}
                          onChange={(e) => handleTimeUpdate(Number.parseInt(e.target.value) || 0)}
                          min="1"
                          max="180"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedQuiz.questions.length} questions</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Configure authenticity safeguards for this quiz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="noTabSwitching">No Tab Switching</Label>
                        <p className="text-sm text-muted-foreground">Prevent students from switching browser tabs</p>
                      </div>
                      <Switch
                        id="noTabSwitching"
                        checked={selectedQuiz.securitySettings.noTabSwitching}
                        onCheckedChange={(checked) => handleSecurityUpdate("noTabSwitching", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="noMinimizing">No Minimizing</Label>
                        <p className="text-sm text-muted-foreground">
                          Prevent students from minimizing the browser window
                        </p>
                      </div>
                      <Switch
                        id="noMinimizing"
                        checked={selectedQuiz.securitySettings.noMinimizing}
                        onCheckedChange={(checked) => handleSecurityUpdate("noMinimizing", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="noRightClick">No Right Click</Label>
                        <p className="text-sm text-muted-foreground">Disable right-click context menu</p>
                      </div>
                      <Switch
                        id="noRightClick"
                        checked={selectedQuiz.securitySettings.noRightClick}
                        onCheckedChange={(checked) => handleSecurityUpdate("noRightClick", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="noScreenshot">No Screenshots</Label>
                        <p className="text-sm text-muted-foreground">Attempt to prevent screenshot capture</p>
                      </div>
                      <Switch
                        id="noScreenshot"
                        checked={selectedQuiz.securitySettings.noScreenshot}
                        onCheckedChange={(checked) => handleSecurityUpdate("noScreenshot", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a quiz from the list to manage its settings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
