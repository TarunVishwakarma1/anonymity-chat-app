import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username} LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate random avatar
    const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`

    // Create user
    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, avatar_url, created_at)
      VALUES (${username}, ${email}, ${passwordHash}, ${avatarUrl}, NOW())
      RETURNING id, username, email, avatar_url, created_at
    `

    // Create session
    const token = await createSession(newUser[0].id)

    return NextResponse.json({
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        avatarUrl: newUser[0].avatar_url,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
