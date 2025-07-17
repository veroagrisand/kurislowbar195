import { NextResponse } from "next/server"
import { getReservationsForAdmin } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reservations, stats } = await getReservationsForAdmin()
    return NextResponse.json({ reservations, stats })
  } catch (error) {
    console.error("Error fetching admin reservations:", error)
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 })
  }
}
