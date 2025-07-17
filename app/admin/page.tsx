"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Coffee, Users, Calendar, Clock, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Reservation {
  id: number
  name: string
  phone: string
  email?: string
  date: string
  time: string
  people: number
  coffee_name: string
  coffee_price: number
  total_amount: number
  notes?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
}

interface CoffeeOption {
  id: string
  name: string
  price: number
  description?: string
  is_active: boolean
}

interface Stats {
  total: number
  today: number
  revenue: number
  pending: number
}

export default function AdminPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, revenue: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [newCoffee, setNewCoffee] = useState({ name: "", price: "", description: "" })
  const [editingCoffee, setEditingCoffee] = useState<CoffeeOption | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch reservations and stats
      const reservationsResponse = await fetch("/api/admin/reservations")
      let reservationsData

      if (reservationsResponse.ok) {
        reservationsData = await reservationsResponse.json()
        setReservations(reservationsData.reservations)
        setStats(reservationsData.stats)
      } else {
        try {
          reservationsData = await reservationsResponse.json()
          throw new Error(reservationsData.error || `Server error: ${reservationsResponse.status}`)
        } catch (jsonError) {
          const textError = await reservationsResponse.text()
          throw new Error(
            `Server responded with non-JSON error from /api/admin/reservations: ${reservationsResponse.status} - ${textError}`,
          )
        }
      }

      // Fetch coffee options
      const coffeeResponse = await fetch("/api/coffee-options")
      let coffeeData

      if (coffeeResponse.ok) {
        coffeeData = await coffeeResponse.json()
        setCoffeeOptions(coffeeData.coffeeOptions)
      } else {
        try {
          coffeeData = await coffeeResponse.json()
          throw new Error(coffeeData.error || `Server error: ${coffeeResponse.status}`)
        } catch (jsonError) {
          const textError = await coffeeResponse.text()
          throw new Error(
            `Server responded with non-JSON error from /api/coffee-options: ${coffeeResponse.status} - ${textError}`,
          )
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/admin/login")
  }

  const handleAddCoffee = async () => {
    if (!newCoffee.name || !newCoffee.price) {
      toast({
        title: "Error",
        description: "Please fill in name and price",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/coffee-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoffee),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add coffee option")
      }

      setCoffeeOptions([...coffeeOptions, data.coffeeOption])
      setNewCoffee({ name: "", price: "", description: "" })

      toast({
        title: "Success",
        description: "Coffee option added successfully",
      })

      router.refresh() // Refresh the current page to re-fetch data
    } catch (error) {
      console.error("Error adding coffee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add coffee option",
        variant: "destructive",
      })
    }
  }

  const handleEditCoffee = async (coffee: CoffeeOption) => {
    try {
      const response = await fetch("/api/admin/coffee-options", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coffee),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update coffee option")
      }

      setCoffeeOptions(coffeeOptions.map((c) => (c.id === coffee.id ? data.coffeeOption : c)))
      setEditingCoffee(null)

      toast({
        title: "Success",
        description: "Coffee option updated successfully",
      })

      router.refresh() // Refresh the current page to re-fetch data
    } catch (error) {
      console.error("Error updating coffee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update coffee option",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCoffee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coffee option?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/coffee-options?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete coffee option")
      }

      setCoffeeOptions(coffeeOptions.filter((c) => c.id !== id))

      toast({
        title: "Success",
        description: "Coffee option deleted successfully",
      })

      router.refresh() // Refresh the current page to re-fetch data
    } catch (error) {
      console.error("Error deleting coffee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete coffee option",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update reservation status")
      }

      setReservations(
        reservations.map((order) => (order.id === orderId ? { ...order, status: newStatus as any } : order)),
      )

      toast({
        title: "Success",
        description: `Reservation status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reservation status",
        variant: "destructive",
      })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">kurislowbar195 Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              className="flex items-center gap-2 button-press bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 button-press bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-coffee-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Reservations</p>
                  <p className="text-3xl font-bold text-foreground">{stats.today}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">Rp {stats.revenue.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Reservations</p>
                  <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <Coffee className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Reservations Management</TabsTrigger>
            <TabsTrigger value="coffee">Coffee Options</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reservations</CardTitle>
                <CardDescription>Manage customer reservations and orders</CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reservations found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>People</TableHead>
                          <TableHead>Coffee</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservations.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">RES-{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.name}</p>
                                <p className="text-sm text-gray-500">{order.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{order.date}</p>
                                <p className="text-sm text-gray-500">{order.time}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.people}</TableCell>
                            <TableCell className="max-w-32 truncate">{order.coffee_name}</TableCell>
                            <TableCell>Rp {order.total_amount?.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="button-press bg-transparent">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reservation Details - RES-{order.id}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Customer Name</Label>
                                          <p className="font-medium">{order.name}</p>
                                        </div>
                                        <div>
                                          <Label>Phone</Label>
                                          <p className="font-medium">{order.phone}</p>
                                        </div>
                                        {order.email && (
                                          <div>
                                            <Label>Email</Label>
                                            <p className="font-medium">{order.email}</p>
                                          </div>
                                        )}
                                        <div>
                                          <Label>Date</Label>
                                          <p className="font-medium">{order.date}</p>
                                        </div>
                                        <div>
                                          <Label>Time</Label>
                                          <p className="font-medium">{order.time}</p>
                                        </div>
                                        <div>
                                          <Label>People</Label>
                                          <p className="font-medium">{order.people}</p>
                                        </div>
                                        <div>
                                          <Label>Coffee</Label>
                                          <p className="font-medium">{order.coffee_name}</p>
                                        </div>
                                        <div>
                                          <Label>Total Amount</Label>
                                          <p className="font-medium">Rp {order.total_amount.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      {order.notes && (
                                        <div>
                                          <Label>Special Notes</Label>
                                          <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                            {order.notes}
                                          </p>
                                        </div>
                                      )}
                                      <div className="flex gap-2 flex-wrap">
                                        <Button
                                          size="sm"
                                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                                          disabled={order.status === "confirmed"}
                                          className="button-press"
                                        >
                                          Confirm
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateOrderStatus(order.id, "completed")}
                                          disabled={order.status === "completed"}
                                          className="button-press"
                                        >
                                          Complete
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                                          disabled={order.status === "cancelled"}
                                          className="button-press"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
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

          <TabsContent value="coffee">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Coffee Option</CardTitle>
                  <CardDescription>Add new coffee blends to your menu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coffee-name">Coffee Name</Label>
                    <Input
                      id="coffee-name"
                      value={newCoffee.name}
                      onChange={(e) => setNewCoffee({ ...newCoffee, name: e.target.value })}
                      placeholder="Enter coffee name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coffee-price">Price (Rp)</Label>
                    <Input
                      id="coffee-price"
                      type="number"
                      value={newCoffee.price}
                      onChange={(e) => setNewCoffee({ ...newCoffee, price: e.target.value })}
                      placeholder="Enter price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coffee-description">Description</Label>
                    <Textarea
                      id="coffee-description"
                      value={newCoffee.description}
                      onChange={(e) => setNewCoffee({ ...newCoffee, description: e.target.value })}
                      placeholder="Enter coffee description"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddCoffee} className="w-full button-press">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Coffee Option
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Coffee Options</CardTitle>
                  <CardDescription>Manage your coffee menu ({coffeeOptions.length} items)</CardDescription>
                </CardHeader>
                <CardContent>
                  {coffeeOptions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No coffee options found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {coffeeOptions.map((coffee) => (
                        <div key={coffee.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{coffee.name}</p>
                            <p className="text-sm text-gray-500">Rp {coffee.price.toLocaleString()}</p>
                            {coffee.description && (
                              <p className="text-xs text-muted-foreground mt-1">{coffee.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="button-press bg-transparent">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Coffee Option</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Coffee Name</Label>
                                    <Input
                                      value={editingCoffee?.name || coffee.name}
                                      onChange={(e) => setEditingCoffee({ ...coffee, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Price (Rp)</Label>
                                    <Input
                                      type="number"
                                      value={editingCoffee?.price || coffee.price}
                                      onChange={(e) =>
                                        setEditingCoffee({ ...coffee, price: Number.parseInt(e.target.value) })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                      value={editingCoffee?.description || coffee.description || ""}
                                      onChange={(e) => setEditingCoffee({ ...coffee, description: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleEditCoffee(editingCoffee || coffee)}
                                    className="w-full button-press"
                                  >
                                    Update Coffee
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCoffee(coffee.id)}
                              className="button-press"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
