import { type NextRequest, NextResponse } from "next/server"
import { createReservation, getCoffeeOptions, canMakeReservation } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, phone, date, time, people, coffee } = body
    if (!name || !phone || !date || !time || !people || !coffee) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if reservation can be made (availability check)
    const availabilityCheck = await canMakeReservation(date, time, Number.parseInt(people))

    if (!availabilityCheck.canBook) {
      return NextResponse.json(
        {
          error: availabilityCheck.message || "Cannot make reservation for this time slot",
          availableSpots: availabilityCheck.availableSpots,
        },
        { status: 400 },
      )
    }

    // Get coffee options to validate selection and get price
    const coffeeOptions = await getCoffeeOptions()
    const selectedCoffee = coffeeOptions.find((c) => c.id === coffee)

    if (!selectedCoffee) {
      return NextResponse.json({ error: "Invalid coffee selection" }, { status: 400 })
    }

    // Create reservation
    const reservation = await createReservation({
      name,
      phone,
      email: body.email || null,
      date,
      time,
      people: Number.parseInt(people),
      coffee_id: selectedCoffee.id,
      coffee_name: selectedCoffee.name,
      coffee_price: selectedCoffee.price,
      total_amount: selectedCoffee.price * Number.parseInt(people),
      notes: body.notes || null,
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}
