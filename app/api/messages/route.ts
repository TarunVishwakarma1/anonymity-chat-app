import { type NextRequest, NextResponse } from "next/server"
import { sendMessage } from "@/lib/messages"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId, content } = await req.json()

    if (!roomId || !content) {
      return NextResponse.json({ error: "Room ID and content are required" }, { status: 400 })
    }

    const message = await sendMessage(roomId, user.id, content)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
