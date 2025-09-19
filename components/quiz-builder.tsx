"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useQuiz, type Question, type SecuritySettings } from "@/lib/quiz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Save, Eye, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizBuilderProps {
  onBack: () => void
}

export function QuizBuilder({ onBack }: QuizBuilderProps) {
  const { user } = useAuth()
  const { createQuiz } = useQuiz()
  const { toast } = useToast()

  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState(30)
  const [questions, setQuestions] = useState<Question[]>([])
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    noTabSwitching: false,
    noMinimizing: false,
    noRightClick: false,
    noScreenshot: false,
  })

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options?.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
      ),
    )
  }

  const handleSaveQuiz = () => {
    if (!quizTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your quiz",
        variant: "destructive",
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to your quiz",
        variant: "destructive",
      })
      return
    }

    // Validate questions
    const invalidQuestions = questions.filter(
      (q) =>
        !q.question.trim() || (q.type === "multiple-choice" && (!q.options || q.options.some((opt) => !opt.trim()))),
    )

    if (invalidQuestions.length > 0) {
      toast({
        title: "Incomplete questions",
        description: "Please complete all questions and their options",
        variant: "destructive",
      })
      return
    }

    createQuiz({
      title: quizTitle,
      description: quizDescription,
      questions,
      timeLimit,
      isLive: false,
      securitySettings,
      createdBy: user?.id || "",
    })

    toast({
      title: "Quiz created successfully!",
      description: "Your quiz has been saved as a draft",
    })

    onBack()
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
            <h1 className="text-2xl font-bold text-primary">Create Quiz</h1>
            <p className="text-sm text-muted-foreground">Build a new quiz with custom questions</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Set up the basic information for your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this quiz covers"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure authenticity safeguards for this quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noTabSwitching">No Tab Switching</Label>
                    <p className="text-sm text-muted-foreground">Freeze screen if student switches tabs</p>
                  </div>
                  <Switch
                    id="noTabSwitching"
                    checked={securitySettings.noTabSwitching}
                    onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, noTabSwitching: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noMinimizing">No Minimizing</Label>
                    <p className="text-sm text-muted-foreground">Prevent window minimization</p>
                  </div>
                  <Switch
                    id="noMinimizing"
                    checked={securitySettings.noMinimizing}
                    onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, noMinimizing: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noRightClick">No Right Click</Label>
                    <p className="text-sm text-muted-foreground">Disable context menu</p>
                  </div>
                  <Switch
                    id="noRightClick"
                    checked={securitySettings.noRightClick}
                    onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, noRightClick: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noScreenshot">No Screenshots</Label>
                    <p className="text-sm text-muted-foreground">Attempt to prevent screenshots</p>
                  </div>
                  <Switch
                    id="noScreenshot"
                    checked={securitySettings.noScreenshot}
                    onCheckedChange={(checked) => setSecuritySettings((prev) => ({ ...prev, noScreenshot: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Add questions to your quiz</CardDescription>
                </div>
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <div className="flex items-center gap-2">
                          <Select
                            value={question.type}
                            onValueChange={(value: "multiple-choice" | "text") =>
                              updateQuestion(question.id, {
                                type: value,
                                options: value === "multiple-choice" ? ["", "", "", ""] : undefined,
                                correctAnswer: value === "multiple-choice" ? 0 : undefined,
                              })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="text">Text Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                          placeholder="Enter your question here"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        />
                      </div>

                      {question.type === "multiple-choice" && (
                        <div className="space-y-3">
                          <Label>Answer Options</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => updateQuestion(question.id, { correctAnswer: optionIndex })}
                                  className="mr-2"
                                />
                                <Label className="text-sm text-muted-foreground">
                                  {String.fromCharCode(65 + optionIndex)}
                                </Label>
                              </div>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                value={option}
                                onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                              />
                            </div>
                          ))}
                          <p className="text-sm text-muted-foreground">
                            Select the correct answer by clicking the radio button
                          </p>
                        </div>
                      )}

                      {question.type === "text" && (
                        <div className="space-y-2">
                          <Label>Expected Answer (for reference)</Label>
                          <Input
                            placeholder="Enter the expected answer"
                            value={(question.correctAnswer as string) || ""}
                            onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          />
                          <p className="text-sm text-muted-foreground">This will help you grade text responses</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Save Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz}>
              <Save className="h-4 w-4 mr-2" />
              Save Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
