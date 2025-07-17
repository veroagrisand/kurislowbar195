import { type NextRequest, NextResponse } from "next/server"
import { getReservationById, updateReservationStatus, confirmPayment } from "@/lib/db"
import { revalidatePath } from "next/cache" // Import revalidatePath

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const reservation = await getReservationById(id)

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    let reservation

    if (body.action === "confirm_payment") {
      reservation = await confirmPayment(id)
    } else if (body.status) {
      reservation = await updateReservationStatus(id, body.status)
    } else {
      return NextResponse.json({ error: "Invalid action or status" }, { status: 400 })
    }

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Revalidate paths after successful update
    revalidatePath("/admin") // <--- Added: Revalidate admin page
    revalidatePath("/dashboard") // <--- Added: Revalidate dashboard page

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}
