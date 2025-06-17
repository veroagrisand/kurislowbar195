"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, CheckCircle, Clock, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
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
  status: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed">("pending")
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const reservationId = localStorage.getItem("currentReservationId")
    if (!reservationId) {
      router.push("/")
      return
    }
    fetchReservation(reservationId)
  }, [router])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

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
      toast({
        title: "Error",
        description: "Failed to load reservation details",
        variant: "destructive",
      })
      router.push("/")
    }
  }

  const handlePaymentConfirm = async () => {
    if (!reservation) return

    setLoading(true)

    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "confirm_payment" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm payment")
      }

      setPaymentStatus("completed")
      localStorage.removeItem("currentReservationId")

      toast({
        title: "Payment Successful!",
        description: "Your reservation has been confirmed.",
      })

      setTimeout(() => {
        router.push(`/confirmation?id=${reservation.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Payment details copied to clipboard",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
          <p>Loading reservation details...</p>
        </motion.div>
      </PageWrapper>
    )
  }

  if (paymentStatus === "completed") {
    return (
      <PageWrapper className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2"
              >
                Payment Successful!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-green-600 dark:text-green-400"
              >
                Your reservation has been confirmed.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="ghost" onClick={() => router.push("/reservation")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reservation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Payment</h1>
          <div className="flex items-center justify-center gap-2 text-coffee-600 dark:text-coffee-400">
            <Clock className="h-4 w-4" />
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-lg"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <span className="text-sm">remaining</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle>Reservation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-between"
              >
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{reservation.name}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between"
              >
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">
                  {reservation.date} at {reservation.time}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-between"
              >
                <span className="text-muted-foreground">People:</span>
                <span className="font-medium">{reservation.people}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-between"
              >
                <span className="text-muted-foreground">Coffee:</span>
                <span className="font-medium">{reservation.coffee_name}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="border-t pt-3"
              >
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-coffee-600 dark:text-coffee-400">
                    Rp {reservation.total_amount.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <CardHeader>
              <CardTitle>QRIS Payment</CardTitle>
              <CardDescription>Scan the QR code below to complete your payment</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 inline-block"
              >
                <Image
                  src="/images/qris-code.jpg"
                  alt="QRIS Payment Code - Kuri Slowbar195"
                  width={280}
                  height={350}
                  className="mx-auto rounded-md"
                  priority
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted-foreground">Payment Details:</p>
                <div className="bg-muted p-3 rounded-lg text-left space-y-1">
                  {[
                    { label: "Merchant", value: "KURI SLOWBAR195" },
                    { label: "NMID", value: "ID1025371052834" },
                    { label: "Amount", value: `Rp ${reservation.total_amount.toLocaleString()}` },
                    { label: "Reference", value: `RES-${reservation.id}` },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{item.label}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{item.value}</span>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.value)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="space-y-3"
              >
                <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg text-left border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">How to Pay:</p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>1. Open your mobile banking or e-wallet app</li>
                    <li>2. Select "Scan QR" or "QRIS" option</li>
                    <li>3. Scan the QR code above</li>
                    <li>4. Confirm the payment amount</li>
                    <li>5. Complete the transaction</li>
                    <li>6. Dont forget to take a screenshot for proof</li>
                  </ol>
                </div>
                <p className="text-xs text-muted-foreground">
                  After completing the payment, click the button below to confirm your reservation.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handlePaymentConfirm}
                    className="w-full bg-green-600 hover:bg-green-700 button-press"
                    size="lg"
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {loading ? "Confirming Payment..." : "I Have Completed Payment"}
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </PageWrapper>
  )
}
