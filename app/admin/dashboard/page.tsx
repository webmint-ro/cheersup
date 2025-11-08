import { createClient } from "@/lib/supabase/server"
import { ExtensiveAdminDashboard } from "@/components/extensive-admin-dashboard"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch all data for admin dashboard
  const [
    { data: profiles },
    { data: events },
    { data: restaurants },
    { data: thursdayDiners },
    { data: matches },
    { data: rsvps },
    { data: messages },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("profiles").select("*, user_stats(*)").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("event_date", { ascending: false }),
    supabase.from("restaurants").select("*").order("name"),
    supabase.from("thursday_diners").select("*, profiles(*), restaurants(*)").order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select("*, profiles!matches_user_id_fkey(*), matched:profiles!matches_matched_user_id_fkey(*)"),
    supabase.from("rsvps").select("*, profiles(*), events(*)").order("rsvp_date", { ascending: false }),
    supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(*), recipient:profiles!messages_recipient_id_fkey(*)")
      .order("sent_at", { ascending: false }),
    supabase.from("notifications").select("*, profiles(*)").order("created_at", { ascending: false }),
  ])

  return (
    <ExtensiveAdminDashboard
      profiles={profiles || []}
      events={events || []}
      restaurants={restaurants || []}
      thursdayDiners={thursdayDiners || []}
      matches={matches || []}
      rsvps={rsvps || []}
      messages={messages || []}
      notifications={notifications || []}
    />
  )
}
