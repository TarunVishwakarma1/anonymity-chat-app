import { neon } from "@neondatabase/serverless";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!);

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Expecting a 64-character hex string
const IV_LENGTH = 16;

// Generate a new encryption key if one doesn't exist (for development/initial setup)
if (!ENCRYPTION_KEY) {
  console.warn(
    "ENCRYPTION_KEY environment variable not set. Generating a new one. " +
      "THIS IS NOT RECOMMENDED FOR PRODUCTION!",
  );
}

function getEncryptionKeyBuffer(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY!;
  console.log('Current ENCRYPTION_KEY:', keyHex); // Added log
  console.log('Length of ENCRYPTION_KEY:', keyHex.length); // Added log
  if (keyHex.length !== 64) {
    console.error(
      "Error: ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes).",
      keyHex,
      keyHex.length,
    );
    throw new Error("Invalid encryption key length.");
  }
  return Buffer.from(keyHex, "hex");
}

export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = randomBytes(IV_LENGTH);
  const key = getEncryptionKeyBuffer();
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encryptedData: string, iv: string): string {
  const key = getEncryptionKeyBuffer();
  const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
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
  const messages = await sql`
    SELECT m.*, u.username, u.avatar_url
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ${roomId}
    ORDER BY m.created_at ASC
  `

  // Decrypt message content if it's encrypted
  return messages.map((message) => {
    if (message.is_encrypted) {
      try {
        // Parse the encrypted content
        let encryptedContent
        try {
          encryptedContent = JSON.parse(message.content)
        } catch (e) {
          // If it's not valid JSON, return as is
          return message
        }

        // Check if the content has the expected format
        if (encryptedContent && encryptedContent.encrypted && encryptedContent.iv) {
          // Decrypt the content
          const decryptedContent = decrypt(encryptedContent.encrypted, encryptedContent.iv)
          return {
            ...message,
            content: decryptedContent,
          }
        }
      } catch (error) {
        console.error("Error decrypting message:", error)
      }
    }
    return message
  })
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