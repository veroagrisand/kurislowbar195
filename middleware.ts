import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Verify session and check expiration
    const session = await decrypt(sessionToken)
    if (!session || new Date(session.expiresAt) < new Date()) {
      // Session expired, redirect to login
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("admin-session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
