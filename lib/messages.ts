import { sql, encryptData, decryptData } from "./db"

// Secret key for encryption (in a real app, use environment variables)
const ENCRYPTION_KEY = "your-secret-key"

// Send a message
export async function sendMessage(roomId: number, userId: number, content: string, isEncrypted = true) {
  try {
    let processedContent = content

    if (isEncrypted) {
      processedContent = await encryptData(content, ENCRYPTION_KEY)
    }

    const result = await sql`
      INSERT INTO messages (room_id, user_id, content, is_encrypted)
      VALUES (${roomId}, ${userId}, ${processedContent}, ${isEncrypted})
      RETURNING id, room_id, user_id, content, is_encrypted, created_at
    `

    return result[0]
  } catch (error) {
    console.error("Error sending message:", error)
    throw new Error("Failed to send message")
  }
}

// Get messages for a room
export async function getRoomMessages(roomId: number) {
  try {
    const messages = await sql`
      SELECT m.id, m.content, m.is_encrypted, m.created_at,
        u.id as user_id, u.username, u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ${roomId}
      ORDER BY m.created_at ASC
    `

    // Decrypt messages if needed
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        if (message.is_encrypted) {
          return {
            ...message,
            content: await decryptData(message.content, ENCRYPTION_KEY),
          }
        }
        return message
      }),
    )

    return processedMessages
  } catch (error) {
    console.error("Error getting room messages:", error)
    throw new Error("Failed to get room messages")
  }
}
