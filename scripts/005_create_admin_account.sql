-- Create admin user account with auto-confirmed email
-- This bypasses the email verification requirement

-- Insert admin user into auth.users (Supabase auth schema)
-- Password: adminpol2025
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'adminpol2@email.com',
  crypt('adminpol2025', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Pol"}',
  false,
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for admin user
INSERT INTO public.profiles (
  id,
  email,
  name,
  age,
  profession,
  bio,
  created_at
)
SELECT 
  id,
  'adminpol2@email.com',
  'Admin Pol',
  30,
  'Platform Administrator',
  'CheersUp platform administrator',
  NOW()
FROM auth.users
WHERE email = 'adminpol2@email.com'
ON CONFLICT (id) DO NOTHING;

-- Grant admin role (optional - for future role-based access)
UPDATE public.profiles
SET bio = 'CheersUp platform administrator with full access'
WHERE email = 'adminpol2@email.com';
