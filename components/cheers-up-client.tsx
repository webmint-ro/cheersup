"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  X,
  Star,
  Calendar,
  MapPin,
  Bell,
  MessageCircle,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  User,
  Lock,
  Search,
  Send,
  ArrowLeft,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Tab = "match" | "events" | "near-you" | "random-diner" | "profile"
type View = "main" | "connections" | "messages" | "chat" | "payments" | "notification-settings" | "account-settings"

interface Profile {
  id: string
  name: string
  age: number
  profession: string
  avatar_url?: string
  bio?: string
  location_lat: number
  location_lng: number
  available_now: boolean
}

interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  location: string
  cuisine?: string
  price_range?: string
  capacity: number
  spots_filled: number
  event_type?: string
  image_url?: string
  emoji?: string // Added emoji field
}

interface Restaurant {
  id: string
  name: string
  cuisine?: string
  location: string
  address?: string
  price_range?: string
  emoji?: string
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

interface CheersUpClientProps {
  user: Profile
  userStats: {
    dinners_attended: number
    connections_made: number
    current_streak: number
    badges_earned: number
  }
  profiles: Profile[]
  events: Event[]
  rsvpEventIds: string[]
  matchedUserIds: string[]
  restaurants: Restaurant[]
  notifications: Notification[]
}

export default function CheersUpClient({
  user,
  userStats,
  profiles,
  events: initialEvents,
  rsvpEventIds: initialRsvpIds,
  matchedUserIds: initialMatchedIds,
  restaurants,
  notifications: initialNotifications,
}: CheersUpClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [currentTab, setCurrentTab] = useState<Tab>("match")
  const [currentView, setCurrentView] = useState<View>("main")
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [matchedProfiles, setMatchedProfiles] = useState<string[]>(initialMatchedIds)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [availableNowFilter, setAvailableNowFilter] = useState(false)
  const [distanceFilter, setDistanceFilter] = useState("All")
  const [searchText, setSearchText] = useState("")
  const [eventFilters, setEventFilters] = useState({
    type: "All",
    cuisine: "All",
    location: "All",
    price: "All",
  })

  const [accountEmail] = useState(user.id || "")
  const [accountPhone, setAccountPhone] = useState("+40 123 456 789")
  const [messageInput, setMessageInput] = useState("")
  const [events, setEvents] = useState(initialEvents)
  const [rsvpEventIds, setRsvpEventIds] = useState(initialRsvpIds)
  const [notifications, setNotifications] = useState(initialNotifications)

  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    cuisine: "",
    event_type: "Dinner",
    price_range: "€€",
    capacity: 12,
    emoji: "🍽️", // Added emoji selection for events
  })

  // Added emoji options for event selection
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

  const [conversations] = useState([
    {
      id: "c1",
      userId: "1",
      name: "Sofia Ionescu",
      avatar: "/young-woman-smiling-professional-photo.png",
      lastMessage: "Looking forward to dinner Thursday!",
      time: "10m ago",
      unread: 2,
    },
    {
      id: "c2",
      userId: "3",
      name: "Elena Dumitrescu",
      avatar: "/woman-smiling-architect-creative.jpg",
      lastMessage: "That restaurant was amazing!",
      time: "2h ago",
      unread: 0,
    },
  ])

  const [paymentMethods, setPaymentMethods] = useState([
    { id: "pm1", type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
    { id: "pm2", type: "Mastercard", last4: "8888", expiry: "09/26", isDefault: false },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    matches: true,
    messages: true,
    events: true,
    thursdayDiner: true,
    emailNotifications: true,
    pushNotifications: true,
  })

  const [thursdayDiner, setThursdayDiner] = useState({
    joined: false,
    revealed: false,
    preferences: {
      priceRange: "",
      dietary: [] as string[], // Initialize dietary as an empty array
      cuisine: "",
    },
    assignedRestaurant: null as Restaurant | null,
    registeredCount: 18,
    revealTime: new Date("2025-11-13T18:00:00"),
    eventTime: new Date("2025-11-14T20:30:00"),
  })

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const profilesWithDistance = profiles.map((profile) => ({
    ...profile,
    distance: calculateDistance(user.location_lat, user.location_lng, profile.location_lat, profile.location_lng),
    compatibility: Math.floor(Math.random() * 20) + 75,
    interests: ["Travel", "Food", "Wine", "Art"].slice(0, Math.floor(Math.random() * 3) + 2),
  }))

  const handleSkip = () => {
    toast({ description: "Skipped", duration: 1000 })
    setCurrentMatchIndex((prev) => prev + 1)
  }

  const handleMatch = async () => {
    const profile = profilesWithDistance[currentMatchIndex]

    try {
      const { error } = await supabase.from("matches").insert({
        user_id: user.id,
        matched_user_id: profile.id,
        compatibility_score: profile.compatibility,
      })

      if (error) throw error

      setMatchedProfiles([...matchedProfiles, profile.id])
      toast({
        description: `🎉 Matched with ${profile.name}!`,
        duration: 2000,
      })
      setCurrentMatchIndex((prev) => prev + 1)
    } catch (error) {
      toast({
        description: "Failed to save match",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleSuperMatch = async () => {
    await handleMatch()
  }

  const handleRSVP = async (eventId: string) => {
    const isRsvped = rsvpEventIds.includes(eventId)

    try {
      if (isRsvped) {
        const { error } = await supabase.from("rsvps").delete().eq("user_id", user.id).eq("event_id", eventId)

        if (error) throw error

        setRsvpEventIds(rsvpEventIds.filter((id) => id !== eventId))
        setEvents(events.map((e) => (e.id === eventId ? { ...e, spots_filled: Math.max(0, e.spots_filled - 1) } : e)))
        toast({ description: "RSVP cancelled", duration: 2000 })
      } else {
        const { error } = await supabase.from("rsvps").insert({
          user_id: user.id,
          event_id: eventId,
        })

        if (error) throw error

        setRsvpEventIds([...rsvpEventIds, eventId])
        const event = events.find((e) => e.id === eventId)
        setEvents(events.map((e) => (e.id === eventId ? { ...e, spots_filled: e.spots_filled + 1 } : e)))
        toast({
          description: event ? `RSVP'd! ${event.spots_filled + 1}/${event.capacity} spots` : "RSVP'd!",
          duration: 2000,
        })
      }
    } catch (error) {
      toast({
        description: "Failed to update RSVP",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleWave = (name: string) => {
    toast({ description: `👋 Waved at ${name}!`, duration: 2000 })
  }

  const handleInvite = (name: string) => {
    toast({ description: `📨 Invited ${name} to dinner!`, duration: 2000 })
  }

  const handleJoinThursdayDiner = async (prefs: { priceRange: string; dietary: string[]; cuisine: string }) => {
    const randomRestaurant =
      restaurants.find((r) => r.price_range === prefs.priceRange) ||
      restaurants[Math.floor(Math.random() * restaurants.length)]

    try {
      const nextThursday = getNextThursday()

      const { error } = await supabase.from("thursday_diners").insert({
        user_id: user.id,
        week_date: nextThursday,
        price_preference: prefs.priceRange,
        dietary_restrictions: prefs.dietary,
        cuisine_preference: prefs.cuisine,
        assigned_restaurant_id: randomRestaurant?.id,
        revealed: false,
      })

      if (error) throw error

      setThursdayDiner({
        ...thursdayDiner,
        joined: true,
        preferences: prefs,
        assignedRestaurant: randomRestaurant || null,
        registeredCount: thursdayDiner.registeredCount + 1,
        revealed: false,
      })

      setShowJoinModal(false)
      toast({
        description: "🎉 You're In! Restaurant reveals Wednesday at 6 PM",
        duration: 3000,
      })
    } catch (error) {
      console.error("[v0] Join Thursday Diner error:", error)
      toast({
        description: "Failed to join Thursday Diner",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const getNextThursday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7
    const nextThursday = new Date(today)
    nextThursday.setDate(today.getDate() + daysUntilThursday)
    return nextThursday.toISOString().split("T")[0]
  }

  const checkAndRevealRestaurant = () => {
    const now = new Date()
    const revealTime = new Date(thursdayDiner.revealTime)

    if (now >= revealTime && thursdayDiner.joined && !thursdayDiner.revealed) {
      setThursdayDiner({
        ...thursdayDiner,
        revealed: true,
      })
    }
  }

  // Check reveal status periodically
  useEffect(() => {
    const interval = setInterval(checkAndRevealRestaurant, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [thursdayDiner.joined, thursdayDiner.revealed, thursdayDiner.revealTime]) // Depend on relevant state

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.event_date || !newEvent.location) {
      toast({
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    try {
      const { error } = await supabase.from("events").insert({
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date,
        location: newEvent.location,
        cuisine: newEvent.cuisine,
        event_type: newEvent.event_type,
        price_range: newEvent.price_range,
        capacity: newEvent.capacity,
        spots_filled: 0,
        emoji: newEvent.emoji, // Include emoji when creating event
      })

      if (error) throw error

      toast({
        description: "Event created successfully!",
        duration: 2000,
      })

      setShowAddEventModal(false)
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

      router.refresh()
    } catch (error) {
      toast({
        description: "Failed to create event",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const getFilteredEvents = () => {
    return events.filter((event) => {
      const matchesType = eventFilters.type === "All" || event.event_type === eventFilters.type
      const matchesCuisine = eventFilters.cuisine === "All" || event.cuisine === eventFilters.cuisine
      const matchesLocation = eventFilters.location === "All" || event.location === eventFilters.location
      const matchesPrice = eventFilters.price === "All" || event.price_range === eventFilters.price
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase())

      return matchesType && matchesCuisine && matchesLocation && matchesPrice && matchesSearch
    })
  }

  const getFilteredNearbyUsers = () => {
    return profilesWithDistance.filter((profile) => {
      const matchesAvailable = !availableNowFilter || profile.available_now
      const matchesDistance =
        distanceFilter === "All" ||
        (distanceFilter === "1km" && profile.distance <= 1) ||
        (distanceFilter === "2km" && profile.distance <= 2) ||
        (distanceFilter === "5km" && profile.distance <= 5) ||
        (distanceFilter === "10km" && profile.distance <= 10)

      return matchesAvailable && matchesDistance
    })
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      toast({
        description: "Failed to logout",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing coming soon",
      duration: 2000,
    })
  }

  const handleMyConnections = () => {
    setCurrentView("connections")
  }

  const handleMessages = () => {
    setCurrentView("messages")
  }

  const handleNotificationSettings = () => {
    setCurrentView("notification-settings")
  }

  const handleAccountSettings = () => {
    setCurrentView("account-settings")
  }

  const handleStartChat = (conversationId: string) => {
    setSelectedChat(conversationId)
    setCurrentView("chat")
  }

  const handleDeletePayment = (paymentId: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentId))
    toast({ description: "Payment method removed", duration: 2000 })
  }

  const handleSetDefaultPayment = (paymentId: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === paymentId,
      })),
    )
    toast({ description: "Default payment method updated", duration: 2000 })
  }

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background border-b px-4 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          CheersUp
        </div>
        <div className="flex items-center gap-3">
          <button className="relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
          <Avatar>
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {currentView === "main" && currentTab === "match" && (
          <div className="h-full flex flex-col items-center justify-center p-4 pb-24">
            {profilesWithDistance[currentMatchIndex] ? (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  {currentMatchIndex + 1} of {profilesWithDistance.length} profiles
                </div>
                <Card className="w-full max-w-md overflow-hidden shadow-2xl">
                  <div className="relative">
                    <img
                      src={
                        profilesWithDistance[currentMatchIndex].avatar_url || "/placeholder.svg?height=400&width=400"
                      }
                      alt={profilesWithDistance[currentMatchIndex].name}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {profilesWithDistance[currentMatchIndex].compatibility}% Match
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold">
                        {profilesWithDistance[currentMatchIndex].name}, {profilesWithDistance[currentMatchIndex].age}
                      </h2>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profilesWithDistance[currentMatchIndex].distance.toFixed(1)} km away
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{profilesWithDistance[currentMatchIndex].profession}</p>
                    <p className="text-sm mb-4">
                      {profilesWithDistance[currentMatchIndex].bio || "Food lover looking to connect over great meals!"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profilesWithDistance[currentMatchIndex].interests?.map((interest, idx) => (
                        <Badge key={idx} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-4 mt-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-16 w-16 bg-transparent"
                    onClick={handleSkip}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                    onClick={handleMatch}
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleSuperMatch}
                  >
                    <Star className="h-6 w-6" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">Check back later for more profiles</p>
              </div>
            )}
          </div>
        )}

        {currentView === "main" && currentTab === "events" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Discover Events</h2>
              <Button size="sm" onClick={() => setShowAddEventModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={eventFilters.type}
                  onChange={(e) => setEventFilters({ ...eventFilters, type: e.target.value })}
                >
                  <option value="All">All Types</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Wine Tasting">Wine Tasting</option>
                  <option value="Brunch">Brunch</option>
                </select>

                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={eventFilters.cuisine}
                  onChange={(e) => setEventFilters({ ...eventFilters, cuisine: e.target.value })}
                >
                  <option value="All">All Cuisines</option>
                  <option value="Romanian">Romanian</option>
                  <option value="Italian">Italian</option>
                  <option value="French">French</option>
                  <option value="Asian">Asian</option>
                </select>

                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={eventFilters.location}
                  onChange={(e) => setEventFilters({ ...eventFilters, location: e.target.value })}
                >
                  <option value="All">All Locations</option>
                  <option value="Old Town">Old Town</option>
                  <option value="Floreasca">Floreasca</option>
                  <option value="Baneasa">Baneasa</option>
                </select>

                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={eventFilters.price}
                  onChange={(e) => setEventFilters({ ...eventFilters, price: e.target.value })}
                >
                  <option value="All">All Prices</option>
                  <option value="€">€</option>
                  <option value="€€">€€</option>
                  <option value="€€€">€€€</option>
                  <option value="€€€€">€€€€</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {getFilteredEvents().length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No events found</p>
                </div>
              ) : (
                getFilteredEvents().map((event) => {
                  const isRsvped = rsvpEventIds.includes(event.id)
                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="flex gap-4 p-4">
                        <div className="text-4xl">{event.emoji || "🍽️"}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            </div>
                            {isRsvped && (
                              <Badge className="bg-success text-success-foreground">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Joined
                              </Badge>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm">
                              {event.cuisine && <Badge variant="outline">{event.cuisine}</Badge>}
                              {event.price_range && <span className="text-muted-foreground">{event.price_range}</span>}
                              <span className="text-muted-foreground">
                                {event.spots_filled}/{event.capacity} spots
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant={isRsvped ? "destructive" : "default"}
                              onClick={() => handleRSVP(event.id)}
                            >
                              {isRsvped ? "Cancel" : "RSVP"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}

        {currentView === "main" && currentTab === "near-you" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <h2 className="text-2xl font-bold mb-4">People Nearby</h2>

            <div className="flex gap-2 mb-4 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                >
                  List View
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                >
                  Map View
                </Button>
              </div>

              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
              >
                <option value="All">All Distances</option>
                <option value="1km">Within 1 km</option>
                <option value="2km">Within 2 km</option>
                <option value="5km">Within 5 km</option>
                <option value="10km">Within 10 km</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="available-now">Available Now</Label>
              <Switch id="available-now" checked={availableNowFilter} onCheckedChange={setAvailableNowFilter} />
            </div>

            {viewMode === "map" ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Map view coming soon</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFilteredNearbyUsers().map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="font-semibold">
                                {profile.name}, {profile.age}
                              </h3>
                              <p className="text-sm text-muted-foreground">{profile.profession}</p>
                            </div>
                            {profile.available_now && (
                              <span className="h-2 w-2 rounded-full bg-success" title="Available now" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            {profile.distance.toFixed(1)} km away
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {profile.interests?.map((interest, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleWave(profile.name)}>
                              👋 Wave
                            </Button>
                            <Button size="sm" onClick={() => handleInvite(profile.name)}>
                              📨 Invite
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "main" && currentTab === "random-diner" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">Thursday Random Diner</h2>

              {!thursdayDiner.joined ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-8 text-center">
                      <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold mb-2">Mystery Dinner Awaits</h3>
                      <p className="text-muted-foreground mb-4">
                        Join this Thursday's random dinner experience. Restaurant revealed Wednesday at 6 PM!
                      </p>
                      <div className="text-4xl mb-4">🍽️ 🥂 🍷 🍝 🥗</div>
                      <p className="text-sm text-muted-foreground mb-6">
                        {thursdayDiner.registeredCount} people registered this week
                      </p>
                      <Button size="lg" className="w-full" onClick={() => setShowJoinModal(true)}>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Join Random Diner
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3">How it works</h4>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Join by selecting your preferences</li>
                        <li>2. Get assigned a mystery restaurant (revealed Wednesday 6 PM)</li>
                        <li>3. Meet new people at dinner Thursday 8:30 PM</li>
                        <li>4. Enjoy great food and conversation!</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="border-success">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                        <h3 className="text-xl font-bold">You're In!</h3>
                      </div>

                      {thursdayDiner.revealed && thursdayDiner.assignedRestaurant ? (
                        <div className="text-center space-y-4">
                          <div className="text-6xl">{thursdayDiner.assignedRestaurant.emoji || "🍽️"}</div>
                          <h2 className="text-2xl font-bold">{thursdayDiner.assignedRestaurant.name}</h2>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{thursdayDiner.assignedRestaurant.cuisine}</p>
                            <div className="flex items-center justify-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{thursdayDiner.assignedRestaurant.location}</span>
                            </div>
                            {thursdayDiner.assignedRestaurant.address && (
                              <p className="text-muted-foreground">{thursdayDiner.assignedRestaurant.address}</p>
                            )}
                            <p className="font-semibold">Thursday, 8:30 PM</p>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button>Get Directions</Button>
                            <Button variant="outline">Add to Calendar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <p className="text-muted-foreground">Restaurant reveals Wednesday at 6:00 PM</p>
                          <div className="text-2xl mb-4">🍽️ 🥂 🍷 🍝 🥗</div>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Your Preferences:</strong>
                            </p>
                            <p>Price: {thursdayDiner.preferences.priceRange}</p>
                            {thursdayDiner.preferences.cuisine && <p>Cuisine: {thursdayDiner.preferences.cuisine}</p>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setThursdayDiner({ ...thursdayDiner, joined: false })}
                  >
                    Cancel RSVP
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "main" && currentTab === "profile" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                <p className="text-muted-foreground">
                  {user.age} | {user.profession}
                </p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userStats.dinners_attended}</div>
                    <div className="text-sm text-muted-foreground">Dinners</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userStats.connections_made}</div>
                    <div className="text-sm text-muted-foreground">Connections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userStats.current_streak}</div>
                    <div className="text-sm text-muted-foreground">Week Streak</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{userStats.badges_earned}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleMyConnections}>
                  <User className="mr-2 h-5 w-5" />
                  My Connections ({userStats.connections_made})
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleMessages}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Messages
                  <Badge className="ml-auto" variant="default">
                    2
                  </Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent opacity-50 cursor-not-allowed"
                  disabled
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Methods
                  <Lock className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleNotificationSettings}
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleAccountSettings}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Account Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentView === "connections" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">My Connections</h2>
            </div>
            <div className="space-y-4">
              {profilesWithDistance
                .filter((p) => matchedProfiles.includes(p.id))
                .map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground">{profile.profession}</p>
                          <Button size="sm" className="mt-2" onClick={() => toast({ description: "Message sent!" })}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {currentView === "messages" && !selectedChat && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartChat(conv.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={conv.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{conv.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{conv.name}</h3>
                          <span className="text-xs text-muted-foreground">{conv.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && <Badge className="bg-primary shrink-0">{conv.unread}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === "chat" && selectedChat && (
          <div className="h-full flex flex-col">
            <div className="border-b p-4 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedChat(null)
                  setCurrentView("messages")
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={conversations.find((c) => c.id === selectedChat)?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{conversations.find((c) => c.id === selectedChat)?.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{conversations.find((c) => c.id === selectedChat)?.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[70%]">
                  Looking forward to Thursday!
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[70%]">Me too! See you there 😊</div>
              </div>
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && messageInput.trim()) {
                      toast({ description: "Message sent!" })
                      setMessageInput("")
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    if (messageInput.trim()) {
                      toast({ description: "Message sent!" })
                      setMessageInput("")
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentView === "notification-settings" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">Notification Settings</h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="matches">New Matches</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you match</p>
                  </div>
                  <Switch
                    id="matches"
                    checked={notificationSettings.matches}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, matches: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new messages</p>
                  </div>
                  <Switch
                    id="messages"
                    checked={notificationSettings.messages}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, messages: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="events">Event Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about events</p>
                  </div>
                  <Switch
                    id="events"
                    checked={notificationSettings.events}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, events: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="thursday">Thursday Diner</Label>
                    <p className="text-sm text-muted-foreground">Get Thursday dinner updates</p>
                  </div>
                  <Switch
                    id="thursday"
                    checked={notificationSettings.thursdayDiner}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, thursdayDiner: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch
                    id="email"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    id="push"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "account-settings" && (
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">Account Settings</h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={accountEmail} readOnly className="mt-1 bg-muted" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button className="w-full">Update Account</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <nav className="sticky bottom-0 z-40 bg-background border-t">
        <div className="flex justify-around items-center h-20 px-2">
          <button
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              currentTab === "match" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setCurrentTab("match")
              setCurrentView("main")
            }}
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs font-medium">Match</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              currentTab === "events" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setCurrentTab("events")
              setCurrentView("main")
            }}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs font-medium">Events</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              currentTab === "near-you" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setCurrentTab("near-you")
              setCurrentView("main")
            }}
          >
            <MapPin className="h-6 w-6" />
            <span className="text-xs font-medium">Near You</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              currentTab === "random-diner" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setCurrentTab("random-diner")
              setCurrentView("main")
            }}
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-xs font-medium">Diner</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              currentTab === "profile" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setCurrentTab("profile")
              setCurrentView("main")
            }}
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Event</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-emoji">Event Icon</Label>
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

                <div>
                  <Label htmlFor="event-title">
                    Event Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Wine Tasting Evening"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Input
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="A delightful evening of wine and conversation..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">
                      Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="event-location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Old Town"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={newEvent.event_type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                    >
                      <SelectTrigger id="event-type" className="mt-1">
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
                    <Label htmlFor="event-cuisine">Cuisine</Label>
                    <Input
                      id="event-cuisine"
                      value={newEvent.cuisine}
                      onChange={(e) => setNewEvent({ ...newEvent, cuisine: e.target.value })}
                      placeholder="Italian"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-price">Price Range</Label>
                    <Select
                      value={newEvent.price_range}
                      onValueChange={(value) => setNewEvent({ ...newEvent, price_range: value })}
                    >
                      <SelectTrigger id="event-price" className="mt-1">
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
                  <Label htmlFor="event-capacity">Capacity</Label>
                  <Input
                    id="event-capacity"
                    type="number"
                    min="2"
                    max="100"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: Number.parseInt(e.target.value) || 12 })}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowAddEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Join Thursday Dinner</h3>
              <div className="space-y-4">
                <div>
                  <Label>Price Range</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) =>
                      setThursdayDiner({
                        ...thursdayDiner,
                        preferences: { ...thursdayDiner.preferences, priceRange: e.target.value },
                      })
                    }
                  >
                    <option value="">Select price range</option>
                    <option value="€">€</option>
                    <option value="€€">€€</option>
                    <option value="€€€">€€€</option>
                    <option value="€€€€">€€€€</option>
                  </select>
                </div>
                <div>
                  <Label>Dietary Restrictions (Optional)</Label>
                  <div className="space-y-2 mt-2">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"].map((dietary) => (
                      <label key={dietary} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={thursdayDiner.preferences.dietary.includes(dietary)}
                          onChange={(e) => {
                            const newDietary = e.target.checked
                              ? [...thursdayDiner.preferences.dietary, dietary]
                              : thursdayDiner.preferences.dietary.filter((d) => d !== dietary)
                            setThursdayDiner({
                              ...thursdayDiner,
                              preferences: { ...thursdayDiner.preferences, dietary: newDietary },
                            })
                          }}
                        />
                        <span className="text-sm">{dietary}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Cuisine Preference (Optional)</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) =>
                      setThursdayDiner({
                        ...thursdayDiner,
                        preferences: { ...thursdayDiner.preferences, cuisine: e.target.value },
                      })
                    }
                  >
                    <option value="">Any cuisine</option>
                    <option value="Romanian">Romanian</option>
                    <option value="Italian">Italian</option>
                    <option value="French">French</option>
                    <option value="Asian">Asian</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (thursdayDiner.preferences.priceRange) {
                        handleJoinThursdayDiner(thursdayDiner.preferences)
                      } else {
                        toast({
                          description: "Please select a price range",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted ${!notif.read ? "bg-primary/10" : ""}`}
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
