"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  answers: Record<string, string | number>
  score?: number
  completedAt?: Date
  startedAt: Date
  timeRemaining?: number
  isCompleted: boolean
}

interface StudentContextType {
  attempts: QuizAttempt[]
  startQuiz: (quizId: string, studentId: string) => QuizAttempt
  submitAnswer: (attemptId: string, questionId: string, answer: string | number) => void
  completeQuiz: (attemptId: string) => void
  getAttempt: (attemptId: string) => QuizAttempt | undefined
  getQuizAttempts: (quizId: string, studentId: string) => QuizAttempt[]
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  const startQuiz = (quizId: string, studentId: string): QuizAttempt => {
    const newAttempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      quizId,
      studentId,
      answers: {},
      startedAt: new Date(),
      isCompleted: false,
    }
    setAttempts((prev) => [...prev, newAttempt])
    return newAttempt
  }

  const submitAnswer = (attemptId: string, questionId: string, answer: string | number) => {
    setAttempts((prev) =>
      prev.map((attempt) =>
        attempt.id === attemptId ? { ...attempt, answers: { ...attempt.answers, [questionId]: answer } } : attempt,
      ),
    )
  }

  const completeQuiz = (attemptId: string) => {
    setAttempts((prev) =>
      prev.map((attempt) =>
        attempt.id === attemptId ? { ...attempt, isCompleted: true, completedAt: new Date() } : attempt,
      ),
    )
  }

  const getAttempt = (attemptId: string) => {
    return attempts.find((attempt) => attempt.id === attemptId)
  }

  const getQuizAttempts = (quizId: string, studentId: string) => {
    return attempts.filter((attempt) => attempt.quizId === quizId && attempt.studentId === studentId)
  }

  return (
    <StudentContext.Provider
      value={{
        attempts,
        startQuiz,
        submitAnswer,
        completeQuiz,
        getAttempt,
        getQuizAttempts,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
