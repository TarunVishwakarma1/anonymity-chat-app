import { neon } from "@neondatabase/serverless"
import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32).toString("hex")
const IV_LENGTH = 16

export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = randomBytes(IV_LENGTH)
  const key = Buffer.from(ENCRYPTION_KEY, "hex")
  const cipher = createCipheriv("aes-256-cbc", key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  }
}

export function decrypt(encryptedData: string, iv: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, "hex")
  const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"))
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// User functions
export async function getUserByEmail(email: string) {
  return sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`.then((res) => res[0] || null)
}

export async function getUserById(id: number) {
  return sql`SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ${id} LIMIT 1`.then(
    (res) => res[0] || null,
  )
}

// Room functions
export async function getRooms() {
  return sql`SELECT * FROM rooms ORDER BY created_at DESC`
}

export async function getRoomById(id: number) {
  return sql`SELECT * FROM rooms WHERE id = ${id} LIMIT 1`.then((res) => res[0] || null)
}

export async function getRoomParticipants(roomId: number) {
  return sql`
    SELECT u.id, u.username, u.avatar_url, rp.joined_at
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ${roomId}
    ORDER BY rp.joined_at ASC
  `
}

// Message functions
export async function getMessages(roomId: number) {
  return sql`
    SELECT m.*, u.username, u.avatar_url
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ${roomId}
    ORDER BY m.created_at ASC
  `
}

// Drawing functions
export async function getDrawing(roomId: number) {
  return sql`
    SELECT * FROM drawings
    WHERE room_id = ${roomId}
    ORDER BY updated_at DESC
    LIMIT 1
  `.then((res) => res[0] || null)
}

export async function getDrawingHistory(drawingId: number) {
  return sql`
    SELECT dh.*, u.username
    FROM drawing_history dh
    JOIN users u ON dh.user_id = u.id
    WHERE dh.drawing_id = ${drawingId}
    ORDER BY dh.created_at ASC
  `
}
