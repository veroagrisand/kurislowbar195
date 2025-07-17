import { type NextRequest, NextResponse } from "next/server"
import { findReservationsByContact } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const email = searchParams.get("email")

    if (!phone && !email) {
      return NextResponse.json({ error: "Either phone or email is required" }, { status: 400 })
    }

    const reservations = await findReservationsByContact(phone || undefined, email || undefined)
    return NextResponse.json({ reservations })
  } catch (error) {
    console.error("Error searching reservations:", error)
    return NextResponse.json({ error: "Failed to search reservations" }, { status: 500 })
  }
}
