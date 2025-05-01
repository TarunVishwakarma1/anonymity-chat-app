import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get rooms the user is part of
    const rooms = await sql`
      SELECT r.* 
      FROM rooms r
      JOIN room_participants rp ON r.id = rp.room_id
      WHERE rp.user_id = ${user.id}
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, isPrivate = false } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    // Create room
    const newRoom = await sql`
      INSERT INTO rooms (name, created_by, created_at, is_private)
      VALUES (${name}, ${user.id}, NOW(), ${isPrivate})
      RETURNING *
    `

    // Add creator as participant
    await sql`
      INSERT INTO room_participants (room_id, user_id, joined_at)
      VALUES (${newRoom[0].id}, ${user.id}, NOW())
    `

    return NextResponse.json({ room: newRoom[0] })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
