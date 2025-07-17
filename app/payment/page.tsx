"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle, Loader2, ArrowRight, Home, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import type { Reservation } from "@/lib/db" // Import Reservation type

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservationDetails = async () => {
      const reservationId = localStorage.getItem("currentReservationId")
      if (!reservationId) {
        setError("No reservation ID found. Please make a reservation first.")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/reservations/${reservationId}`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch reservation details.")
        }

        setReservation(data.reservation)
      } catch (err: any) {
        console.error("Error fetching reservation details:", err)
        setError(err.message || "Failed to load reservation details.")
        toast({
          title: "Error",
          description: err.message || "Failed to load reservation details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReservationDetails()
  }, [toast])

  const handlePaymentComplete = () => {
    router.push("/confirmation")
  }

  if (loading) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading payment details...</p>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          <Card>
            <CardHeader>
              <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Error Loading Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/reservation")} className="w-full button-press">
                Go Back to Reservation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </PageWrapper>
    )
  }

  if (!reservation) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          <Card>
            <CardHeader>
              <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Reservation Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">It seems there's no active reservation to process payment for.</p>
              <Button onClick={() => router.push("/reservation")} className="w-full button-press">
                Make a New Reservation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Complete Your Payment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Scan the QRIS code to finalize your reservation.</p>
          <div className="mt-4 flex gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => router.push("/")} className="button-press text-sm sm:text-base">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <Card>
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="h-5 w-5 text-green-500" /> Payment Details
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Please make a payment of{" "}
              <span className="font-bold text-foreground">Rp {reservation.total_amount.toLocaleString("id-ID")}</span>{" "}
              for your reservation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Scan to Pay (QRIS)</p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-48 h-48 sm:w-64 sm:h-64 bg-white p-2 rounded-lg shadow-md"
              >
                <Image
                  src="/images/qris-code.jpg"
                  alt="QRIS Payment Code"
                  fill
                  className="object-contain rounded-md"
                  priority
                />
              </motion.div>
              <p className="text-xs text-muted-foreground mt-2">(This is a placeholder QRIS code for demonstration)</p>
            </div>

            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Reservation ID:</strong> RES-{reservation.id}
              </p>
              <p>
                <strong>Name:</strong> {reservation.name}
              </p>
              <p>
                <strong>Date:</strong> {reservation.date}
              </p>
              <p>
                <strong>Time:</strong> {reservation.time}
              </p>
              <p>
                <strong>Number of People:</strong> {reservation.people}
              </p>
              <p>
                <strong>Coffee Selection:</strong> {reservation.coffee_name}
              </p>
              <p className="text-lg font-bold text-primary">
                Total Amount: Rp {reservation.total_amount.toLocaleString("id-ID")}
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handlePaymentComplete} className="w-full button-press" size="lg">
                I have completed the payment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
