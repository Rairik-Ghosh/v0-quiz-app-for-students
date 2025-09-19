"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useQuiz } from "@/lib/quiz-store"
import { useStudent, type QuizAttempt } from "@/lib/student-store"
import { useSecurity } from "@/lib/security-monitor"
import { useSecurityMonitor } from "@/hooks/use-security-monitor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Send, AlertTriangle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SecurityOverlay } from "@/components/security-overlay"

interface QuizTakingProps {
  quizId: string
  onComplete: () => void
  onBack: () => void
}

export function QuizTaking({ quizId, onComplete, onBack }: QuizTakingProps) {
  const { user } = useAuth()
  const { getQuiz } = useQuiz()
  const { startQuiz, submitAnswer, completeQuiz, getQuizAttempts } = useStudent()
  const { violations, clearViolations } = useSecurity()
  const { toast } = useToast()

  const quiz = getQuiz(quizId)
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [isQuizActive, setIsQuizActive] = useState(false)

  useSecurityMonitor({
    isActive: isQuizActive,
    settings: quiz?.securitySettings || {
      noTabSwitching: false,
      noMinimizing: false,
      noRightClick: false,
      noScreenshot: false,
    },
    studentId: user?.id || "",
    quizId: quizId,
  })

  useEffect(() => {
    if (!quiz || !user) return

    // Check for existing attempt
    const existingAttempts = getQuizAttempts(quizId, user.id)
    const activeAttempt = existingAttempts.find((attempt) => !attempt.isCompleted)

    if (activeAttempt) {
      setCurrentAttempt(activeAttempt)
      setAnswers(activeAttempt.answers)
      // Calculate remaining time
      const elapsed = Date.now() - activeAttempt.startedAt.getTime()
      const remaining = Math.max(0, quiz.timeLimit * 60 * 1000 - elapsed)
      setTimeRemaining(Math.floor(remaining / 1000))
    } else {
      // Start new attempt
      const newAttempt = startQuiz(quizId, user.id)
      setCurrentAttempt(newAttempt)
      setTimeRemaining(quiz.timeLimit * 60)
    }

    setIsQuizActive(true)
    clearViolations()

    return () => {
      setIsQuizActive(false)
    }
  }, [quiz, user, quizId, startQuiz, getQuizAttempts, clearViolations])

  useEffect(() => {
    if (timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    if (currentAttempt) {
      submitAnswer(currentAttempt.id, questionId, answer)
    }
  }

  const handleSubmitQuiz = () => {
    if (!currentAttempt) return

    setIsQuizActive(false)
    completeQuiz(currentAttempt.id)
    toast({
      title: "Quiz submitted!",
      description: "Your answers have been recorded successfully.",
    })
    onComplete()
  }

  const handleExitQuiz = () => {
    setIsQuizActive(false)
    onBack()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p>Quiz not found</p>
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const hasSecurityRules = Object.values(quiz.securitySettings).some(Boolean)
  const currentViolations = violations.filter((v) => v.quizId === quizId)

  return (
    <>
      <SecurityOverlay />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleExitQuiz}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Quiz
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-primary">{quiz.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {hasSecurityRules && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <Badge variant="outline" className="border-amber-600 text-amber-700">
                      Monitored
                    </Badge>
                    {currentViolations.length > 0 && (
                      <Badge variant="destructive">{currentViolations.length} violations</Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={timeRemaining < 300 ? "text-destructive font-bold" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>

            {hasSecurityRules && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Security Monitoring Active</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  This quiz is monitored for security violations. Avoid switching tabs, minimizing windows,
                  right-clicking, or taking screenshots.
                </p>
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{currentQuestion.question}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, Number.parseInt(value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="text-answer">Your Answer</Label>
                  <Textarea
                    id="text-answer"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button onClick={handleSubmitQuiz}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
