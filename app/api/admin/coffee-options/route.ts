import { NextResponse } from "next/server"
import { getCoffeeOptions, addCoffeeOption, updateCoffeeOption, deleteCoffeeOption } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coffeeOptions = await getCoffeeOptions()
    return NextResponse.json({ coffeeOptions })
  } catch (error) {
    console.error("Error fetching coffee options for admin:", error)
    return NextResponse.json({ error: "Failed to fetch coffee options" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, price, description } = await request.json()
    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const newCoffee = await addCoffeeOption(name, price, description)
    revalidatePath("/admin") // Revalidate admin dashboard
    revalidatePath("/") // Revalidate public landing page
    revalidatePath("/reservation") // Revalidate reservation page
    return NextResponse.json({ newCoffee }, { status: 201 })
  } catch (error) {
    console.error("Error adding coffee option:", error)
    return NextResponse.json({ error: "Failed to add coffee option" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, price, description, is_active } = await request.json()
    if (!id || !name || price === undefined || is_active === undefined) {
      return NextResponse.json({ error: "ID, name, price, and active status are required" }, { status: 400 })
    }

    const updatedCoffee = await updateCoffeeOption(id, name, price, description, is_active)
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/reservation")
    return NextResponse.json({ updatedCoffee })
  } catch (error) {
    console.error("Error updating coffee option:", error)
    return NextResponse.json({ error: "Failed to update coffee option" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await deleteCoffeeOption(id)
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/reservation")
    return NextResponse.json({ message: "Coffee option deleted successfully" })
  } catch (error) {
    console.error("Error deleting coffee option:", error)
    return NextResponse.json({ error: "Failed to delete coffee option" }, { status: 500 })
  }
}
