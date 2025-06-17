import { type NextRequest, NextResponse } from "next/server"
import { findReservationsByContact } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email } = body

    if (!phone && !email) {
      return NextResponse.json({ error: "Phone number or email is required" }, { status: 400 })
    }

    const reservations = await findReservationsByContact(phone, email)
    return NextResponse.json({ reservations })
  } catch (error) {
    console.error("Error searching reservations:", error)
    return NextResponse.json({ error: "Failed to search reservations" }, { status: 500 })
  }
}
