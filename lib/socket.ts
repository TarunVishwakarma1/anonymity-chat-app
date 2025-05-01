import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-room", (roomId: string, user: any) => {
        socket.join(roomId)
        console.log(`User ${user.username} joined room ${roomId}`)

        // Broadcast to room that user joined
        socket.to(roomId).emit("user-joined", user)

        // Send current users in room
        const roomSockets = io.sockets.adapter.rooms.get(roomId)
        const users = Array.from(roomSockets || [])
          .map((socketId) => {
            return io.sockets.sockets.get(socketId)?.data.user || null
          })
          .filter(Boolean)

        socket.emit("room-users", users)
      })

      socket.on("leave-room", (roomId: string, user: any) => {
        socket.leave(roomId)
        console.log(`User ${user.username} left room ${roomId}`)

        // Broadcast to room that user left
        socket.to(roomId).emit("user-left", user)
      })

      socket.on("send-message", (roomId: string, message: any) => {
        console.log(`Message in room ${roomId}:`, message)

        // Broadcast message to room
        socket.to(roomId).emit("new-message", message)
      })

      socket.on("drawing-update", (roomId: string, drawingData: any) => {
        console.log(`Drawing update in room ${roomId}`)

        // Broadcast drawing update to room
        socket.to(roomId).emit("drawing-updated", drawingData)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  return res.socket.server.io
}
