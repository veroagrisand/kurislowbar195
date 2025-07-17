import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated or session expired" }, { status: 401 })
    }

    // Get user details from database
    const users = await sql`
      SELECT id, username, email, full_name, role
      FROM admin_users 
      WHERE id = ${session.userId} AND is_active = true
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const user = users[0]

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
