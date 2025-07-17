import { type NextRequest, NextResponse } from "next/server"
import { createCoffeeOption, updateCoffeeOption, deleteCoffeeOption } from "@/lib/db"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description } = body

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    // Validate price is a positive number
    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
    }

    // Generate ID from name
    const id = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50) // Limit length

    if (!id) {
      return NextResponse.json({ error: "Invalid coffee name" }, { status: 400 })
    }

    // Check if coffee option already exists
    const existing = await sql`
      SELECT id FROM coffee_options WHERE id = ${id} AND is_active = true
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Coffee option with this name already exists" }, { status: 400 })
    }

    // Create new coffee option
    const coffeeOption = await createCoffeeOption({
      id,
      name: name.trim(),
      price: numPrice,
      description: description?.trim() || null,
    })

    return NextResponse.json({ coffeeOption })
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

    // Validate price is a positive number
    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
    }

    // Update coffee option
    const coffeeOption = await updateCoffeeOption({
      id: id.trim(),
      name: name.trim(),
      price: numPrice,
      description: description?.trim() || null,
    })

    if (!coffeeOption) {
      return NextResponse.json({ error: "Coffee option not found" }, { status: 404 })
    }

    return NextResponse.json({ coffeeOption })
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

    // Delete coffee option (soft delete)
    const success = await deleteCoffeeOption(id)

    if (!success) {
      return NextResponse.json({ error: "Coffee option not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coffee option deleted successfully" })
  } catch (error) {
    console.error("Error deleting coffee option:", error)
    return NextResponse.json({ error: "Failed to delete coffee option" }, { status: 500 })
  }
}
