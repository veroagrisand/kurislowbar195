import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { createSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Get admin user from database
    const result = await sql`
      SELECT id, username, password_hash 
      FROM admin_users 
      WHERE username = ${username}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: `User '${username}' not found` }, { status: 401 })
    }

    const admin = result[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create session with 1-hour expiration
    await createSession(admin.id.toString(), admin.username)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      expiresIn: "1 hour",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
