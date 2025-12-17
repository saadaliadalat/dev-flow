# 🚀 DevFlow - Developer Productivity Analytics Platform

<div align="center">

![DevFlow Logo](https://img.shields.io/badge/DevFlow-Analytics-06b6d4?style=for-the-badge&logo=github)

**Transform your GitHub data into actionable insights. Track productivity, analyze patterns, and level up your development workflow.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

DevFlow is a **production-grade developer productivity analytics platform** that connects to your GitHub account via OAuth, analyzes your coding patterns, displays real-time analytics, calculates productivity scores, and provides actionable insights.

Think of it as **GitHub Insights meets Notion** with a beautiful **glassmorphism design**.

---

## ✨ Features

### 🏠 **Landing Page** ✅
- Stunning glassmorphism hero section with animations
- Feature showcase with Framer Motion
- Clear call-to-action for GitHub sign-in
- Fully responsive design

### 🔐 **Authentication** ✅
- GitHub OAuth integration via NextAuth.js v5
- Secure session management with Supabase adapter
- Protected routes with middleware
- Beautiful sign-in and error pages

### 📊 **Dashboard** (Planned)
- Productivity Score (0-100)
- Stats Grid (commits, PRs, issues, reviews)
- Commit Heatmap (365 days)
- Activity Charts
- Language Breakdown
- Streak Counter

### 📈 **Analytics** (Planned)
- Time intelligence analysis
- Repository insights
- Code volume statistics
- Trend analysis

### 🏆 **Achievements** (Planned)
- 20+ unlockable badges
- Progress tracking
- Gamification system

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Lucide Icons
- Radix UI

### Backend
- Next.js API Routes
- Supabase (PostgreSQL)
- NextAuth.js v5
- Octokit (GitHub API)

### Deployment
- Vercel
- Supabase Cloud

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- GitHub Account
- Supabase Account

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

### Environment Setup

#### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-schema.sql` in the Supabase SQL Editor
3. Get your credentials from Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy your:
   - `GITHUB_ID` (Client ID)
   - `GITHUB_SECRET` (Client Secret)

#### 3. NextAuth Secret

Generate a secret:
```bash
openssl rand -base64 32
```

Add to `.env.local` as `NEXTAUTH_SECRET`

### Complete .env.local Example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
dev-flow/
├── app/
│   ├── (auth)/auth/          # Authentication pages
│   ├── (dashboard)/          # Dashboard pages
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Reusable components
│   ├── dashboard/            # Dashboard components
│   └── charts/               # Chart components
├── lib/
│   ├── supabase.ts           # Database client
│   ├── github.ts             # GitHub API
│   ├── analytics.ts          # Analytics logic
│   ├── auth.ts               # Auth config
│   └── utils.ts              # Utilities
├── types/                    # TypeScript types
├── hooks/                    # Custom hooks
└── public/                   # Static assets
```

---

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy!

### Update GitHub OAuth

After deployment, update your GitHub OAuth app:
- **Homepage URL**: `https://your-domain.vercel.app`
- **Callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation
- [x] Project setup
- [x] Glassmorphism design system
- [x] Database schema
- [x] Authentication
- [x] Landing page
- [x] Core UI components

### 🚧 Phase 2: Core Features (Next)
- [ ] Dashboard page
- [ ] GitHub API sync
- [ ] Productivity calculations
- [ ] Chart components
- [ ] Analytics page

### 📅 Phase 3: Advanced
- [ ] Achievements system
- [ ] Settings page
- [ ] Mobile optimization
- [ ] Performance tuning

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**Built with ❤️ for developers**

⭐ Star this repo if you find it useful!

</div>
