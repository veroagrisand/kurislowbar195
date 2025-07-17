import { neon } from "@neondatabase/serverless"
import { unstable_noStore as noStore } from "next/cache"

// Check for DATABASE_URL at the very top to catch early configuration errors
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is not set.")
  // Throwing an error here will prevent the application from starting if the DB URL is missing.
  // In a production environment, this is preferable to silent failures.
  throw new Error("DATABASE_URL environment variable is not set. Please configure it in Vercel.")
}

export const sql = neon(process.env.DATABASE_URL)

// Types
export interface Reservation {
  id: number
  name: string
  phone: string
  email?: string
  date: string
  time: string
  people: number
  coffee_id: string
  coffee_name: string
  coffee_price: number
  total_amount: number
  notes?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_time?: string
  created_at: string
  updated_at: string
}

export interface CoffeeOption {
  id: string
  name: string
  price: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TimeSlotAvailability {
  time: string
  available_spots: number
  is_available: boolean
}

// Database functions
export async function getCoffeeOptions(): Promise<CoffeeOption[]> {
  noStore() // Opt-out of Next.js Data Cache for this fetch
  try {
    const coffeeOptions =
      await sql`SELECT id, name, price, description, is_active FROM coffee_options ORDER BY name ASC`
    return coffeeOptions as CoffeeOption[]
  } catch (error) {
    console.error("Database Error: Failed to fetch coffee options.", error)
    throw new Error("Failed to fetch coffee options.")
  }
}

export async function addCoffeeOption(name: string, price: number, description?: string): Promise<CoffeeOption> {
  noStore()
  try {
    const [newCoffee] = await sql`
      INSERT INTO coffee_options (name, price, description)
      VALUES (${name}, ${price}, ${description || null})
      RETURNING id, name, price, description, is_active
    `
    return newCoffee as CoffeeOption
  } catch (error) {
    console.error("Database Error: Failed to add coffee option.", error)
    throw new Error("Failed to add coffee option.")
  }
}

export async function updateCoffeeOption(
  id: string,
  name: string,
  price: number,
  description?: string,
  is_active?: boolean,
): Promise<CoffeeOption> {
  noStore()
  try {
    const [updatedCoffee] = await sql`
      UPDATE coffee_options
      SET name = ${name}, price = ${price}, description = ${description || null}, is_active = ${is_active ?? true}
      WHERE id = ${id}
      RETURNING id, name, price, description, is_active
    `
    return updatedCoffee as CoffeeOption
  } catch (error) {
    console.error("Database Error: Failed to update coffee option.", error)
    throw new Error("Failed to update coffee option.")
  }
}

export async function deleteCoffeeOption(id: string): Promise<void> {
  noStore()
  try {
    await sql`DELETE FROM coffee_options WHERE id = ${id}`
  } catch (error) {
    console.error("Database Error: Failed to delete coffee option.", error)
    throw new Error("Failed to delete coffee option.")
  }
}

export async function createReservation(data: {
  name: string
  phone: string
  email?: string
  date: string
  time: string
  people: number
  coffee_id: string
  coffee_name: string
  coffee_price: number
  total_amount: number
  notes?: string
}): Promise<Reservation> {
  noStore()
  try {
    const result = await sql`
      INSERT INTO reservations (
        name, phone, email, date, time, people, 
        coffee_id, coffee_name, coffee_price, total_amount, notes
      ) VALUES (
        ${data.name}, ${data.phone}, ${data.email}, ${data.date}, ${data.time}, ${data.people},
        ${data.coffee_id}, ${data.coffee_name}, ${data.coffee_price}, ${data.total_amount}, ${data.notes}
      )
      RETURNING id, name, phone, email, date, time, people, coffee_name, coffee_price, total_amount, notes, status, created_at
    `
    return result[0] as Reservation
  } catch (error) {
    console.error("Database Error: Failed to create reservation.", error)
    throw new Error("Failed to create reservation.")
  }
}

export async function getReservations(limit = 50): Promise<Reservation[]> {
  noStore()
  try {
    const result = await sql`
      SELECT * FROM reservations 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result as Reservation[]
  } catch (error) {
    console.error("Database Error: Failed to fetch reservations.", error)
    throw new Error("Failed to fetch reservations.")
  }
}

/**
 * Fetch a larger set of reservation rows (with coffee details) for the admin
 * dashboard.  The query joins coffee_options so we always have the current
 * coffee name / price even if the option was later edited.
 *
 * @param limit   max rows to return (default 250)
 * @returns       array of Reservation records sorted by newest first
 */
export async function getReservationsForAdmin(limit = 250): Promise<Reservation[]> {
  noStore() // skip Next.js data cache

  try {
    const rows = await sql`
      SELECT
        r.id,
        r.name,
        r.phone,
        r.email,
        r.date,
        r.time,
        r.people,
        co.id      AS coffee_id,
        co.name    AS coffee_name,
        co.price   AS coffee_price,
        r.total_amount,
        r.notes,
        r.status,
        r.payment_time,
        r.created_at,
        r.updated_at
      FROM reservations r
      JOIN coffee_options co ON r.coffee_option_id = co.id
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `
    return rows as Reservation[]
  } catch (error) {
    console.error("Database Error: failed to fetch admin reservations.", error)
    throw new Error("Failed to fetch reservations for admin.")
  }
}

export async function getReservationById(id: number): Promise<Reservation | null> {
  noStore()
  try {
    const result = await sql`
      SELECT
        r.id,
        r.name,
        r.phone,
        r.email,
        r.date,
        r.time,
        r.people,
        co.name AS coffee_name,
        co.price AS coffee_price,
        r.total_amount,
        r.notes,
        r.status,
        r.created_at,
        r.payment_time
      FROM reservations r
      JOIN coffee_options co ON r.coffee_option_id = co.id
      WHERE r.id = ${id}
    `
    return (result[0] as Reservation) || null
  } catch (error) {
    console.error("Database Error: Failed to fetch reservation by ID.", error)
    throw new Error("Failed to fetch reservation.")
  }
}

export async function updateReservationStatus(
  id: number,
  status: "pending" | "confirmed" | "completed" | "cancelled",
): Promise<Reservation | null> {
  noStore()
  try {
    const result = await sql`
      UPDATE reservations 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, status
    `
    return (result[0] as Reservation) || null
  } catch (error) {
    console.error("Database Error: Failed to update reservation status.", error)
    throw new Error("Failed to update reservation status.")
  }
}

export async function confirmPayment(id: number): Promise<Reservation | null> {
  noStore()
  try {
    const result = await sql`
      UPDATE reservations 
      SET status = 'confirmed', payment_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, status, payment_time
    `
    return (result[0] as Reservation) || null
  } catch (error) {
    console.error("Database Error: Failed to confirm payment.", error)
    throw new Error("Failed to confirm payment.")
  }
}

export async function findReservationsByContact(phone?: string, email?: string): Promise<Reservation[]> {
  noStore()
  try {
    if (!phone && !email) {
      return []
    }

    let query = `SELECT * FROM reservations WHERE `
    const conditions = []
    const params = []

    if (phone) {
      conditions.push(`phone = $${params.length + 1}`)
      params.push(phone)
    }

    if (email) {
      conditions.push(`email = $${params.length + 1}`)
      params.push(email)
    }

    query += conditions.join(" OR ")
    query += ` ORDER BY created_at DESC`

    const result = await sql(query, params)
    return result as Reservation[]
  } catch (error) {
    console.error("Database Error: Failed to find reservations by contact.", error)
    throw new Error("Failed to find reservations.")
  }
}

export async function getReservationStats() {
  noStore()
  try {
    const totalReservations = await sql`SELECT COUNT(*) as count FROM reservations`
    const todayReservations = await sql`
      SELECT COUNT(*) as count FROM reservations 
      WHERE date = CURRENT_DATE
    `
    const totalRevenue = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as revenue FROM reservations 
      WHERE status IN ('confirmed', 'completed')
    `
    const pendingReservations = await sql`
      SELECT COUNT(*) as count FROM reservations 
      WHERE status = 'pending'
    `

    return {
      total: Number(totalReservations[0].count),
      today: Number(todayReservations[0].count),
      revenue: Number(totalRevenue[0].revenue),
      pending: Number(pendingReservations[0].count),
    }
  } catch (error) {
    console.error("Database Error: Failed to get reservation stats.", error)
    throw new Error("Failed to get reservation stats.")
  }
}

// New function to check time slot availability
export async function getTimeSlotAvailability(date: string): Promise<TimeSlotAvailability[]> {
  noStore()
  try {
    const timeSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ]

    // Get current reservations for the date (excluding cancelled reservations)
    const reservations = await sql`
      SELECT time, SUM(people) as total_people
      FROM reservations 
      WHERE date = ${date} AND status != 'cancelled'
      GROUP BY time
    `

    const reservationMap = new Map<string, number>()
    reservations.forEach((res: any) => {
      reservationMap.set(res.time, Number(res.total_people))
    })

    return timeSlots.map((time) => {
      const bookedPeople = reservationMap.get(time) || 0
      const availableSpots = Math.max(0, 5 - bookedPeople) // Assuming max 5 people per slot

      return {
        time,
        available_spots: availableSpots,
        is_available: availableSpots > 0,
      }
    })
  } catch (error) {
    console.error("Database Error: Failed to get time slot availability.", error)
    throw new Error("Failed to get time slot availability.")
  }
}

