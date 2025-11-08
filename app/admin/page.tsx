import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.email !== "webmintromania@gmail.com") {
    redirect("/")
  }

  // Fetch all Thursday Diner registrations
  const { data: thursdayDiners } = await supabase
    .from("thursday_diners")
    .select(
      `
      *,
      profiles:user_id (*),
      restaurants:assigned_restaurant_id (*)
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch all restaurants
  const { data: restaurants } = await supabase.from("restaurants").select("*").order("name")

  // Fetch all events
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: false })

  return (
    <AdminDashboard
      user={profile}
      thursdayDiners={thursdayDiners || []}
      restaurants={restaurants || []}
      events={events || []}
    />
  )
}
