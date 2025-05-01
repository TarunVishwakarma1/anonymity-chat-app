import { sql, encryptData, decryptData } from "./db"

// Secret key for encryption (in a real app, use environment variables)
const ENCRYPTION_KEY = "your-secret-key"

// Save a drawing
export async function saveDrawing(roomId: number, userId: number, drawingData: any, isEncrypted = true) {
  try {
    let processedData = JSON.stringify(drawingData)

    if (isEncrypted) {
      processedData = await encryptData(processedData, ENCRYPTION_KEY)
    }

    // Check if a drawing already exists for this room
    const existingDrawings = await sql`
      SELECT id FROM drawings
      WHERE room_id = ${roomId}
    `

    if (existingDrawings.length > 0) {
      // Update existing drawing
      const drawingId = existingDrawings[0].id

      await sql`
        UPDATE drawings
        SET drawing_data = ${processedData}::jsonb, 
            user_id = ${userId}, 
            is_encrypted = ${isEncrypted},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${drawingId}
      `

      return drawingId
    } else {
      // Create new drawing
      const result = await sql`
        INSERT INTO drawings (room_id, user_id, drawing_data, is_encrypted)
        VALUES (${roomId}, ${userId}, ${processedData}::jsonb, ${isEncrypted})
        RETURNING id
      `

      return result[0].id
    }
  } catch (error) {
    console.error("Error saving drawing:", error)
    throw new Error("Failed to save drawing")
  }
}

// Get a drawing for a room
export async function getRoomDrawing(roomId: number) {
  try {
    const drawings = await sql`
      SELECT d.id, d.drawing_data, d.is_encrypted, d.created_at, d.updated_at,
        u.id as user_id, u.username
      FROM drawings d
      JOIN users u ON d.user_id = u.id
      WHERE d.room_id = ${roomId}
    `

    if (drawings.length === 0) {
      return null
    }

    const drawing = drawings[0]

    // Decrypt drawing if needed
    if (drawing.is_encrypted) {
      const decryptedData = await decryptData(drawing.drawing_data, ENCRYPTION_KEY)
      return {
        ...drawing,
        drawing_data: JSON.parse(decryptedData),
      }
    }

    return {
      ...drawing,
      drawing_data: drawing.drawing_data,
    }
  } catch (error) {
    console.error("Error getting room drawing:", error)
    throw new Error("Failed to get room drawing")
  }
}

// Save drawing history
export async function saveDrawingHistory(drawingId: number, userId: number, actionType: string, actionData: any) {
  try {
    await sql`
      INSERT INTO drawing_history (drawing_id, user_id, action_type, action_data)
      VALUES (${drawingId}, ${userId}, ${actionType}, ${JSON.stringify(actionData)}::jsonb)
    `

    return true
  } catch (error) {
    console.error("Error saving drawing history:", error)
    throw new Error("Failed to save drawing history")
  }
}
