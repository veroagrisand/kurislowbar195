import { NextResponse } from "next/server"
import { getCoffeeOptions } from "@/lib/db"

export async function GET() {
  try {
    const coffeeOptions = await getCoffeeOptions()
    return NextResponse.json({ coffeeOptions })
  } catch (error) {
    console.error("Error fetching coffee options:", error)
    return NextResponse.json({ error: "Failed to fetch coffee options" }, { status: 500 })
  }
}
