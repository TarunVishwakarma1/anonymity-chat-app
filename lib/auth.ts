import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "./db"
import { compare, hash } from "bcrypt"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_please_change_in_production")

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createSession(userId: number): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  // Access cookies directly without awaiting it
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function getSession() {
  // Access cookies directly without awaiting it
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    return null
  }

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.userId) {
    return null
  }

  const user = await sql`
    SELECT id, username, email, avatar_url, created_at 
    FROM users 
    WHERE id = ${session.userId}
  `.then((res) => res[0] || null)

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function logout() {
  // Access cookies directly without awaiting it
  const cookieStore = await cookies()
  cookieStore.delete("session")
}