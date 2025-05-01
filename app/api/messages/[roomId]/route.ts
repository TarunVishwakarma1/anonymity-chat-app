import { type NextRequest, NextResponse } from "next/server"
import { getRoomMessages } from "@/lib/messages"

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    
    const roomId = Number.parseInt(params.roomId)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    const messages = await getRoomMessages(roomId)

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error getting messages:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}
