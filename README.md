# DRISHTI — AI Smart Traffic Intelligence Platform

> *Drishti* (दृष्टि) means **Vision** in Sanskrit.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com)
[![Google Maps](https://img.shields.io/badge/Google_Maps-Platform-blue?logo=google-maps)](https://developers.google.com/maps)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## 🌐 Project Vision

DRISHTI is an **AI-powered Smart City Traffic Intelligence Platform** designed for urban traffic awareness and intelligent traffic management. Built for both citizens navigating the city and traffic administrators managing city-wide infrastructure.

The platform simulates a real smart-city deployment integrating:
- **Real-time traffic visualization** via Google Maps Platform
- **Firebase Authentication** for secure multi-role access
- **AI-driven traffic analytics** and congestion prediction
- **Interactive dashboards** for both citizens and administrators

---

## 🖥️ Platform Overview

| Module | Description |
|--------|-------------|
| **Citizen Dashboard** | Interactive map with routes, signals, and AI congestion alerts |
| **Traffic Control Center** | Admin panel with intersection monitoring and signal management |

---

## ✨ Features

### Citizen Navigation Dashboard
- 🗺️ Full-screen interactive Google Map with dark smart-city theme
- 🚦 Traffic signal visualization with congestion indicators
- 📊 AI congestion prediction charts for the next 24 hours
- 🔴🟡🟢 Real-time signal status per intersection arm
- 📱 Mobile-responsive glassmorphism UI
- 🔔 Smart alerts for high-congestion intersections
- 🛣️ Alternative route recommendations

### Smart Traffic Control Center (Admin)
- 🗺️ City-wide traffic overview map
- 📡 Intersection monitoring system (6 key junctions)
- 📈 Traffic analytics with hourly vehicle counts
- 🤖 AI-based signal timing recommendations
- 🚨 Emergency corridor activation simulation
- ⚙️ Manual signal override capability
- 📉 Congestion trend visualization (Line + Bar charts)

### AI Traffic Intelligence
- Simulated traffic density using realistic urban hour-of-day patterns
- Peak hour detection (8–9 AM, 6–8 PM)
- Congestion probability forecasting
- Priority-based signal recommendation system

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript 5 |
| Authentication | Firebase Auth (Google Sign-in + Email/Password) |
| Maps | Google Maps JavaScript API |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Database (Optional) | Supabase (PostgreSQL) |
| Deployment | Vercel |
| Package Manager | pnpm |

---

## 📁 Project Structure

```
drishti-ai/
├── app/
│   ├── api/                        # Server API routes
│   │   ├── analytics/              # Traffic analytics data
│   │   ├── intersections/[id]/     # Per-intersection data
│   │   ├── recommendations/        # AI recommendations
│   │   ├── signals/                # Signal control
│   │   └── traffic/predict/        # AI traffic prediction
│   ├── auth/
│   │   ├── login/                  # Firebase login page
│   │   └── sign-up/                # Firebase registration
│   ├── dashboard/
│   │   ├── admin/                  # Traffic Control Center
│   │   ├── layout.tsx              # Auth-protected layout
│   │   └── page.tsx                # Citizen Dashboard
│   └── layout.tsx                  # Root layout with AuthProvider
├── components/
│   ├── dashboard/
│   │   ├── traffic-map.tsx         # Google Maps component
│   │   ├── traffic-signals.tsx     # Signal visualization
│   │   ├── traffic-analytics.tsx   # Charts & analytics
│   │   ├── ai-recommendations.tsx  # AI suggestion panel
│   │   ├── citizen-dashboard.tsx   # Full citizen view
│   │   ├── admin-dashboard.tsx     # Full admin view
│   │   └── nav.tsx                 # Navigation with Firebase auth
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── firebase/
│   │   ├── config.ts               # Firebase lazy initialization
│   │   ├── auth.ts                 # Auth helper functions
│   │   └── auth-context.tsx        # React auth context
│   ├── supabase/                   # Optional Supabase integration
│   ├── mock-data.ts                # AI-simulated traffic data
│   └── db.ts                       # Database helpers
├── proxy.ts                        # Next.js 16 routing middleware
├── vercel.json                     # Vercel deployment config
├── .env.example                    # Environment variables template
└── ARCHITECTURE.md                 # System architecture document
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20.9+ 
- pnpm 8+
- Firebase account
- Google Cloud account (for Maps API)

### 1. Clone and Install

```bash
git clone https://github.com/sayonmitra-code/drishti-ai.git
cd drishti-ai
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys (see [Environment Variables](#-environment-variables)).

### 3. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase Messaging ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase App ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps JS API Key |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase URL (optional, uses mock data if absent) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase Anon Key (optional) |

> **Note:** If Supabase env vars are not set, the platform automatically uses AI-simulated mock data. The platform is fully functional without Supabase.

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Sign-in methods → Enable:
   - Email/Password
   - Google
4. Go to **Project Settings** → **General** → **Your apps** → Add Web App
5. Copy the config values to your `.env.local`

---

## 🗺️ Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Directions API**  
   - **Traffic Layer** (included in Maps JS API)
4. Create credentials → **API Key**
5. (Recommended) Add HTTP referrer restrictions
6. Copy the key to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 📦 Deployment on Vercel

### Method 1: One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sayonmitra-code/drishti-ai)

### Method 2: Manual Deploy

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel deploy`
3. Set environment variables in Vercel Dashboard → Settings → Environment Variables

### Build Configuration (auto-detected from vercel.json)

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## 🖼️ Screenshots

> *Screenshots shown after deployment with live Firebase and Google Maps keys*

| Citizen Dashboard | Traffic Control Center |
|:-----------------:|:----------------------:|
| Interactive map with signals | Admin analytics panel |

---

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system architecture, data flow diagrams, and component hierarchy.

---

## 👥 Team

Built for Smart India Hackathon — AI Smart City Track

---

## 📄 License

This project is private and intended for hackathon demonstration purposes.
