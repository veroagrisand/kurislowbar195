"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Coffee, ArrowRight, MapPin, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import { AnimatedCard } from "@/components/animated-card"

interface CoffeeOption {
  id: string
  name: string
  price: number
  description?: string
}

interface TimeSlot {
  time: string
  available_spots: number
  is_available: boolean
}

export default function ReservationPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    people: "1",
    coffee_id: "",
    notes: "",
  })

  useEffect(() => {
    fetchCoffeeOptions()
  }, [])

  useEffect(() => {
    if (formData.date) {
      fetchTimeSlots(formData.date)
    }
  }, [formData.date])

  const fetchCoffeeOptions = async () => {
    try {
      const response = await fetch("/api/coffee-options")
      const data = await response.json()

      if (response.ok) {
        setCoffeeOptions(data.coffeeOptions || [])
      } else {
        throw new Error(data.error || "Failed to fetch coffee options")
      }
    } catch (error) {
      console.error("Error fetching coffee options:", error)
      toast({
        title: "Error",
        description: "Failed to load coffee options. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const fetchTimeSlots = async (date: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/time-slots?date=${date}`)
      const data = await response.json()

      if (response.ok) {
        setTimeSlots(data.timeSlots || [])
      } else {
        throw new Error(data.error || "Failed to fetch time slots")
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.coffee_id) {
        throw new Error("Please fill in all required fields")
      }

      // Get selected coffee option
      const selectedCoffee = coffeeOptions.find((coffee) => coffee.id === formData.coffee_id)
      if (!selectedCoffee) {
        throw new Error("Please select a coffee option")
      }

      // Calculate total amount
      const people = Number.parseInt(formData.people)
      const totalAmount = selectedCoffee.price * people

      // Prepare reservation data
      const reservationData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        date: formData.date,
        time: formData.time,
        people,
        coffee_id: formData.coffee_id,
        coffee_name: selectedCoffee.name,
        coffee_price: selectedCoffee.price,
        total_amount: totalAmount,
        notes: formData.notes || undefined,
      }

      // Submit reservation
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create reservation")
      }

      // Success - redirect to confirmation page
      toast({
        title: "Reservation Created!",
        description: "Your reservation has been successfully created.",
      })

      router.push(`/confirmation?id=${data.reservation.id}`)
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCoffee = coffeeOptions.find((coffee) => coffee.id === formData.coffee_id)
  const totalAmount = selectedCoffee ? selectedCoffee.price * Number.parseInt(formData.people) : 0

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Make a Reservation</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Reserve your table and enjoy our premium coffee experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reservation Form */}
            <div className="lg:col-span-2">
              <AnimatedCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Reservation Details
                    </CardTitle>
                    <CardDescription>Fill in your reservation information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email (optional)"
                        />
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            min={today}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time *</Label>
                          <Select
                            value={formData.time}
                            onValueChange={(value) => setFormData({ ...formData, time: value })}
                            disabled={!formData.date || loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={loading ? "Loading..." : "Select time"} />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem
                                  key={slot.time}
                                  value={slot.time}
                                  disabled={!slot.is_available}
                                  className={!slot.is_available ? "opacity-50" : ""}
                                >
                                  {slot.time} {slot.is_available ? `(${slot.available_spots} spots left)` : "(Full)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* People and Coffee */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="people">Number of People *</Label>
                          <Select
                            value={formData.people}
                            onValueChange={(value) => setFormData({ ...formData, people: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} {num === 1 ? "Person" : "People"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coffee">Coffee Selection *</Label>
                          <Select
                            value={formData.coffee_id}
                            onValueChange={(value) => setFormData({ ...formData, coffee_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select coffee" />
                            </SelectTrigger>
                            <SelectContent>
                              {coffeeOptions.map((coffee) => (
                                <SelectItem key={coffee.id} value={coffee.id}>
                                  {coffee.name} - Rp {coffee.price.toLocaleString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Special Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Special Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Any special requests or dietary requirements..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                        {submitting ? (
                          "Creating Reservation..."
                        ) : (
                          <>
                            Create Reservation
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Summary and Info */}
            <div className="space-y-6">
              {/* Reservation Summary */}
              <AnimatedCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Reservation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                    )}
                    {formData.date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{formData.date}</span>
                      </div>
                    )}
                    {formData.time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formData.time}</span>
                      </div>
                    )}
                    {formData.people && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">People:</span>
                        <span className="font-medium">{formData.people}</span>
                      </div>
                    )}
                    {selectedCoffee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coffee:</span>
                        <span className="font-medium">{selectedCoffee.name}</span>
                      </div>
                    )}
                    {totalAmount > 0 && (
                      <>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>Rp {totalAmount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* Contact Information */}
              <AnimatedCard>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>+62 123 456 789</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>info@kuricoffee195.com</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <span>Jl. Coffee Street No. 195, Jakarta, Indonesia</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
