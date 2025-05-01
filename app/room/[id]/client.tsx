"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInterface } from "@/components/chat-interface"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { PenTool, MessageSquare, ArrowLeft, Users } from "lucide-react"
import { motion } from "framer-motion"
import type { Socket } from "socket.io-client"

interface Room {
  id: number
  name: string
  created_at: string
  is_private: boolean
  created_by: number
}

interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
}

interface Message {
  id: number
  content: string
  user_id: number
  username: string
  avatar_url?: string
  created_at: string
}

interface RoomClientProps {
  room: Room
  currentUser: User
  initialMessages: Message[]
  initialDrawing: any
}

export default function RoomClient({ room, currentUser, initialMessages, initialDrawing }: RoomClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>(initialMessages || [])
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const [drawingData, setDrawingData] = useState<any>(initialDrawing || {})
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])

  // Initialize socket connection
  useEffect(() => {
    // In a real app, we would use a real socket connection
    // For this demo, we'll simulate socket behavior with API calls

    const connectToRoom = async () => {
      try {
        // Simulate joining the room
        console.log(`User ${currentUser.username} joined room ${room.id}`)

        // In a real app, we would set up socket event listeners here
      } catch (error) {
        console.error("Error connecting to room:", error)
      }
    }

    connectToRoom()

    return () => {
      // Clean up socket connection
      if (socket) {
        socket.disconnect()
      }
    }
  }, [room.id, currentUser, socket])

  const handleSendMessage = async (content: string) => {
    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: Date.now(),
        content,
        user_id: currentUser.id,
        username: currentUser.username,
        avatar_url: currentUser.avatar_url,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempMessage])

      // Send message to server
      const response = await fetch("/api/socket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "message",
          roomId: room.id,
          data: {
            content,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // In a real app with sockets, we would receive the message from the socket
      // For now, we'll just update our local state
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? { ...data.message, id: data.message.id } : msg)),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== Date.now()))
    }
  }

  const handleDrawingChange = async (action: string, data: any) => {
    try {
      // Update local drawing data
      setDrawingData(data)

      // Send drawing update to server
      const response = await fetch("/api/socket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "drawing",
          roomId: room.id,
          data: {
            action,
            drawingData: data,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update drawing")
      }
    } catch (error) {
      console.error("Error updating drawing:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <motion.header
        className="flex justify-between items-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <div className="flex items-center gap-1 text-white/70">
              <Users className="h-3 w-3" />
              <span className="text-sm">{onlineUsers.length + 1} online</span>
            </div>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2">
          <PenTool className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white">SketchChat</span>
        </Link>
      </motion.header>

      <motion.div
        className="flex-grow bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 w-full bg-white/20">
            <TabsTrigger value="chat" className="data-[state=active]:bg-white/20">
              <MessageSquare className="h-4 w-4 mr-2" /> Chat
            </TabsTrigger>
            <TabsTrigger value="draw" className="data-[state=active]:bg-white/20">
              <PenTool className="h-4 w-4 mr-2" /> Draw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-grow overflow-hidden m-0 h-full">
            <ChatInterface
              roomId={room.id}
              currentUser={currentUser}
              initialMessages={messages}
              onSendMessage={handleSendMessage}
              newMessages={newMessages}
            />
          </TabsContent>

          <TabsContent value="draw" className="flex-grow overflow-hidden m-0 h-full">
            <DrawingCanvas
              roomId={room.id}
              userId={currentUser.id}
              username={currentUser.username}
              onDrawingChange={handleDrawingChange}
              initialDrawingData={drawingData}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
