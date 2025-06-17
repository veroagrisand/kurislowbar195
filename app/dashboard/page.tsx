"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Clock, Users, Coffee } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  notes?: string
  status: string
  created_at: string
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

export default function CustomerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchData, setSearchData] = useState({ phone: "", email: "" })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchData.phone && !searchData.email) {
      toast({
        title: "Error",
        description: "Please enter either phone number or email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/reservations/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search reservations")
      }

      setReservations(data.reservations)
      setSearched(true)

      if (data.reservations.length === 0) {
        toast({
          title: "No reservations found",
          description: "No reservations found with the provided contact information",
        })
      }
    } catch (error) {
      console.error("Error searching reservations:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search reservations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <PageWrapper className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Reservations</h1>
          <p className="text-muted-foreground">Enter your contact information to view your reservations</p>
          <div className="mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => router.push("/")} className="button-press">
                Back to Home
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <AnimatedCard delay={0.2} className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
              Search Reservations
            </CardTitle>
            <CardDescription>Enter your phone number or email address to find your reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSearch}
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={searchData.phone}
                    onChange={(e) => setSearchData({ ...searchData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchData.email}
                    onChange={(e) => setSearchData({ ...searchData, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full button-press" disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? "Searching..." : "Search Reservations"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </CardContent>
        </AnimatedCard>

        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Your Reservations ({reservations.length})</h2>
              {reservations.length === 0 ? (
                <AnimatedCard>
                  <CardContent className="pt-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="text-muted-foreground">
                      No reservations found with the provided contact information.
                    </p>
                  </CardContent>
                </AnimatedCard>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {reservations.map((reservation, index) => (
                    <motion.div key={reservation.id} variants={itemVariants}>
                      <AnimatedCard delay={index * 0.1}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="text-lg font-semibold"
                              >
                                RES-{reservation.id}
                              </motion.h3>
                              <p className="text-sm text-muted-foreground">
                                Created on {new Date(reservation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                            >
                              {getStatusBadge(reservation.status)}
                            </motion.div>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                          >
                            <motion.div variants={itemVariants} className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">{reservation.date}</p>
                              </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">{reservation.time}</p>
                              </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">People</p>
                                <p className="font-medium">{reservation.people}</p>
                              </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center gap-2">
                              <Coffee className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-medium">Rp {reservation.total_amount.toLocaleString()}</p>
                              </div>
                            </motion.div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <p className="text-sm text-muted-foreground mb-1">Coffee Selection:</p>
                            <p className="font-medium">{reservation.coffee_name}</p>
                            {reservation.notes && (
                              <>
                                <p className="text-sm text-muted-foreground mt-2 mb-1">Special Notes:</p>
                                <p className="text-sm bg-muted p-2 rounded">{reservation.notes}</p>
                              </>
                            )}
                          </motion.div>
                        </CardContent>
                      </AnimatedCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
