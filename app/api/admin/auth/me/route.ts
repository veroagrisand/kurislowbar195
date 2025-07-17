import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated or session expired" }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
