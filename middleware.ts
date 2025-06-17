import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // No middleware needed for public routes
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
