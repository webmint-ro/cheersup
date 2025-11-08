import { createClient } from "@/lib/supabase/server"
import CheersUpClient from "@/components/cheers-up-client"
import { redirect } from "next/navigation"

export default async function HomePage() {
  console.log("[v0] HomePage - Starting render")

  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] HomePage - User exists:", !!user)

  if (!user) {
    console.log("[v0] HomePage - No user, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] HomePage - Fetching user data")

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user stats
  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

  // Fetch all profiles for matching
  const { data: allProfiles } = await supabase.from("profiles").select("*").neq("id", user.id).limit(50)

  // Fetch events
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: true })

  // Fetch user's RSVPs
  const { data: rsvps } = await supabase.from("rsvps").select("event_id").eq("user_id", user.id)

  // Fetch user's matches
  const { data: matches } = await supabase.from("matches").select("matched_user_id").eq("user_id", user.id)

  // Fetch restaurants
  const { data: restaurants } = await supabase.from("restaurants").select("*")

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const rsvpEventIds = rsvps?.map((r) => r.event_id) || []
  const matchedUserIds = matches?.map((m) => m.matched_user_id) || []

  console.log("[v0] HomePage - Rendering client component")

  return (
    <CheersUpClient
      user={profile || { id: user.id, name: "User", age: 28, profession: "Professional" }}
      userStats={stats || { dinners_attended: 0, connections_made: 0, current_streak: 0, badges_earned: 0 }}
      profiles={allProfiles || []}
      events={events || []}
      rsvpEventIds={rsvpEventIds}
      matchedUserIds={matchedUserIds}
      restaurants={restaurants || []}
      notifications={notifications || []}
    />
  )
}
