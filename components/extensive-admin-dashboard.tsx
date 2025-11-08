"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Sparkles, Plus, Trash2, Edit, LogOut, Activity, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExtensiveAdminDashboardProps {
  profiles: any[]
  events: any[]
  restaurants: any[]
  thursdayDiners: any[]
  matches: any[]
  rsvps: any[]
  messages: any[]
  notifications: any[]
}

export function ExtensiveAdminDashboard({
  profiles,
  events,
  restaurants,
  thursdayDiners,
  matches,
  rsvps,
  messages,
  notifications,
}: ExtensiveAdminDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddRestaurant, setShowAddRestaurant] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    cuisine: "",
    event_type: "Dinner",
    price_range: "€€",
    capacity: 12,
    emoji: "🍽️",
  })

  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    location: "",
    price_range: "€€",
    address: "",
    emoji: "🍽️",
    capacity: 50,
  })

  const emojiOptions = [
    { emoji: "🍽️", label: "Dinner Plate" },
    { emoji: "🥂", label: "Champagne" },
    { emoji: "🍷", label: "Wine Glass" },
    { emoji: "🎉", label: "Party" },
    { emoji: "🎊", label: "Celebration" },
    { emoji: "💃", label: "Dancing" },
    { emoji: "🍝", label: "Pasta" },
    { emoji: "🍕", label: "Pizza" },
    { emoji: "🍣", label: "Sushi" },
    { emoji: "🥗", label: "Salad" },
    { emoji: "🍰", label: "Dessert" },
    { emoji: "☕", label: "Coffee" },
  ]

  // Check admin authentication
  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_authenticated")
    if (!isAdmin) {
      router.push("/admin/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    router.push("/admin/login")
  }

  // Calculate statistics
  const stats = {
    totalUsers: profiles.length,
    totalEvents: events.length,
    totalMatches: matches.length,
    thursdayRegistrations: thursdayDiners.length,
    totalRSVPs: rsvps.length,
    activeUsers: profiles.filter((p) => p.available_now).length,
    unreadMessages: messages.filter((m) => !m.read).length,
    unreadNotifications: notifications.filter((n) => !n.read).length,
  }

  // Event Management
  const handleAddEvent = async () => {
    try {
      const { error } = await supabase.from("events").insert({
        ...newEvent,
        spots_filled: 0,
        emoji: newEvent.emoji,
      })

      if (error) throw error

      toast({ description: "Event created successfully!" })
      router.refresh()
      setShowAddEvent(false)
      setNewEvent({
        title: "",
        description: "",
        event_date: "",
        location: "",
        cuisine: "",
        event_type: "Dinner",
        price_range: "€€",
        capacity: 12,
        emoji: "🍽️",
      })
    } catch (error) {
      toast({ description: "Failed to create event", variant: "destructive" })
    }
  }

  const handleUpdateEvent = async () => {
    try {
      const { error } = await supabase.from("events").update(editingEvent).eq("id", editingEvent.id)

      if (error) throw error

      toast({ description: "Event updated successfully!" })
      router.refresh()
      setEditingEvent(null)
    } catch (error) {
      toast({ description: "Failed to update event", variant: "destructive" })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      toast({ description: "Event deleted successfully!" })
      router.refresh()
    } catch (error) {
      toast({ description: "Failed to delete event", variant: "destructive" })
    }
  }

  // Restaurant Management
  const handleAddRestaurant = async () => {
    try {
      const { error } = await supabase.from("restaurants").insert(newRestaurant)

      if (error) throw error

      toast({ description: "Restaurant added successfully!" })
      router.refresh()
      setShowAddRestaurant(false)
      setNewRestaurant({
        name: "",
        cuisine: "",
        location: "",
        price_range: "€€",
        address: "",
        emoji: "🍽️",
        capacity: 50,
      })
    } catch (error) {
      toast({ description: "Failed to add restaurant", variant: "destructive" })
    }
  }

  const handleEditRestaurant = async () => {
    if (!editingRestaurant) return

    try {
      const { error } = await supabase.from("restaurants").update(editingRestaurant).eq("id", editingRestaurant.id)

      if (error) throw error

      toast({ description: "Restaurant updated successfully!" })
      router.refresh()
      setEditingRestaurant(null)
    } catch (error) {
      console.error("[v0] Restaurant update error:", error)
      toast({ description: "Failed to update restaurant", variant: "destructive" })
    }
  }

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return

    try {
      const { error } = await supabase.from("restaurants").delete().eq("id", restaurantId)

      if (error) throw error

      toast({ description: "Restaurant deleted successfully!" })
      router.refresh()
    } catch (error) {
      toast({ description: "Failed to delete restaurant", variant: "destructive" })
    }
  }

  // Thursday Diner Management
  const handleRevealRestaurant = async (dinerId: string, revealed: boolean) => {
    try {
      const { error } = await supabase.from("thursday_diners").update({ revealed }).eq("id", dinerId)

      if (error) throw error

      toast({ description: revealed ? "Restaurant revealed!" : "Restaurant hidden" })
      router.refresh()
    } catch (error) {
      toast({ description: "Failed to update", variant: "destructive" })
    }
  }

  const handleToggleUserStatus = async (userId: string, suspend: boolean) => {
    try {
      const { error } = await supabase.from("profiles").update({ available_now: !suspend }).eq("id", userId)

      if (error) throw error

      toast({ description: suspend ? "User suspended" : "User activated" })
      router.refresh()
    } catch (error) {
      console.error("[v0] User status toggle error:", error)
      toast({ description: "Failed to update user status", variant: "destructive" })
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return

    try {
      const { error } = await supabase.from("matches").delete().eq("id", matchId)

      if (error) throw error

      toast({ description: "Match deleted successfully!" })
      router.refresh()
    } catch (error) {
      console.error("[v0] Match deletion error:", error)
      toast({ description: "Failed to delete match", variant: "destructive" })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId)

      if (error) throw error

      toast({ description: "Message deleted successfully!" })
      router.refresh()
    } catch (error) {
      console.error("[v0] Message deletion error:", error)
      toast({ description: "Failed to delete message", variant: "destructive" })
    }
  }

  const handleAssignRestaurant = async (dinerId: string, restaurantId: string) => {
    try {
      const { error } = await supabase
        .from("thursday_diners")
        .update({ assigned_restaurant_id: restaurantId })
        .eq("id", dinerId)

      if (error) throw error

      toast({ description: "Restaurant assigned!" })
      router.refresh()
    } catch (error) {
      console.error("[v0] Restaurant assignment error:", error)
      toast({ description: "Failed to assign restaurant", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">
            CheersUp Admin Dashboard
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} active now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">{stats.totalRSVPs} RSVPs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">Total connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thursday Diners</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thursdayRegistrations}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="thursday">Thursday</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rsvps.slice(0, 5).map((rsvp: any) => (
                      <div key={rsvp.id} className="flex items-center gap-3 text-sm">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <span className="font-medium">{rsvp.profiles?.name}</span> RSVP'd to{" "}
                          <span className="font-medium">{rsvp.events?.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rsvp.rsvp_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Events by RSVPs</CardTitle>
                  <CardDescription>Most popular upcoming events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter((e: any) => new Date(e.event_date) > new Date())
                      .sort((a: any, b: any) => b.spots_filled - a.spots_filled)
                      .slice(0, 5)
                      .map((event: any) => (
                        <div key={event.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs text-muted-foreground">{event.location}</div>
                          </div>
                          <Badge>
                            {event.spots_filled}/{event.capacity}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profiles.map((profile: any) => (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white font-bold">
                            {profile.name?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{profile.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {profile.age && `${profile.age} years`}
                              {profile.profession && ` • ${profile.profession}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {profile.available_now && (
                              <Badge variant="outline" className="bg-green-50">
                                Online
                              </Badge>
                            )}
                            {profile.user_stats && (
                              <Badge variant="outline">{profile.user_stats[0]?.dinners_attended || 0} dinners</Badge>
                            )}
                            <Button
                              size="sm"
                              variant={profile.available_now ? "destructive" : "default"}
                              onClick={() => handleToggleUserStatus(profile.id, profile.available_now)}
                            >
                              {profile.available_now ? "Suspend" : "Activate"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Event Management</h2>
                <p className="text-sm text-muted-foreground">Create and manage dining events</p>
              </div>
              <Button onClick={() => setShowAddEvent(!showAddEvent)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            {showAddEvent && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Event Icon</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {emojiOptions.map((option) => (
                        <button
                          key={option.emoji}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, emoji: option.emoji })}
                          className={`text-3xl p-2 rounded-lg border-2 hover:bg-muted transition-colors ${
                            newEvent.emoji === option.emoji ? "border-primary bg-primary/10" : "border-transparent"
                          }`}
                          title={option.label}
                        >
                          {option.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Wine Tasting Evening"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Old Town"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="A delightful evening of wine..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Cuisine</Label>
                      <Input
                        value={newEvent.cuisine}
                        onChange={(e) => setNewEvent({ ...newEvent, cuisine: e.target.value })}
                        placeholder="Italian"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newEvent.event_type}
                        onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dinner">Dinner</SelectItem>
                          <SelectItem value="Brunch">Brunch</SelectItem>
                          <SelectItem value="Wine Tasting">Wine Tasting</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price Range</Label>
                      <Select
                        value={newEvent.price_range}
                        onValueChange={(value) => setNewEvent({ ...newEvent, price_range: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="€">€</SelectItem>
                          <SelectItem value="€€">€€</SelectItem>
                          <SelectItem value="€€€">€€€</SelectItem>
                          <SelectItem value="€€€€">€€€€</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddEvent}>Create Event</Button>
                    <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {events.map((event: any) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    {editingEvent?.id === event.id ? (
                      <div className="space-y-4">
                        <Input
                          value={editingEvent.title}
                          onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateEvent}>Save</Button>
                          <Button variant="outline" onClick={() => setEditingEvent(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{event.emoji || "🍽️"}</span>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="outline">
                              {new Date(event.event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Badge>
                            <Badge variant="outline">{event.location}</Badge>
                            <Badge variant="outline">{event.cuisine}</Badge>
                            <Badge variant="outline">{event.price_range}</Badge>
                            <Badge>
                              {event.spots_filled}/{event.capacity} spots
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Thursday Diner Tab */}
          <TabsContent value="thursday" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thursday Diner Management</CardTitle>
                <CardDescription>Manage weekly mystery dinner assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thursdayDiners.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No registrations yet this week</p>
                  ) : (
                    thursdayDiners.map((diner: any) => (
                      <Card key={diner.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold">{diner.profiles?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Price: {diner.price_preference}
                                {diner.cuisine_preference && ` • ${diner.cuisine_preference}`}
                              </div>
                              {diner.dietary_restrictions?.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  Dietary: {diner.dietary_restrictions.join(", ")}
                                </div>
                              )}
                              {diner.restaurants && (
                                <div className="text-sm mt-2">
                                  <Badge variant="secondary">
                                    {diner.restaurants.emoji} {diner.restaurants.name}
                                  </Badge>
                                </div>
                              )}
                              {!diner.assigned_restaurant_id && (
                                <div className="mt-2">
                                  <Select onValueChange={(value) => handleAssignRestaurant(diner.id, value)}>
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Assign restaurant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {restaurants
                                        .filter((r: any) => r.price_range === diner.price_preference)
                                        .map((restaurant: any) => (
                                          <SelectItem key={restaurant.id} value={restaurant.id}>
                                            {restaurant.emoji} {restaurant.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={diner.revealed ? "default" : "outline"}>
                                {diner.revealed ? "Revealed" : "Hidden"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevealRestaurant(diner.id, !diner.revealed)}
                              >
                                {diner.revealed ? "Hide" : "Reveal"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Restaurant Management</h2>
                <p className="text-sm text-muted-foreground">Partner restaurants for Thursday Diner</p>
              </div>
              <Button onClick={() => setShowAddRestaurant(!showAddRestaurant)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Restaurant
              </Button>
            </div>

            {showAddRestaurant && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Restaurant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newRestaurant.name}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                        placeholder="Restaurant Name"
                      />
                    </div>
                    <div>
                      <Label>Emoji</Label>
                      <Input
                        value={newRestaurant.emoji}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, emoji: e.target.value })}
                        placeholder="🍽️"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Cuisine</Label>
                      <Input
                        value={newRestaurant.cuisine}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                        placeholder="Italian"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={newRestaurant.location}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                        placeholder="Old Town"
                      />
                    </div>
                    <div>
                      <Label>Price Range</Label>
                      <Select
                        value={newRestaurant.price_range}
                        onValueChange={(value) => setNewRestaurant({ ...newRestaurant, price_range: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="€">€</SelectItem>
                          <SelectItem value="€€">€€</SelectItem>
                          <SelectItem value="€€€">€€€</SelectItem>
                          <SelectItem value="€€€€">€€€€</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={newRestaurant.address}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={newRestaurant.capacity}
                      onChange={(e) =>
                        setNewRestaurant({ ...newRestaurant, capacity: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddRestaurant}>Add Restaurant</Button>
                    <Button variant="outline" onClick={() => setShowAddRestaurant(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {restaurants.map((restaurant: any) => (
                <Card key={restaurant.id}>
                  <CardContent className="p-4">
                    {editingRestaurant?.id === restaurant.id ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            value={editingRestaurant.name}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                            placeholder="Name"
                          />
                          <Input
                            value={editingRestaurant.emoji}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, emoji: e.target.value })}
                            placeholder="Emoji"
                          />
                        </div>
                        <Input
                          value={editingRestaurant.address}
                          onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address: e.target.value })}
                          placeholder="Address"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleEditRestaurant}>Save</Button>
                          <Button variant="outline" onClick={() => setEditingRestaurant(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{restaurant.emoji}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline">{restaurant.location}</Badge>
                          <Badge variant="outline">{restaurant.price_range}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => setEditingRestaurant(restaurant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRestaurant(restaurant.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Matches</CardTitle>
                <CardDescription>All connections made through the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matches.map((match: any) => (
                    <Card key={match.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{match.profiles?.name}</div>
                            <span className="text-muted-foreground">matched with</span>
                            <div className="font-medium">{match.matched?.name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{match.compatibility_score}% match</Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Messages</CardTitle>
                <CardDescription>All messages sent between users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.slice(0, 20).map((message: any) => (
                    <Card key={message.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{message.sender?.name}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{message.recipient?.name}</span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.sent_at).toLocaleDateString()}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
