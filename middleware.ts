import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // protect every /admin route except the login page
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = req.cookies.has("admin-session")
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }
