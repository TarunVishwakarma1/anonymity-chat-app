import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/register" || path.startsWith("/api/")

  // Get the authentication cookie
  const userId = request.cookies.get("userId")?.value

  // Redirect to login if accessing a protected route without authentication
  if (!isPublicPath && !userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to rooms if accessing login/register while authenticated
  if ((path === "/login" || path === "/register") && userId) {
    return NextResponse.redirect(new URL("/rooms", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
