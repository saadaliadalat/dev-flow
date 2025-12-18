# 🚀 DevFlow - Spotify Wrapped for Developers

> **The next-generation developer analytics platform that will go VIRAL!**

DevFlow is the "Spotify Wrapped for Developers" - a comprehensive analytics platform with AI-powered insights, gamification, social features, and team collaboration tools.

## ✨ Features

### 📊 Core Analytics
- **Productivity Tracking**: Monitor commits, PRs, issues, and code volume
- **Time Patterns**: Discover your most productive hours and coding habits
- **Language Breakdown**: See which languages you use most
- **Streak System**: Track daily coding streaks (current & longest)

### 🤖 AI-Powered Insights
- **GPT-4 Integration**: Personalized productivity recommendations
- **Burnout Detection**: ML algorithm that predicts burnout before it happens
- **Pattern Recognition**: Identify trends in your coding behavior
- **Actionable Tips**: Get specific advice to improve productivity

### 🏆 Gamification
- **15+ Achievements**: Unlock badges for milestones and special accomplishments
- **Global Leaderboards**: Compete with developers worldwide
- **Progress Tracking**: See how close you are to unlocking achievements
- **Shareable Badges**: Show off your accomplishments

### 🎁 Viral Sharing
- **Year in Review**: Beautiful shareable cards (like Spotify Wrapped)
- **Developer DNA**: Unique coding personality profile
- **Custom Stats**: Personalized metrics and highlights
- **Social Sharing**: One-click sharing to Twitter, LinkedIn, etc.

### 👥 Social & Teams
- **Friend Connections**: Compare stats with friends
- **Team Analytics**: See how your team collaborates
- **Private Leaderboards**: Team-only competitions
- **Collaboration Metrics**: Track code reviews and interactions

## 🏗️ Tech Stack

### Backend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL 15)
- **Authentication**: NextAuth.js v5 with GitHub OAuth
- **Caching**: Upstash Redis
- **AI**: OpenAI GPT-4
- **Background Jobs**: Inngest
- **APIs**: GitHub REST & GraphQL (Octokit)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase
- **Monitoring**: Sentry
- **Analytics**: PostHog

## 📁 Project Structure

```
dev-flow/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── github/
│   │   │   └── sync/               # GitHub data sync
│   │   ├── analytics/
│   │   │   ├── productivity/       # Productivity metrics
│   │   │   └── burnout/            # Burnout detection
│   │   ├── achievements/
│   │   │   └── unlock/             # Achievement system
│   │   ├── insights/
│   │   │   └── generate/           # AI insights
│   │   ├── social/
│   │   │   ├── connections/        # Friend system
│   │   │   └── leaderboard/        # Rankings
│   │   ├── teams/                  # Team management
│   │   ├── sharing/
│   │   │   ├── year-review/        # Year in review
│   │   │   └── [shareUrl]/         # Public shares
│   │   └── user/
│   │       └── profile/            # User profile
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── auth.ts                     # Auth configuration
│   ├── db.ts                       # Database helpers
│   ├── encryption.ts               # Token encryption
│   └── utils.ts                    # Utility functions
├── supabase-schema.sql             # Database schema
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.js
└── .env.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase account
- GitHub OAuth App
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dev-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL in `supabase-schema.sql` in the SQL Editor
   - Copy your project URL and keys

4. **Create GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set callback URL to `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Client Secret

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   # Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

   # GitHub
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Encryption
   ENCRYPTION_KEY=generate_with_openssl_rand_hex_32
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The project uses 10 main tables:

1. **users** - User profiles and GitHub data
2. **daily_stats** - Daily coding statistics
3. **repositories** - Repository information
4. **achievements** - User achievements
5. **insights** - AI-generated insights
6. **teams** - Team information
7. **social_connections** - Friend connections
8. **leaderboards** - Ranking data
9. **sharing_cards** - Shareable cards
10. **burnout_predictions** - Burnout risk analysis

See `supabase-schema.sql` for complete schema.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with GitHub
- `POST /api/auth/signout` - Sign out

### GitHub Integration
- `POST /api/github/sync` - Sync GitHub data

### Analytics
- `GET /api/analytics/productivity` - Get productivity metrics
- `GET /api/analytics/burnout` - Get burnout analysis

### Achievements
- `POST /api/achievements/unlock` - Check and unlock achievements
- `GET /api/achievements/unlock?userId=xxx` - List achievements

### AI Insights
- `POST /api/insights/generate` - Generate AI insights

### Social
- `GET /api/social/leaderboard` - Get leaderboard
- `GET /api/social/connections` - List connections
- `POST /api/social/connections` - Create connection

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team

### Sharing
- `GET /api/sharing/year-review` - Generate year review
- `GET /api/sharing/[shareUrl]` - View shared card

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## 🎯 Key Features Explained

### Productivity Score Algorithm
The productivity score (0-100) is calculated using:
- **Commit Score** (30%): Number of commits
- **Volume Score** (25%): Lines of code added
- **Diversity Score** (20%): Number of unique repos
- **Consistency Score** (25%): Active hours per day

### Burnout Detection
Uses 6 factors to predict burnout risk:
- Long working hours (25% weight)
- Weekend work (15% weight)
- Late-night coding (20% weight)
- No breaks (20% weight)
- Productivity decline (15% weight)
- Inconsistent patterns (5% weight)

### Developer DNA
Calculates 5 personality traits:
- **Consistency**: How regularly you code
- **Intensity**: Average commits per active day
- **Variety**: Number of languages used
- **Collaboration**: Interaction with other developers
- **Night Owl**: Percentage of late-night commits

## 🔒 Security

- GitHub tokens are encrypted using AES-256
- Row Level Security (RLS) enabled on all tables
- JWT-based session management
- HTTPS-only in production

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Update GitHub OAuth**
   - Update callback URL to your production domain
   - Update `NEXTAUTH_URL` in environment variables

## 📝 TODO

- [ ] Set up Inngest for background jobs
- [ ] Implement daily sync cron job
- [ ] Add OG image generation for sharing
- [ ] Set up Sentry error tracking
- [ ] Add rate limiting
- [ ] Implement caching with Redis
- [ ] Add email notifications
- [ ] Build frontend UI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- GitHub API for providing developer data
- OpenAI for GPT-4 insights
- Supabase for the amazing database platform
- Vercel for hosting

---

**Built with ❤️ for developers who want to understand their coding journey**

🔥 **Make DevFlow go VIRAL!** 🔥
