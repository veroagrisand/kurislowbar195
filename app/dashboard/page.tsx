"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Phone, Mail, Loader2, Home } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import type { Reservation } from "@/lib/db" // Import Reservation type

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setSearched(true)
    setReservations([]) // Clear previous results

    if (!phone && !email) {
      toast({
        title: "Input Required",
        description: "Please enter either a phone number or an email address to search.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const queryParams = new URLSearchParams()
      if (phone) queryParams.append("phone", phone)
      if (email) queryParams.append("email", email)

      const res = await fetch(`/api/reservations/search?${queryParams.toString()}`, { cache: "no-store" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reservations")
      }

      setReservations(data.reservations)
      if (data.reservations.length === 0) {
        toast({
          title: "No Reservations Found",
          description: "No reservations match your search criteria.",
          variant: "default",
        })
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${data.reservations.length} reservation(s).`,
        })
      }
    } catch (err: any) {
      console.error("Error searching reservations:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to search reservations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "confirmed":
        return "secondary"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <PageWrapper className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Find Your Reservations</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your phone number or email to view your bookings.
          </p>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-5 w-5" /> Search Your Bookings
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Provide either your phone number or email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +628123456789"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., your.email@example.com"
                  className="text-sm sm:text-base"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full button-press text-sm sm:text-base" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Search Reservations
                </Button>
              </motion.div>
            </form>

            {searched && !loading && reservations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8"
              >
                <h2 className="text-xl font-semibold mb-4">Your Reservations</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>People</TableHead>
                        <TableHead>Coffee</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">RES-{reservation.id}</TableCell>
                          <TableCell>{reservation.date}</TableCell>
                          <TableCell>{reservation.time}</TableCell>
                          <TableCell>{reservation.people}</TableCell>
                          <TableCell>{reservation.coffee_name}</TableCell>
                          <TableCell>Rp {reservation.total_amount.toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(reservation.status)}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}

            {searched && !loading && reservations.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 text-center text-muted-foreground"
              >
                <p>No reservations found for the provided details.</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
