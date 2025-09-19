"use client"

import { useSecurity } from "@/lib/security-monitor"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Shield } from "lucide-react"

export function SecurityOverlay() {
  const { isScreenFrozen, freezeTimeRemaining } = useSecurity()

  if (!isScreenFrozen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 border-destructive">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-2">Security Violation Detected</h2>
            <p className="text-muted-foreground">
              Your screen has been frozen due to a potential violation of quiz security rules.
            </p>
          </div>

          <div className="bg-destructive/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">Screen Frozen</span>
            </div>
            <div className="text-3xl font-bold text-destructive">{freezeTimeRemaining}s</div>
            <p className="text-sm text-muted-foreground mt-2">Your teacher has been notified of this incident</p>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Do not attempt to leave this page</p>
            <p>• Wait for the timer to complete</p>
            <p>• Follow all quiz security guidelines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
