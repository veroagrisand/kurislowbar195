import { NextResponse } from "next/server"
import { deleteReservation, updateReservationStatus } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 })
    }

    await deleteReservation(id)
    revalidatePath("/admin") // Revalidate admin dashboard to reflect changes
    return NextResponse.json({ message: "Reservation deleted successfully" })
  } catch (error) {
    console.error(`Error deleting reservation ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 })
    }

    const { status } = await request.json()
    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const updatedReservation = await updateReservationStatus(id, status)
    if (!updatedReservation) {
      return NextResponse.json({ error: "Reservation not found or could not be updated" }, { status: 404 })
    }

    revalidatePath("/admin") // Revalidate admin dashboard to reflect changes
    return NextResponse.json({ message: "Reservation status updated successfully", reservation: updatedReservation })
  } catch (error) {
    console.error(`Error updating reservation ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update reservation status" }, { status: 500 })
  }
}
