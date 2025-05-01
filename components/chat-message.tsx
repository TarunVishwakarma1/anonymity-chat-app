"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface ChatMessageProps {
  id: number
  content: string
  username: string
  avatarUrl?: string
  isCurrentUser: boolean
  timestamp: Date
}

export function ChatMessage({ id, content, username, avatarUrl, isCurrentUser, timestamp }: ChatMessageProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date()
      const messageTime = new Date(timestamp)
      const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000)

      if (diffInSeconds < 60) {
        setTimeAgo("just now")
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(`${minutes}m ago`)
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        setTimeAgo(`${hours}h ago`)
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        setTimeAgo(`${days}d ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timestamp])

  const initials = username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isCurrentUser ? "flex-row-reverse" : ""}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
        <AvatarFallback className={isCurrentUser ? "bg-purple-500" : "bg-pink-500"}>{initials}</AvatarFallback>
      </Avatar>

      <div className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs text-gray-500 ${isCurrentUser ? "order-last" : ""}`}>{timeAgo}</span>
          <span className="font-medium text-sm">{isCurrentUser ? "You" : username}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          {content}
        </div>
      </div>
    </motion.div>
  )
}
