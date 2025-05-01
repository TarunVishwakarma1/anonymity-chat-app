import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    const user = await createUser(username, email, password)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
