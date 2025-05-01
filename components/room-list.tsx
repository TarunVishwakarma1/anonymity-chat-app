"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Plus, Users } from "lucide-react"
import { motion } from "framer-motion"

interface Room {
  id: number
  name: string
  created_at: string
  is_private: boolean
  created_by: number
}

export function RoomList() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newRoomName, setNewRoomName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms")
        if (!response.ok) throw new Error("Failed to fetch rooms")

        const data = await response.json()
        setRooms(data.rooms)
      } catch (error) {
        console.error("Error fetching rooms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoomName,
          isPrivate,
        }),
      })

      if (!response.ok) throw new Error("Failed to create room")

      const data = await response.json()
      setRooms([data.room, ...rooms])
      setNewRoomName("")
      setIsPrivate(false)
      setIsDialogOpen(false)

      // Navigate to the new room
      router.push(`/room/${data.room.id}`)
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  const handleJoinRoom = (roomId: number) => {
    router.push(`/room/${roomId}`)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Rooms</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="mr-2 h-4 w-4" /> New Room
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-16"></CardContent>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No rooms found. Create your first room to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="space-y-2" variants={container} initial="hidden" animate="show">
          {rooms.map((room) => (
            <motion.div key={room.id} variants={item}>
              <Card
                className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-purple-500"
                onClick={() => handleJoinRoom(room.id)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(room.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {room.is_private && <Lock className="h-4 w-4 text-amber-500 mr-2" />}
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="room-name" className="text-sm font-medium">
                Room Name
              </label>
              <Input
                id="room-name"
                placeholder="Enter room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private-room"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked === true)}
              />
              <label htmlFor="private-room" className="text-sm font-medium">
                Make this room private
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!newRoomName.trim()}
            >
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
