"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  DollarSign,
  Users,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  LogOut,
  Loader2,
  Edit,
  Plus,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Reservation, CoffeeOption } from "@/lib/db" // Import types from lib/db

// Helper to safely parse JSON, handling non-JSON responses
async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }
  // If not JSON, read as text and throw a specific error
  const text = await response.text()
  throw new Error(`Non-JSON response: ${text.substring(0, 200)}... (Status: ${response.status})`)
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, revenue: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false)
  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([])
  const [newCoffee, setNewCoffee] = useState({ name: "", price: "", description: "" })
  const [editingCoffee, setEditingCoffee] = useState<CoffeeOption | null>(null)
  const [isCoffeeLoading, setIsCoffeeLoading] = useState(false)

  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchAdminData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/reservations", { cache: "no-store" })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch admin data")
      }
      setReservations(data.reservations)
      setStats(data.stats)
    } catch (err: any) {
      console.error("Error fetching admin data:", err)
      setError(err.message || "Failed to load admin data.")
      toast({
        title: "Error",
        description: err.message || "Failed to load admin data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCoffeeOptions = async () => {
    setIsCoffeeLoading(true)
    try {
      const res = await fetch("/api/admin/coffee-options", { cache: "no-store" })
      const data = await safeJson(res)
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch coffee options")
      }
      setCoffeeOptions(data.coffeeOptions)
    } catch (err: any) {
      console.error("Error fetching coffee options:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to load coffee options.",
        variant: "destructive",
      })
    } finally {
      setIsCoffeeLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
    fetchCoffeeOptions()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" })
      if (res.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        })
        router.push("/admin/login")
      } else {
        const data = await safeJson(res)
        throw new Error(data.error || "Failed to log out")
      }
    } catch (err: any) {
      console.error("Logout error:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to log out.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReservation = async (id: number) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete reservation")
      }

      toast({
        title: "Success",
        description: "Reservation deleted successfully.",
      })
      fetchAdminData() // Refresh data
    } catch (err: any) {
      console.error(`Error deleting reservation ${id}:`, err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete reservation.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: `Reservation ${id} status updated to ${status}.`,
      })
      fetchAdminData() // Refresh data
    } catch (err: any) {
      console.error(`Error updating status for reservation ${id}:`, err)
      toast({
        title: "Error",
        description: err.message || "Failed to update reservation status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddCoffee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCoffeeLoading(true)
    try {
      const res = await fetch("/api/admin/coffee-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCoffee.name,
          price: Number.parseFloat(newCoffee.price),
          description: newCoffee.description,
        }),
      })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to add coffee option")
      }

      toast({
        title: "Success",
        description: "Coffee option added successfully.",
      })
      setNewCoffee({ name: "", price: "", description: "" })
      fetchCoffeeOptions()
    } catch (err: any) {
      console.error("Error adding coffee option:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to add coffee option.",
        variant: "destructive",
      })
    } finally {
      setIsCoffeeLoading(false)
    }
  }

  const handleUpdateCoffee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoffee) return

    setIsCoffeeLoading(true)
    try {
      const res = await fetch(`/api/admin/coffee-options/${editingCoffee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCoffee.name,
          price: editingCoffee.price,
          description: editingCoffee.description,
          is_active: editingCoffee.is_active,
        }),
      })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to update coffee option")
      }

      toast({
        title: "Success",
        description: "Coffee option updated successfully.",
      })
      setEditingCoffee(null)
      fetchCoffeeOptions()
    } catch (err: any) {
      console.error("Error updating coffee option:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update coffee option.",
        variant: "destructive",
      })
    } finally {
      setIsCoffeeLoading(false)
    }
  }

  const handleDeleteCoffee = async (id: string) => {
    setIsCoffeeLoading(true)
    try {
      const res = await fetch(`/api/admin/coffee-options/${id}`, { method: "DELETE" })
      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete coffee option")
      }

      toast({
        title: "Success",
        description: "Coffee option deleted successfully.",
      })
      fetchCoffeeOptions()
    } catch (err: any) {
      console.error("Error deleting coffee option:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete coffee option.",
        variant: "destructive",
      })
    } finally {
      setIsCoffeeLoading(false)
    }
  }

  const filteredReservations = useMemo(() => {
    let filtered = reservations

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus)
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          r.phone.toLowerCase().includes(lowerCaseSearchTerm) ||
          r.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
          r.coffee_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          r.id.toString().includes(lowerCaseSearchTerm),
      )
    }

    return filtered
  }, [reservations, filterStatus, searchTerm])

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
    <PageWrapper className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAdminData} disabled={loading}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </motion.div>
        )}

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="coffee-options">Coffee Options</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">All time bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today&apos;s Reservations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <p className="text-xs text-muted-foreground">Bookings for today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {stats.revenue.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">From confirmed/completed bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Reservations</span>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search reservations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading reservations...</span>
                  </div>
                ) : filteredReservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reservations found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>People</TableHead>
                          <TableHead>Coffee</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredReservations.map((reservation) => (
                            <motion.tr
                              key={reservation.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <TableCell className="font-medium">RES-{reservation.id}</TableCell>
                              <TableCell>{reservation.name}</TableCell>
                              <TableCell>
                                {reservation.phone}
                                {reservation.email && (
                                  <span className="block text-xs text-muted-foreground">{reservation.email}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {reservation.date} at {reservation.time}
                              </TableCell>
                              <TableCell>{reservation.people}</TableCell>
                              <TableCell>{reservation.coffee_name}</TableCell>
                              <TableCell>Rp {reservation.total_amount.toLocaleString("id-ID")}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(reservation.status)}>
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{reservation.notes || "-"}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(reservation.id, "confirmed")}
                                      disabled={reservation.status === "confirmed" || isUpdatingStatus}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(reservation.id, "completed")}
                                      disabled={reservation.status === "completed" || isUpdatingStatus}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(reservation.id, "cancelled")}
                                      disabled={reservation.status === "cancelled" || isUpdatingStatus}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteReservation(reservation.id)}
                                      className="text-red-600"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coffee-options" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Coffee Options Management</span>
                  <Dialog open={isCoffeeModalOpen} onOpenChange={setIsCoffeeModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setNewCoffee({ name: "", price: "", description: "" })
                          setEditingCoffee(null)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Coffee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editingCoffee ? "Edit Coffee Option" : "Add New Coffee Option"}</DialogTitle>
                        <DialogDescription>
                          {editingCoffee
                            ? "Make changes to this coffee option."
                            : "Add a new coffee option to your menu."}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={editingCoffee ? handleUpdateCoffee : handleAddCoffee} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="coffee-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="coffee-name"
                            value={editingCoffee ? editingCoffee.name : newCoffee.name}
                            onChange={(e) =>
                              editingCoffee
                                ? setEditingCoffee({ ...editingCoffee, name: e.target.value })
                                : setNewCoffee({ ...newCoffee, name: e.target.value })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="coffee-price" className="text-right">
                            Price (Rp)
                          </Label>
                          <Input
                            id="coffee-price"
                            type="number"
                            step="any"
                            value={editingCoffee ? editingCoffee.price : newCoffee.price}
                            onChange={(e) =>
                              editingCoffee
                                ? setEditingCoffee({ ...editingCoffee, price: Number.parseFloat(e.target.value) })
                                : setNewCoffee({ ...newCoffee, price: e.target.value })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="coffee-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="coffee-description"
                            value={editingCoffee ? editingCoffee.description || "" : newCoffee.description}
                            onChange={(e) =>
                              editingCoffee
                                ? setEditingCoffee({ ...editingCoffee, description: e.target.value })
                                : setNewCoffee({ ...newCoffee, description: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        {editingCoffee && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="coffee-active" className="text-right">
                              Active
                            </Label>
                            <input
                              type="checkbox"
                              id="coffee-active"
                              checked={editingCoffee.is_active}
                              onChange={(e) => setEditingCoffee({ ...editingCoffee, is_active: e.target.checked })}
                              className="col-span-3 h-4 w-4"
                            />
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" disabled={isCoffeeLoading}>
                            {isCoffeeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingCoffee ? "Save changes" : "Add Coffee"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCoffeeLoading && !coffeeOptions.length ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading coffee options...</span>
                  </div>
                ) : coffeeOptions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No coffee options found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coffeeOptions.map((coffee) => (
                          <TableRow key={coffee.id}>
                            <TableCell className="font-medium">{coffee.name}</TableCell>
                            <TableCell>Rp {coffee.price.toLocaleString("id-ID")}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{coffee.description || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={coffee.is_active ? "success" : "destructive"}>
                                {coffee.is_active ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingCoffee(coffee)
                                      setIsCoffeeModalOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteCoffee(coffee.id)}
                                    className="text-red-600"
                                    disabled={isCoffeeLoading}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">More detailed statistics and charts can be added here.</p>
                {/* Placeholder for future charts/graphs */}
                <div className="h-64 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground mt-4">
                  Charts and Graphs Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage admin users, change passwords, or configure system settings.
                </p>
                {/* Placeholder for future settings */}
                <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground mt-4">
                  Settings Options Placeholder
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
