import { sql } from "./db"
import { cookies } from "next/headers"
import { createHash } from "crypto"

// Hash a password
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

// Verify a password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hashed = hashPassword(password)
  return hashed === hashedPassword
}

// Get the current user from cookies
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return null
  }

  try {
    const users = await sql`
      SELECT id, username, email, avatar_url 
      FROM users 
      WHERE id = ${Number.parseInt(userId, 10)}
    `

    if (users.length === 0) {
      return null
    }

    // Ensure the user object has the expected properties
    const user = users[0]
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
    }
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

// Create a new user
export async function createUser(username: string, email: string, password: string) {
  const hashedPassword = hashPassword(password)

  try {
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email
    `

    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

// Login a user
export async function loginUser(usernameOrEmail: string, password: string) {
  try {
    const users = await sql`
      SELECT id, username, email, password_hash
      FROM users
      WHERE username = ${usernameOrEmail} OR email = ${usernameOrEmail}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    if (!verifyPassword(password, user.password_hash)) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    }
  } catch (error) {
    console.error("Error logging in:", error)
    throw new Error("Failed to login")
  }
}
