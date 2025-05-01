import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon connection string
export const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle client using the SQL client
export const db = drizzle(sql)

// Helper function to encrypt data
export async function encryptData(data: string, key: string): Promise<string> {
  // In a real app, use a proper encryption library
  // This is a simplified example
  return Buffer.from(data).toString("base64")
}

// Helper function to decrypt data
export async function decryptData(encryptedData: string, key: string): Promise<string> {
  // In a real app, use a proper decryption library
  // This is a simplified example
  return Buffer.from(encryptedData, "base64").toString("utf-8")
}
