import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Return user data, excluding sensitive info like password hash
    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error("Me API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