// New function to check if a reservation can be made
export async function canMakeReservation(
  date: string,
  time: string,
  people: number,
): Promise<{
  canBook: boolean
  availableSpots: number
  message?: string
}> {
  noStore()
  try {
    const availability = await getTimeSlotAvailability(date)
    const timeSlot = availability.find((slot) => slot.time === time)

    if (!timeSlot) {
      return {
        canBook: false,
        availableSpots: 0,
        message: "Invalid time slot",
      }
    }

    if (!timeSlot.is_available) {
      return {
        canBook: false,
        availableSpots: timeSlot.available_spots,
        message: "This time slot is fully booked",
      }
    }

    if (people > timeSlot.available_spots) {
      return {
        canBook: false,
        availableSpots: timeSlot.available_spots,
        message: `Only ${timeSlot.available_spots} spots available for this time slot`,
      }
    }

    return {
      canBook: true,
      availableSpots: timeSlot.available_spots,
    }
  } catch (error) {
    console.error("Database Error: Failed to check reservation availability.", error)
    throw new Error("Failed to check reservation availability.")
  }
}

export async function getAdminUser(username: string) {
  noStore()
  try {
    const [user] = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username}`
    return user
  } catch (error) {
    console.error("Database Error: Failed to fetch admin user.", error)
    throw new Error("Failed to fetch admin user.")
  }
}

export async function updateAdminPassword(id: string, newPasswordHash: string) {
  noStore()
  try {
    await sql`UPDATE admin_users SET password_hash = ${newPasswordHash} WHERE id = ${id}`
  } catch (error) {
    console.error("Database Error: Failed to update admin password.", error)
    throw new Error("Failed to update admin password.")
  }
}

export async function findValidSession(sessionToken: string) {
  noStore()
  try {
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.username, u.email, u.full_name, u.role
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
      AND u.is_active = true
    `

    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    return {
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email,
        full_name: session.full_name,
        role: session.role,
      },
    }
  } catch (error) {
    console.error("Database error: Failed to find valid session.", error)
    return null
  }
}

export async function deleteReservation(id: number) {
  noStore()
  try {
    await sql`DELETE FROM reservations WHERE id = ${id}`
  } catch (error) {
    console.error("Database Error: Failed to delete reservation.", error)
    throw new Error("Failed to delete reservation.")
  }
}
