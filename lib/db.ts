import { neon } from "@neondatabase/serverless"

// --- Database client -------------------------------------------------------
export const sql = neon(process.env.DATABASE_URL!)

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
  const result = await sql`
    SELECT * FROM coffee_options 
    WHERE is_active = true 
    ORDER BY price ASC
  `
  return result as CoffeeOption[]
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
  const result = await sql`
    INSERT INTO reservations (
      name, phone, email, date, time, people, 
      coffee_id, coffee_name, coffee_price, total_amount, notes
    ) VALUES (
      ${data.name}, ${data.phone}, ${data.email}, ${data.date}, ${data.time}, ${data.people},
      ${data.coffee_id}, ${data.coffee_name}, ${data.coffee_price}, ${data.total_amount}, ${data.notes}
    )
    RETURNING *
  `
  return result[0] as Reservation
}

export async function getReservations(limit = 50): Promise<Reservation[]> {
  const result = await sql`
    SELECT * FROM reservations 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `
  return result as Reservation[]
}

export async function getReservationById(id: number): Promise<Reservation | null> {
  const result = await sql`
    SELECT * FROM reservations 
    WHERE id = ${id}
  `
  return (result[0] as Reservation) || null
}

export async function updateReservationStatus(
  id: number,
  status: "pending" | "confirmed" | "completed" | "cancelled",
): Promise<Reservation | null> {
  const result = await sql`
    UPDATE reservations 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Reservation) || null
}

export async function confirmPayment(id: number): Promise<Reservation | null> {
  const result = await sql`
    UPDATE reservations 
    SET status = 'confirmed', payment_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return (result[0] as Reservation) || null
}

export async function findReservationsByContact(phone?: string, email?: string): Promise<Reservation[]> {
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
}

export async function getReservationStats() {
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
}

// New function to check time slot availability
export async function getTimeSlotAvailability(date: string): Promise<TimeSlotAvailability[]> {
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
    const availableSpots = Math.max(0, 5 - bookedPeople)

    return {
      time,
      available_spots: availableSpots,
      is_available: availableSpots > 0,
    }
  })
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
}

export async function findValidSession(sessionToken: string) {
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
    console.error("Database error:", error)
    return null
  }
}

// Admin-specific database functions
export async function findAdminByUsername(username: string) {
  try {
    const result = await sql`
      SELECT id, username, email, password_hash, full_name, role, is_active, last_login, created_at
      FROM admin_users 
      WHERE username = ${username} AND is_active = true
    `
    return result[0] || null
  } catch (error) {
    console.error("Database error:", error)
    return null
  }
}

export async function createAdminSession(userId: number, sessionToken: string, expiresAt: Date) {
  try {
    const result = await sql`
      INSERT INTO admin_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Database error:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    await sql`
      DELETE FROM admin_sessions 
      WHERE session_token = ${sessionToken}
    `
  } catch (error) {
    console.error("Database error:", error)
  }
}

export async function updateLastLogin(userId: number) {
  try {
    await sql`
      UPDATE admin_users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Database error:", error)
  }
}

export async function changeAdminPassword(userId: number, newPasswordHash: string) {
  try {
    await sql`
      UPDATE admin_users 
      SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

// Coffee options CRUD operations
export async function createCoffeeOption(data: {
  id: string
  name: string
  price: number
  description?: string
}): Promise<CoffeeOption> {
  const result = await sql`
    INSERT INTO coffee_options (id, name, price, description)
    VALUES (${data.id}, ${data.name}, ${data.price}, ${data.description || null})
    RETURNING *
  `
  return result[0] as CoffeeOption
}

export async function updateCoffeeOption(data: {
  id: string
  name: string
  price: number
  description?: string
}): Promise<CoffeeOption | null> {
  const result = await sql`
    UPDATE coffee_options 
    SET name = ${data.name}, price = ${data.price}, description = ${data.description || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${data.id}
    RETURNING *
  `
  return (result[0] as CoffeeOption) || null
}

export async function deleteCoffeeOption(id: string): Promise<boolean> {
  const result = await sql`
    UPDATE coffee_options 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result.length > 0
}

export async function getCoffeeOptionById(id: string): Promise<CoffeeOption | null> {
  const result = await sql`
    SELECT * FROM coffee_options 
    WHERE id = ${id} AND is_active = true
  `
  return (result[0] as CoffeeOption) || null
}
