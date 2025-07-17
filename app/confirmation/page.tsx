"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Home } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import type { Reservation } from "@/lib/db" // Import Reservation type

export default function ConfirmationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmReservation = async () => {
      const reservationId = localStorage.getItem("currentReservationId")
      if (!reservationId) {
        setError("No reservation ID found. Please make a reservation first.")
        setLoading(false)
        return
      }

      try {
        // Call API to confirm payment
        const response = await fetch(`/api/reservations/${reservationId}`, {
          method: "POST", // Use POST for state-changing operation
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to confirm reservation payment.")
        }

        setReservation(data.reservation)
        localStorage.removeItem("currentReservationId") // Clear ID after successful confirmation
        toast({
          title: "Payment Confirmed!",
          description: "Your reservation is now confirmed.",
        })
      } catch (err: any) {
        console.error("Error confirming payment:", err)
        setError(err.message || "An error occurred during payment confirmation.")
        toast({
          title: "Confirmation Failed",
          description: err.message || "Please try again or contact support.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    confirmReservation()
  }, [toast])

  if (loading) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Confirming your reservation...</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardHeader>
            {error ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              </motion.div>
            )}
            <CardTitle className="text-2xl">{error ? "Reservation Failed" : "Reservation Confirmed!"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="text-muted-foreground">{error}</p>
            ) : (
              <>
                <p className="text-muted-foreground">Thank you for your reservation at Kuri Coffee Slowbar 195.</p>
                {reservation && (
                  <div className="bg-muted p-4 rounded-md text-left space-y-2">
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
                      <strong>People:</strong> {reservation.people}
                    </p>
                    <p>
                      <strong>Coffee:</strong> {reservation.coffee_name}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> Rp {reservation.total_amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground">We look forward to seeing you!</p>
              </>
            )}
            <Button onClick={() => router.push("/")} className="w-full button-press">
              <Home className="mr-2 h-4 w-4" />
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  )
}
