"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Sparkles, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  user: any
  thursdayDiners: any[]
  restaurants: any[]
  events: any[]
}

export default function AdminDashboard({ user, thursdayDiners, restaurants, events }: AdminDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"thursday" | "events" | "restaurants">("thursday")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    cuisine: "",
    event_type: "Dinner",
    price_range: "€€",
    capacity: 12,
  })

  const handleAddEvent = async () => {
    try {
      const { error } = await supabase.from("events").insert({
        ...newEvent,
        spots_filled: 0,
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
      })
    } catch (error) {
      toast({ description: "Failed to create event", variant: "destructive" })
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-2xl font-bold">CheersUp Admin</div>
        </div>
        <Badge variant="outline">Admin: {user.name}</Badge>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === "thursday" ? "default" : "outline"} onClick={() => setActiveTab("thursday")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Thursday Diner
          </Button>
          <Button variant={activeTab === "events" ? "default" : "outline"} onClick={() => setActiveTab("events")}>
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </Button>
          <Button
            variant={activeTab === "restaurants" ? "default" : "outline"}
            onClick={() => setActiveTab("restaurants")}
          >
            <Users className="mr-2 h-4 w-4" />
            Restaurants
          </Button>
        </div>

        {activeTab === "thursday" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Thursday Diner Registrations</CardTitle>
                <CardDescription>Manage weekly mystery dinner assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thursdayDiners.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No registrations yet this week</p>
                  ) : (
                    thursdayDiners.map((diner) => (
                      <Card key={diner.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold">{diner.profiles?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {diner.profiles?.email} • Price: {diner.price_preference}
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
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Events</h2>
              <Button onClick={() => setShowAddEvent(!showAddEvent)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            {showAddEvent && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Wine Tasting Evening"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="A delightful evening of wine..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Cuisine</Label>
                      <Input
                        value={newEvent.cuisine}
                        onChange={(e) => setNewEvent({ ...newEvent, cuisine: e.target.value })}
                        placeholder="Italian"
                      />
                    </div>
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
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={newEvent.capacity}
                      onChange={(e) => setNewEvent({ ...newEvent, capacity: Number.parseInt(e.target.value) })}
                    />
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
              {events.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No events yet. Create your first event!</p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "restaurants" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Partner Restaurants</CardTitle>
                <CardDescription>Restaurants available for Thursday Diner assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <Card key={restaurant.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{restaurant.emoji}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{restaurant.location}</Badge>
                            <Badge variant="outline">{restaurant.price_range}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
