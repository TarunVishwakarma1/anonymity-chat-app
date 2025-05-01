import { sql } from "./db"

// Create a new room
export async function createRoom(name: string, createdBy: number, isPrivate = false) {
  try {
    const result = await sql`
      INSERT INTO rooms (name, created_by, is_private)
      VALUES (${name}, ${createdBy}, ${isPrivate})
      RETURNING id, name, created_by, is_private, created_at
    `

    return result[0]
  } catch (error) {
    console.error("Error creating room:", error)
    throw new Error("Failed to create room")
  }
}

// Get all public rooms
export async function getPublicRooms() {
  try {
    const rooms = await sql`
      SELECT r.id, r.name, r.created_at, u.username as created_by_username,
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as participant_count
      FROM rooms r
      JOIN users u ON r.created_by = u.id
      WHERE r.is_private = false
      ORDER BY r.created_at DESC
    `

    return rooms
  } catch (error) {
    console.error("Error getting public rooms:", error)
    throw new Error("Failed to get public rooms")
  }
}

// Join a room
export async function joinRoom(roomId: number, userId: number) {
  try {
    // Check if user is already in the room
    const existing = await sql`
      SELECT * FROM room_participants
      WHERE room_id = ${roomId} AND user_id = ${userId}
    `

    if (existing.length === 0) {
      await sql`
        INSERT INTO room_participants (room_id, user_id)
        VALUES (${roomId}, ${userId})
      `
    }

    return true
  } catch (error) {
    console.error("Error joining room:", error)
    throw new Error("Failed to join room")
  }
}

// Get room details with participants
export async function getRoomWithParticipants(roomId: number) {
  try {
    const rooms = await sql`
      SELECT r.id, r.name, r.created_at, r.is_private,
        u.username as created_by_username
      FROM rooms r
      JOIN users u ON r.created_by = u.id
      WHERE r.id = ${roomId}
    `

    if (rooms.length === 0) {
      return null
    }

    const room = rooms[0]

    const participants = await sql`
      SELECT u.id, u.username, u.avatar_url, rp.joined_at
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ${roomId}
      ORDER BY rp.joined_at ASC
    `

    return {
      ...room,
      participants,
    }
  } catch (error) {
    console.error("Error getting room details:", error)
    throw new Error("Failed to get room details")
  }
}
