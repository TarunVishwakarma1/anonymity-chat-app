import { type NextRequest, NextResponse } from "next/server"
import { createRoom, getPublicRooms } from "@/lib/rooms"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const rooms = await getPublicRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error getting rooms:", error)
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, isPrivate } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const room = await createRoom(name, user.id, isPrivate)

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
