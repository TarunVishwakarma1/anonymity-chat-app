"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { Send, Smile } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: number
  content: string
  user_id: number
  username: string
  avatar_url?: string
  created_at: string
}

interface ChatInterfaceProps {
  roomId: number
  currentUser: {
    id: number
    username: string
    avatar_url?: string
  }
  initialMessages?: Message[]
  onSendMessage: (content: string) => void
  newMessages?: Message[]
}

export function ChatInterface({
  roomId,
  currentUser,
  initialMessages = [],
  onSendMessage,
  newMessages = [],
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Merge initial and new messages
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Add new messages as they come in
  useEffect(() => {
    if (newMessages.length > 0) {
      const latestMessage = newMessages[newMessages.length - 1]
      if (!messages.some((m) => m.id === latestMessage.id)) {
        setMessages((prev) => [...prev, ...newMessages])
      }
    }
  }, [newMessages, messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update the ChatInterface component to handle both encrypted and decrypted messages
  useEffect(() => {
    // Process messages to ensure content is properly handled
    const processedMessages = initialMessages.map((msg) => {
      // If the content is an object with encrypted and iv properties, it needs decryption
      if (typeof msg.content === "object" && msg.content !== null) {
        try {
          // This would be handled by the server, but just in case
          console.warn("Found encrypted message that wasn't decrypted by the server")
          return msg
        } catch (error) {
          console.error("Error processing message:", error)
          return {
            ...msg,
            content: "⚠️ Encrypted message",
          }
        }
      }
      return msg
    })

    setMessages(processedMessages)
  }, [initialMessages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    onSendMessage(message)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                content={msg.content}
                username={msg.username}
                avatarUrl={msg.avatar_url}
                isCurrentUser={msg.user_id === currentUser.id}
                timestamp={new Date(msg.created_at)}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        className="p-4 border-t bg-background"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
