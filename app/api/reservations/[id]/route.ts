import { NextResponse } from "next/server"
import { getReservationById, confirmPayment } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 })
    }

    const reservation = await getReservationById(id)
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error(`Error fetching reservation ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 })
    }

    // This route is specifically for confirming payment
    const updatedReservation = await confirmPayment(id)

    if (!updatedReservation) {
      return NextResponse.json({ error: "Reservation not found or payment already confirmed" }, { status: 404 })
    }

    revalidatePath("/confirmation") // Revalidate confirmation page if needed
    revalidatePath("/dashboard") // Revalidate dashboard for user's reservations
    revalidatePath("/admin") // Revalidate admin dashboard
    return NextResponse.json({ message: "Payment confirmed successfully", reservation: updatedReservation })
  } catch (error) {
    console.error(`Error confirming payment for reservation ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
