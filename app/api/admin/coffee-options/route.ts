import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description } = body

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    // Generate ID from name
    const id = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // Check if coffee option already exists
    const existing = await sql`
      SELECT id FROM coffee_options WHERE id = ${id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Coffee option with this name already exists" }, { status: 400 })
    }

    // Insert new coffee option
    const result = await sql`
      INSERT INTO coffee_options (id, name, price, description)
      VALUES (${id}, ${name}, ${Number.parseInt(price)}, ${description || null})
      RETURNING *
    `

    return NextResponse.json({ coffeeOption: result[0] })
  } catch (error) {
    console.error("Error creating coffee option:", error)
    return NextResponse.json({ error: "Failed to create coffee option" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, price, description } = body

    if (!id || !name || !price) {
      return NextResponse.json({ error: "ID, name and price are required" }, { status: 400 })
    }

    // Update coffee option
    const result = await sql`
      UPDATE coffee_options 
      SET name = ${name}, price = ${Number.parseInt(price)}, description = ${description || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Coffee option not found" }, { status: 404 })
    }

    return NextResponse.json({ coffeeOption: result[0] })
  } catch (error) {
    console.error("Error updating coffee option:", error)
    return NextResponse.json({ error: "Failed to update coffee option" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Coffee option ID is required" }, { status: 400 })
    }

    // Delete coffee option
    const result = await sql`
      DELETE FROM coffee_options WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Coffee option not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coffee option deleted successfully" })
  } catch (error) {
    console.error("Error deleting coffee option:", error)
    return NextResponse.json({ error: "Failed to delete coffee option" }, { status: 500 })
  }
}
