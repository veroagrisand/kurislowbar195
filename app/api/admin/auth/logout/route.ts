import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const sessionToken = cookies().get("admin-session")?.value

    if (sessionToken) {
      // Invalidate the session in the database
      await sql`DELETE FROM admin_sessions WHERE session_token = ${sessionToken}`
    }

    // Clear the session cookie
    cookies().set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Expire immediately
      path: "/",
    })

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
