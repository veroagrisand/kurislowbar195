"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Coffee, Users, Calendar, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [coffeeOptions, setCoffeeOptions] = useState([
    { id: "arabica-blend", name: "Arabica House Blend", price: 45000 },
    { id: "robusta-special", name: "Robusta Special", price: 40000 },
    { id: "kopi-luwak", name: "Kopi Luwak Premium", price: 85000 },
    { id: "java-preanger", name: "Java Preanger", price: 55000 },
    { id: "toraja-highland", name: "Toraja Highland", price: 65000 },
  ])
  const [newCoffee, setNewCoffee] = useState({ name: "", price: "" })
  const [editingCoffee, setEditingCoffee] = useState<any>(null)
  const router = useRouter()

  const handleLogout = () => {
    // Remove admin session cookie
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })

    router.push("/admin/login")
  }

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    setOrders(savedOrders)
  }, [])

  const handleAddCoffee = () => {
    if (!newCoffee.name || !newCoffee.price) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const coffee = {
      id: newCoffee.name.toLowerCase().replace(/\s+/g, "-"),
      name: newCoffee.name,
      price: Number.parseInt(newCoffee.price),
    }

    setCoffeeOptions([...coffeeOptions, coffee])
    setNewCoffee({ name: "", price: "" })

    toast({
      title: "Success",
      description: "Coffee option added successfully",
    })
  }

  const handleEditCoffee = (coffee: any) => {
    const updatedOptions = coffeeOptions.map((c) => (c.id === coffee.id ? coffee : c))
    setCoffeeOptions(updatedOptions)
    setEditingCoffee(null)

    toast({
      title: "Success",
      description: "Coffee option updated successfully",
    })
  }

  const handleDeleteCoffee = (id: string) => {
    setCoffeeOptions(coffeeOptions.filter((c) => c.id !== id))
    toast({
      title: "Success",
      description: "Coffee option deleted successfully",
    })
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    toast({
      title: "Success",
      description: `Order status updated to ${newStatus}`,
    })
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

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.date).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">kurislowbar195 Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 button-press">
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
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-coffee-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                  <p className="text-3xl font-bold text-foreground">{todayOrders.length}</p>
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
                  <p className="text-3xl font-bold text-foreground">Rp {totalRevenue.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Coffee Options</p>
                  <p className="text-3xl font-bold text-foreground">{coffeeOptions.length}</p>
                </div>
                <Coffee className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
            <TabsTrigger value="coffee">Coffee Options</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage customer reservations and orders</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {orders.map((order) => (
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
                        <TableCell className="max-w-32 truncate">{order.coffeeName}</TableCell>
                        <TableCell>Rp {order.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="button-press">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Order Details</DialogTitle>
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
                                    <div>
                                      <Label>Date</Label>
                                      <p className="font-medium">{order.date}</p>
                                    </div>
                                    <div>
                                      <Label>Time</Label>
                                      <p className="font-medium">{order.time}</p>
                                    </div>
                                  </div>
                                  {order.notes && (
                                    <div>
                                      <Label>Special Notes</Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{order.notes}</p>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
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
                  <Button onClick={handleAddCoffee} className="w-full button-press">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Coffee Option
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Coffee Options</CardTitle>
                  <CardDescription>Manage your coffee menu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {coffeeOptions.map((coffee) => (
                      <div key={coffee.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{coffee.name}</p>
                          <p className="text-sm text-gray-500">Rp {coffee.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="button-press">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
