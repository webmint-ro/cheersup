-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user is the admin account
  RETURN auth.email() IN ('adminpol2@email.com', 'webmintromania@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for events (full CRUD access)
CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (is_admin());

-- Admin policies for restaurants (full CRUD access)
CREATE POLICY "Admins can insert restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update restaurants" ON public.restaurants
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete restaurants" ON public.restaurants
  FOR DELETE USING (is_admin());

-- Admin policies for thursday_diners (full access)
CREATE POLICY "Admins can view all thursday diners" ON public.thursday_diners
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update thursday diners" ON public.thursday_diners
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete thursday diners" ON public.thursday_diners
  FOR DELETE USING (is_admin());

-- Admin policies for profiles (read-only for admins)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin() OR true);

CREATE POLICY "Admins can update user profiles" ON public.profiles
  FOR UPDATE USING (is_admin() OR auth.uid() = id);

-- Admin policies for user_stats (full access)
CREATE POLICY "Admins can view all stats" ON public.user_stats
  FOR SELECT USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update all stats" ON public.user_stats
  FOR UPDATE USING (is_admin() OR auth.uid() = user_id);

-- Admin policies for matches (view all)
CREATE POLICY "Admins can view all matches" ON public.matches
  FOR SELECT USING (is_admin() OR auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Admins can delete matches" ON public.matches
  FOR DELETE USING (is_admin());

-- Admin policies for RSVPs (view and manage all)
CREATE POLICY "Admins can view all RSVPs" ON public.rsvps
  FOR SELECT USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can manage RSVPs" ON public.rsvps
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete any RSVP" ON public.rsvps
  FOR DELETE USING (is_admin() OR auth.uid() = user_id);

-- Admin policies for messages (view all for moderation)
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (is_admin() OR auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Admins can delete messages" ON public.messages
  FOR DELETE USING (is_admin());

-- Admin policies for notifications (view and manage all)
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update notifications" ON public.notifications
  FOR UPDATE USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (is_admin());
