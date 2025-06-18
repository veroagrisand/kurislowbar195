import { type NextRequest, NextResponse } from "next/server"
import { getTimeSlotAvailability } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const availability = await getTimeSlotAvailability(date)
    return NextResponse.json({ availability })
  } catch (error) {
    console.error("Error fetching time slot availability:", error)
    return NextResponse.json({ error: "Failed to fetch time slot availability" }, { status: 500 })
  }
}
