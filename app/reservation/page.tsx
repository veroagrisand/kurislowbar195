"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Coffee, CreditCard } from "lucide-react"
import { motion } from "framer-motion"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function ReservationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    people: "",
    coffee: "",
    notes: "",
  })

  useEffect(() => {
    fetchCoffeeOptions()
  }, [])

  const fetchCoffeeOptions = async () => {
    try {
      const response = await fetch("/api/coffee-options")
      const data = await response.json()
      setCoffeeOptions(data.coffeeOptions)
    } catch (error) {
      console.error("Error fetching coffee options:", error)
      toast({
        title: "Error",
        description: "Failed to load coffee options",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.people || !formData.coffee) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create reservation")
      }

      // Store reservation ID for payment page
      localStorage.setItem("currentReservationId", data.reservation.id.toString())

      toast({
        title: "Success",
        description: "Reservation created successfully!",
      })

      router.push("/payment")
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCoffee = coffeeOptions.find((c) => c.id === formData.coffee)
  const totalAmount = selectedCoffee ? selectedCoffee.price * Number.parseInt(formData.people || "1") : 0

  return (
    <PageWrapper className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Make a Reservation</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Coffee Kuri Slowbar 195</p>
          <div className="mt-4 flex gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => router.push("/")} className="button-press text-sm sm:text-base">
                Back to Home
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <AnimatedCard delay={0.2}>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.div>
              Table Reservation
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Book your table and select your preferred coffee beans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                  className="text-sm sm:text-base"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    Time *
                  </Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="text-sm sm:text-base">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people" className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    People *
                  </Label>
                  <Select
                    value={formData.people}
                    onValueChange={(value) => setFormData({ ...formData, people: value })}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Number" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()} className="text-sm sm:text-base">
                          {num} {num === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="coffee" className="text-sm sm:text-base">
                  Coffee Selection *
                </Label>
                <Select value={formData.coffee} onValueChange={(value) => setFormData({ ...formData, coffee: value })}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Choose your coffee" />
                  </SelectTrigger>
                  <SelectContent>
                    {coffeeOptions.map((coffee) => (
                      <SelectItem key={coffee.id} value={coffee.id} className="text-sm sm:text-base">
                        {coffee.name} - Rp {coffee.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="notes" className="text-sm sm:text-base">
                  Special Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or dietary requirements..."
                  rows={3}
                  className="text-sm sm:text-base resize-none"
                />
              </motion.div>

              {totalAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-coffee-50 dark:bg-coffee-950 border-coffee-200 dark:border-coffee-800">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm sm:text-base">Total Amount:</span>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="text-xl sm:text-2xl font-bold text-coffee-600"
                        >
                          Rp {totalAmount.toLocaleString()}
                        </motion.span>
                      </div>
                      <p className="text-xs sm:text-sm text-coffee-700 dark:text-coffee-300 mt-2">
                        {selectedCoffee?.name} × {formData.people} people
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full button-press text-sm sm:text-base"
                    size="lg"
                    disabled={loading}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {loading ? "Creating Reservation..." : "Proceed to Payment"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </CardContent>
        </AnimatedCard>
      </div>
    </PageWrapper>
  )
}
