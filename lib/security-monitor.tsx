"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNotifications } from "@/lib/notification-store"
import { useAuth } from "@/lib/auth"

export interface SecurityViolation {
  id: string
  type: "tab-switch" | "minimize" | "right-click" | "screenshot" | "blur"
  timestamp: Date
  studentId: string
  quizId: string
}

interface SecurityContextType {
  violations: SecurityViolation[]
  isScreenFrozen: boolean
  freezeTimeRemaining: number
  addViolation: (type: SecurityViolation["type"], studentId: string, quizId: string) => void
  clearViolations: () => void
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [isScreenFrozen, setIsScreenFrozen] = useState(false)
  const [freezeTimeRemaining, setFreezeTimeRemaining] = useState(0)
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  const addViolation = (type: SecurityViolation["type"], studentId: string, quizId: string) => {
    const violation: SecurityViolation = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date(),
      studentId,
      quizId,
    }

    setViolations((prev) => [...prev, violation])

    // Freeze screen for 40 seconds
    setIsScreenFrozen(true)
    setFreezeTimeRemaining(40)

    const violationTypeMap = {
      "tab-switch": "Tab Switching",
      minimize: "Window Minimizing",
      "right-click": "Right Click",
      screenshot: "Screenshot Attempt",
      blur: "Window Focus Lost",
    }

    addNotification({
      type: "security-violation",
      title: "Security Violation Detected",
      message: `${violationTypeMap[type]} detected during quiz. Student screen has been frozen for 40 seconds.`,
      quizId,
      studentId,
      studentName: user?.name || "Unknown Student",
      violation,
    })
  }

  const clearViolations = () => {
    setViolations([])
  }

  // Handle freeze countdown
  useEffect(() => {
    if (freezeTimeRemaining <= 0) {
      setIsScreenFrozen(false)
      return
    }

    const timer = setInterval(() => {
      setFreezeTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsScreenFrozen(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [freezeTimeRemaining])

  return (
    <SecurityContext.Provider
      value={{
        violations,
        isScreenFrozen,
        freezeTimeRemaining,
        addViolation,
        clearViolations,
      }}
    >
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider")
  }
  return context
}
