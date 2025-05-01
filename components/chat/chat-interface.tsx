"use client"

import type React from "react"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { io, type Socket } from "socket.io-client"
import { formatDistanceToNow } from "date-fns"
import ChatSkeleton from "./chat-skeleton"

interface Message {
  id: string
  content: string
  user: {
    id: string
    username: string
    avatar_url?: string
  }
  created_at: string
}

interface ChatInterfaceProps {
  roomId: string | number
  userId: string | number
  username: string
  avatar_url?: string
}

function ChatContent({ roomId, userId, username, avatar_url }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection and load messages
  useEffect(() => {
    const initSocket = async () => {
      try {
        await fetch("/api/socket")

        if (!socketRef.current) {
          const socket = io()
          socketRef.current = socket

          socket.emit("join-room", roomId, userId)

          socket.on("receive-message", (message: Message) => {
            setMessages((prev) => [...prev, message])
          })

          // Load existing messages
          loadMessages()
        }
      } catch (error) {
        console.error("Socket initialization error:", error)
        setLoading(false)
      }
    }

    initSocket()

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [roomId, userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load existing messages from the server
  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages/${roomId}`)
      if (!response.ok) throw new Error("Failed to load messages")

      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    // In the sendMessage function, ensure we're properly handling the userId type
    const messageData = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      user: {
        id: userId.toString(), // Convert to string to ensure consistency
        username,
        avatar_url,
      },
      created_at: new Date().toISOString(),
    }

    // Optimistically add message to UI
    setMessages((prev) => [...prev, messageData])
    setNewMessage("")

    try {
      // Send to server
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          content: newMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      // Emit to other users via socket
      if (socketRef.current) {
        socketRef.current.emit("send-message", roomId, messageData)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== messageData.id))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading messages...</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-full p-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              // When comparing message.user.id with userId, ensure they're both strings
              <div
                key={message.id || index}
                className={`flex ${message.user.id.toString() === userId.toString() ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex ${
                    message.user.id.toString() === userId.toString() ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2 max-w-[80%]`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar_url || "/placeholder.svg"} alt={message.user.username} />
                    <AvatarFallback>{message.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.user.id.toString() === userId.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div
                      className={`flex text-xs text-muted-foreground mt-1 ${
                        message.user.id.toString() === userId.toString() ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{message.user.username}</span>
                      <span className="mx-1">•</span>
                      <time dateTime={message.created_at}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <CardFooter className="p-3 border-t">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </>
  )
}

export default function ChatInterface(props: ChatInterfaceProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Suspense fallback={<ChatSkeleton />}>
          <ChatContent {...props} />
        </Suspense>
      </CardContent>
    </Card>
  )
}
