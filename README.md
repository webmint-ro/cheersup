# CheersUp - Social Dining Connection Platform

Connect strangers through curated dining experiences in Bucharest. A modern progressive web app built with Next.js 15, Supabase, and TypeScript.

## Features

### Core Functionality
- **Match Tab** - Tinder-style profile discovery with swipe actions (skip/match/super match)
- **Events Tab** - Browse and RSVP to dining events with advanced filtering
- **Near You Tab** - Discover nearby users with real-time distance calculations
- **Random Thursday Diner** - Signature mystery dinner experience with restaurant reveals
- **Profile Tab** - User stats, connections, settings, and account management

### Technical Features
- Full authentication with Supabase (email/password)
- Real-time database operations with Row Level Security (RLS)
- Responsive mobile-first design
- Server-side rendering with Next.js 15
- Type-safe with TypeScript
- Beautiful UI with shadcn/ui components

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (already connected via v0)
- Git for version control

### Installation

1. **Database Setup** - Run the SQL scripts in order:
   
   The scripts are in the `scripts/` folder. They will:
   - Create all database tables (profiles, events, matches, etc.)
   - Set up Row Level Security policies
   - Create triggers for auto-profile creation
   - Seed initial restaurant and event data

   To run them:
   - Click the "Run" button next to each SQL file in the v0 interface
   - Or copy the SQL and run it in your Supabase SQL editor
   - Run them in order: `001`, `002`, `003`

2. **Environment Variables** - Already configured via Supabase integration:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Database connection strings

3. **Deploy to Vercel**:
   - Click the "Publish" button in v0
   - Your app will be live in seconds!

### Local Development

If you want to run locally:

\`\`\`bash
# Clone the repository
git clone <your-repo>
cd cheersup-app

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## Database Schema

### Main Tables

**profiles**
- User profiles extending auth.users
- Location data, bio, profession
- RLS: Users can view all, update only their own

**events**
- Dining events with RSVP capacity
- Location, cuisine, price range
- RLS: Public read, admin write

**matches**
- User-to-user connections
- Compatibility scores
- RLS: Users see only their matches

**thursday_diners**
- Weekly mystery dinner registrations
- Preferences and restaurant assignments
- RLS: Users see only their own

**rsvps**
- Event participation tracking
- RLS: Users manage only their own

**restaurants**
- Partner restaurant data
- RLS: Public read

**messages**
- User-to-user messaging
- RLS: View only own conversations

**notifications**
- In-app notification system
- RLS: Users see only their own

## Authentication Flow

1. **Sign Up** (`/auth/sign-up`)
   - Email and password registration
   - User metadata (name, age, profession)
   - Auto-creates profile via database trigger
   - Email confirmation required

2. **Login** (`/auth/login`)
   - Email/password authentication
   - Redirects to main app

3. **Protected Routes**
   - Middleware checks authentication
   - Redirects unauthenticated users to login
   - Server components verify user session

4. **Logout**
   - Supabase sign out
   - Clears session and redirects to login

## Key Features Explained

### Match System
- View nearby users with distance calculations
- Swipe actions: Skip, Match, Super Match
- Matches saved to database with RLS protection
- Compatibility scores generated

### Events & RSVPs
- Real-time spot counting
- Filter by type, cuisine, location, price
- RSVP creates database record
- Updates event capacity live

### Thursday Random Diner
1. User joins with preferences (price, dietary, cuisine)
2. System randomly assigns restaurant
3. Countdown to Wednesday 6 PM reveal
4. Restaurant details unlocked
5. Thursday dinner event

### Location-Based Discovery
- Calculate distance between users using Haversine formula
- Filter by distance radius (1km, 2km, 5km, 10km)
- "Available Now" status toggle
- Wave and invite actions

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only modify their own data
- Public data (events, restaurants) is read-only
- Messages restricted to participants
- Matches visible only to involved users

### Authentication
- Supabase Auth with secure JWT tokens
- Password hashing with bcrypt
- Email verification required
- Session management via middleware

## API Routes (Future Enhancement)

The current implementation uses direct Supabase queries. For production, consider adding API routes:

\`\`\`typescript
// app/api/matches/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Handle match creation
}
\`\`\`

## Deployment

### Vercel (Recommended)
1. Click "Publish" in v0 interface
2. Automatic deployment with environment variables
3. Supabase integration pre-configured
4. Custom domain support

### Manual Deployment
\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Environment Variables Reference

Required for production:

\`\`\`env
# Supabase (already configured via v0)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Development redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Deployment**: Vercel

## Design System

### Colors
- Primary Orange: `#E8773D` - Main actions, highlights
- Secondary Teal: `#21808D` - Accents
- Gold: `#F5B841` - Super match, special features
- Success Green: `#06A77D` - Confirmations
- Danger Red: `#E63946` - Destructive actions

### Typography
- Sans: Geist - Body text and UI
- Mono: Geist Mono - Code and technical content

### Spacing
- 8px base grid system
- Consistent padding and margins
- Mobile-first responsive design

## Project Structure

\`\`\`
cheersup-app/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── sign-up/page.tsx        # Registration
│   │   └── sign-up-success/page.tsx
│   ├── globals.css                 # Global styles & design tokens
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main app (server component)
├── components/
│   ├── ui/                         # shadcn/ui components
│   └── cheers-up-client.tsx        # Main app client component
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── middleware.ts           # Auth middleware logic
├── scripts/
│   ├── 001_create_schema.sql      # Database schema
│   ├── 002_create_profile_trigger.sql
│   └── 003_seed_data.sql          # Sample data
├── middleware.ts                   # Next.js middleware
└── README.md
\`\`\`

## Usage Guide

### For Users

1. **Sign Up**: Create account with email, name, age, profession
2. **Verify Email**: Check inbox for confirmation link
3. **Login**: Access the app
4. **Match**: Swipe through profiles, match with interesting people
5. **Events**: Browse and RSVP to dining events
6. **Near You**: Find nearby users for spontaneous meetups
7. **Thursday Diner**: Join the weekly mystery dinner
8. **Profile**: Manage connections, messages, settings

### For Developers

1. **Run Scripts**: Execute SQL files to set up database
2. **Test Auth**: Try signup/login flow
3. **Check RLS**: Verify security policies work
4. **Add Features**: Extend with new functionality
5. **Deploy**: Push to production via Vercel

## Troubleshooting

### "User not authenticated" errors
- Check if email is verified
- Verify Supabase environment variables
- Check middleware configuration

### Database errors
- Ensure all scripts ran successfully
- Verify RLS policies are enabled
- Check user has correct permissions

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## Future Enhancements

- [ ] Real-time messaging with Supabase Realtime
- [ ] Push notifications for matches and events
- [ ] Payment integration with Stripe
- [ ] Advanced matching algorithm
- [ ] Event photo sharing
- [ ] User reviews and ratings
- [ ] Mobile apps (iOS/Android)
- [ ] Social media integration
- [ ] AI-powered recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this for your own projects!

## Support

For issues or questions:
- Check the troubleshooting section
- Review the Supabase documentation
- Contact support via Vercel help

## Acknowledgments

Built with:
- Next.js by Vercel
- Supabase for backend
- shadcn/ui for components
- v0 by Vercel for rapid development

---

**Ready to connect over dinner? Let's go!** 🍽️
