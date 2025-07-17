import { NextResponse } from "next/server"
import { getReservations, getReservationStats } from "@/lib/db"

export async function GET() {
  try {
    const reservations = await getReservations()
    const stats = await getReservationStats()

    return NextResponse.json({
      reservations,
      stats,
    })
  } catch (error) {
    console.error("Error fetching admin reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}
