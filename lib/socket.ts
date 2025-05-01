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

export const initSocket = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server)

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)

      // Handle joining a room
      socket.on("join-room", (roomId: string, userId: string) => {
        socket.join(roomId)
        console.log(`User ${userId} joined room ${roomId}`)
        socket.to(roomId).emit("user-joined", userId)
      })

      // Handle chat messages
      socket.on("send-message", (roomId: string, message: any) => {
        socket.to(roomId).emit("receive-message", message)
      })

      // Handle drawing events
      socket.on("draw", (roomId: string, drawingData: any) => {
        socket.to(roomId).emit("draw-update", drawingData)
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
      })
    })

    res.socket.server.io = io
  }

  return res.socket.server.io
}
