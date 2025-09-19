"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Question {
  id: string
  type: "multiple-choice" | "text"
  question: string
  options?: string[]
  correctAnswer?: string | number
}

export interface SecuritySettings {
  noTabSwitching: boolean
  noMinimizing: boolean
  noRightClick: boolean
  noScreenshot: boolean
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit: number // in minutes
  isLive: boolean
  securitySettings: SecuritySettings
  createdAt: Date
  createdBy: string
}

interface QuizContextType {
  quizzes: Quiz[]
  createQuiz: (quiz: Omit<Quiz, "id" | "createdAt">) => void
  updateQuiz: (id: string, updates: Partial<Quiz>) => void
  deleteQuiz: (id: string) => void
  getQuiz: (id: string) => Quiz | undefined
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  const createQuiz = (quizData: Omit<Quiz, "id" | "createdAt">) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setQuizzes((prev) => [...prev, newQuiz])
  }

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes((prev) => prev.map((quiz) => (quiz.id === id ? { ...quiz, ...updates } : quiz)))
  }

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id))
  }

  const getQuiz = (id: string) => {
    return quizzes.find((quiz) => quiz.id === id)
  }

  return (
    <QuizContext.Provider value={{ quizzes, createQuiz, updateQuiz, deleteQuiz, getQuiz }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider")
  }
  return context
}
