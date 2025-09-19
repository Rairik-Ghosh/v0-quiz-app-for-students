"use client"

import { useState } from "react"
import { useNotifications } from "@/lib/notification-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, AlertTriangle, CheckCircle, Play, X, Award as MarkAsRead } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security-violation":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "quiz-completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "quiz-started":
        return <Play className="h-4 w-4 text-primary" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "security-violation":
        return "border-l-destructive bg-destructive/5"
      case "quiz-completed":
        return "border-l-green-600 bg-green-50"
      case "quiz-started":
        return "border-l-primary bg-primary/5"
      default:
        return "border-l-muted"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <MarkAsRead className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`mb-2 cursor-pointer transition-all border-l-4 ${getNotificationColor(
                    notification.type,
                  )} ${!notification.isRead ? "bg-muted/30" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-sm">{notification.title}</CardTitle>
                        {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">{notification.message}</CardDescription>
                    {notification.studentName && (
                      <div className="mt-2 text-xs text-muted-foreground">Student: {notification.studentName}</div>
                    )}
                    {notification.violation && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {notification.violation.type.replace("-", " ")}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
