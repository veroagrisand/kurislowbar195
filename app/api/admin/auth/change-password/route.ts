import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getAdminSession } from "@/lib/auth"
import { getAdminUser, updateAdminPassword } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    const user = await getAdminUser(session.user.username)

    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 401 })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    await updateAdminPassword(user.id, newPasswordHash)

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
