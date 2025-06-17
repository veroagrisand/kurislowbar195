"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, Clock, Users, Coffee, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/page-wrapper"
import { AnimatedCard } from "@/components/animated-card"

interface Reservation {
  id: number
  name: string
  phone: string
  email?: string
  date: string
  time: string
  people: number
  coffee_name: string
  total_amount: number
  notes?: string
  status: string
}

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

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservation, setReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    const reservationId = searchParams.get("id")
    if (!reservationId) {
      router.push("/")
      return
    }
    fetchReservation(reservationId)
  }, [router, searchParams])

  const fetchReservation = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reservation")
      }

      setReservation(data.reservation)
    } catch (error) {
      console.error("Error fetching reservation:", error)
      router.push("/")
    }
  }

  if (!reservation) {
    return (
      <PageWrapper className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="loading-shimmer w-8 h-8 rounded-full mx-auto mb-4"
          />
          <p>Loading confirmation details...</p>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-green-800 dark:text-green-400 mb-2"
          >
            Reservation Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-green-600 dark:text-green-500"
          >
            Thank you for choosing Coffee Kuri Slowbar 195
          </motion.p>
        </motion.div>

        <AnimatedCard delay={0.9}>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>Please save this information for your records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-3">
                {[
                  { icon: Users, label: "Customer", value: reservation.name },
                  { icon: Phone, label: "Phone", value: reservation.phone },
                  ...(reservation.email ? [{ icon: Mail, label: "Email", value: reservation.email }] : []),
                ].map((item, index) => (
                  <motion.div key={item.label} variants={itemVariants} className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <item.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { icon: Calendar, label: "Date", value: reservation.date },
                  { icon: Clock, label: "Time", value: reservation.time },
                  { icon: Users, label: "Party Size", value: `${reservation.people} people` },
                ].map((item, index) => (
                  <motion.div key={item.label} variants={itemVariants} className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <item.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="border-t pt-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                  <Coffee className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coffee Selection</p>
                  <p className="font-medium">{reservation.coffee_name}</p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="bg-green-50 dark:bg-green-950 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Paid:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {reservation.total_amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">Reference: RES-{reservation.id}</p>
              </motion.div>
            </motion.div>

            {reservation.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 }}
                className="border-t pt-4"
              >
                <p className="text-sm text-muted-foreground mb-2">Special Notes:</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{reservation.notes}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg"
            >
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Important Information:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Please arrive 10 minutes before your reservation time</li>
                <li>• Your table will be held for 15 minutes past reservation time</li>
                <li>• For changes or cancellations, please call us at least 2 hours in advance</li>
                <li>• Contact: +62 812-3456-7890</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3 }}
              className="flex gap-3"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button onClick={() => router.push("/")} variant="outline" className="w-full button-press">
                  Make Another Reservation
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button onClick={() => window.print()} className="w-full button-press">
                  Print Confirmation
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </AnimatedCard>
      </div>
    </PageWrapper>
  )
}
