import { type NextRequest, NextResponse } from "next/server"
import { createReservation, getCoffeeOptions, canMakeReservation } from "@/lib/db"
import { Resend } from "resend"

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

    // --- Email Sending Logic ---
    try {
      const resend = new Resend(process.env.RESEND_API_KEY) // Initialize Resend with your API key

      const emailBody = `
        <h1>Reservation Confirmation for Kuri Coffee Slowbar 195</h1>
        <p>Dear ${reservation.name},</p>
        <p>Your reservation has been successfully confirmed!</p>
        <p><strong>Reservation ID:</strong> RES-${reservation.id}</p>
        <p><strong>Date:</strong> ${reservation.date}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Number of People:</strong> ${reservation.people}</p>
        <p><strong>Coffee Selection:</strong> ${reservation.coffee_name}</p>
        <p><strong>Total Amount:</strong> Rp ${reservation.total_amount.toLocaleString()}</p>
        ${reservation.notes ? `<p><strong>Special Notes:</strong> ${reservation.notes}</p>` : ""}
        <p>We look forward to seeing you!</p>
        <p>Best regards,</p>
        <p>The Kuri Coffee Slowbar 195 Team</p>
      `

      await resend.emails.send({
        from: "onboarding@resend.dev", // Replace with your verified sender email
        to: reservation.email || "default@example.com", // Use reservation email or a fallback
        subject: `Kuri Coffee Reservation Confirmed: RES-${reservation.id}`,
        html: emailBody,
      })

      console.log(`Confirmation email sent for reservation ID: ${reservation.id}`)
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // You might want to log this error but still return success for the reservation
    }
    // --- End Email Sending Logic ---

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}
