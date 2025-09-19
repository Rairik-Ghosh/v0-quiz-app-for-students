"use client"

import { useEffect } from "react"
import { useSecurity } from "@/lib/security-monitor"
import type { SecuritySettings } from "@/lib/quiz-store"

interface UseSecurityMonitorProps {
  isActive: boolean
  settings: SecuritySettings
  studentId: string
  quizId: string
}

export function useSecurityMonitor({ isActive, settings, studentId, quizId }: UseSecurityMonitorProps) {
  const { addViolation } = useSecurity()

  useEffect(() => {
    if (!isActive) return

    const handleVisibilityChange = () => {
      if (document.hidden && settings.noTabSwitching) {
        addViolation("tab-switch", studentId, quizId)
      }
    }

    const handleBlur = () => {
      if (settings.noMinimizing) {
        addViolation("minimize", studentId, quizId)
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (settings.noRightClick) {
        e.preventDefault()
        addViolation("right-click", studentId, quizId)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      if (settings.noScreenshot) {
        const isScreenshotShortcut =
          e.key === "PrintScreen" ||
          (e.ctrlKey && e.shiftKey && e.key === "S") ||
          (e.metaKey && e.shiftKey && e.key === "3") ||
          (e.metaKey && e.shiftKey && e.key === "4") ||
          (e.metaKey && e.shiftKey && e.key === "5")

        if (isScreenshotShortcut) {
          e.preventDefault()
          addViolation("screenshot", studentId, quizId)
        }
      }

      // Prevent F12, Ctrl+Shift+I (DevTools)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault()
        addViolation("right-click", studentId, quizId)
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Are you sure you want to leave? Your quiz progress may be lost."
      return e.returnValue
    }

    // Add event listeners
    if (settings.noTabSwitching) {
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }

    if (settings.noMinimizing) {
      window.addEventListener("blur", handleBlur)
    }

    if (settings.noRightClick) {
      document.addEventListener("contextmenu", handleContextMenu)
    }

    if (settings.noScreenshot || settings.noRightClick) {
      document.addEventListener("keydown", handleKeyDown)
    }

    // Prevent leaving the page
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isActive, settings, studentId, quizId, addViolation])

  // Disable text selection and drag if security is enabled
  useEffect(() => {
    if (!isActive) return

    const hasAnySecurity = Object.values(settings).some(Boolean)
    if (hasAnySecurity) {
      document.body.style.userSelect = "none"
      document.body.style.webkitUserSelect = "none"
      document.body.ondragstart = () => false
      document.body.onselectstart = () => false
    }

    return () => {
      document.body.style.userSelect = ""
      document.body.style.webkitUserSelect = ""
      document.body.ondragstart = null
      document.body.onselectstart = null
    }
  }, [isActive, settings])
}
