# DRISHTI — AI Smart Traffic Intelligence Platform

> *Drishti* (दृष्टि) means **Vision** in Sanskrit.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Leaflet-green?logo=openstreetmap)](https://leafletjs.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## 🌐 Project Vision

DRISHTI is an **AI-powered Smart City Traffic Intelligence Platform** designed for urban traffic awareness and intelligent traffic management. Built for both citizens navigating the city and traffic administrators managing city-wide infrastructure.

The platform simulates a real smart-city deployment integrating:
- **Real-time traffic visualization** via Leaflet.js + OpenStreetMap (100% free, no API key required)
- **Firebase Authentication** for secure multi-role access (Google Sign-In + Email/Password)
- **AI-driven traffic analytics** and congestion prediction
- **Interactive dashboards** for both citizens and administrators
- **India-wide routing** using OSRM + Nominatim geocoding
- **Default city: Lucknow, India** (26.8467°N, 80.9462°E)

---

## 🖥️ Platform Overview

| Module | Description |
|--------|-------------|
| **Citizen Dashboard** | Interactive map with India-wide routing, traffic signals, and AI congestion alerts |
| **Traffic Control Center** | Admin panel with intersection monitoring, AI signal control, and analytics |
| **Master Admin Portal** | Secure login at `/master-admin` with Email/Password and Google Sign-In |

---

## ✨ Features

### Citizen Navigation Dashboard
- 🗺️ Interactive Leaflet map centered on Lucknow, India
- 🛣️ India-wide source → destination routing (e.g. Lucknow → Goa, Lucknow → Kolkata)
- 🚗 **Car Navigation Mode** — animated vehicle marker moving along the route
- 🚦 Traffic signal visibility during navigation with color, timer, and distance
- 📊 AI congestion prediction charts for the next 24 hours
- 🔴🟡🟢 Real-time signal status per intersection
- 📱 Mobile-responsive UI
- 🔔 Smart alerts and demo incident mode

### Smart Traffic Control Center (Admin)
- 🗺️ City-wide traffic overview map (Lucknow intersections)
- 📡 Intersection monitoring system (8 key Lucknow junctions)
- 📈 Traffic analytics with hourly vehicle counts
- 🤖 AI-based signal timing recommendations
- 🕹️ Manual Mode / AI Mode toggle
- 🚨 Emergency corridor activation simulation
- ⚙️ Manual signal override capability
- 📉 Congestion trend visualization (Line + Bar charts)

### Master Admin Portal (`/master-admin`)
- 🔐 Email + Password login for pre-approved admin accounts
- 🔑 Google Sign-In option
- 🚫 Non-admin accounts automatically redirected after 3 seconds
- Admin emails configurable via `NEXT_PUBLIC_ADMIN_EMAILS` env var

### AI Traffic Intelligence
- Simulated traffic density using realistic urban hour-of-day patterns
- Peak hour detection (8–9 AM, 6–8 PM)
- Congestion probability forecasting
- Priority-based signal recommendation system
- Vehicle count simulation (vehiclesIncoming, vehiclesWaiting, vehiclesPassed)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript 5 |
| Authentication | Firebase Auth (Google Sign-In + Email/Password) |
| Maps | Leaflet.js 1.9 + OpenStreetMap (free, no API key) |
| Routing Engine | OSRM (Open Source Routing Machine) — free |
| Geocoding | Nominatim (OpenStreetMap) — free |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Database (Optional) | Supabase (PostgreSQL) |
| Deployment | Vercel (Mumbai region) |
| Package Manager | pnpm / npm |

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
│   ├── master-admin/               # Master admin portal (/master-admin)
│   └── layout.tsx                  # Root layout with AuthProvider
├── components/
│   ├── dashboard/
│   │   ├── traffic-map.tsx         # Leaflet map wrapper
│   │   ├── traffic-map-inner.tsx   # Leaflet map with car navigation marker
│   │   ├── traffic-signals.tsx     # Signal visualization
│   │   ├── traffic-analytics.tsx   # Charts & analytics
│   │   ├── ai-recommendations.tsx  # AI suggestion panel
│   │   ├── citizen-dashboard.tsx   # Full citizen view + India-wide routing
│   │   ├── admin-dashboard.tsx     # Full admin view
│   │   └── nav.tsx                 # Navigation with Firebase auth
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── firebase/
│   │   ├── config.ts               # Firebase lazy initialization
│   │   ├── auth.ts                 # Auth helper functions
│   │   └── auth-context.tsx        # React auth context
│   ├── supabase/                   # Optional Supabase integration
│   ├── mock-data.ts                # AI-simulated traffic data (Lucknow)
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
- pnpm 8+ (or npm)
- Firebase account

### 1. Clone and Install

```bash
git clone https://github.com/sayonmitra-code/drishti-ai.git
cd drishti-ai
pnpm install
# or: npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase keys (see [Environment Variables](#-environment-variables)).

### 3. Run Development Server

```bash
pnpm run dev
# or: npm run dev
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
| `NEXT_PUBLIC_ADMIN_EMAILS` | ❌ | Comma-separated admin emails (defaults to `admin@city.gov,traffic.control@city.gov`) |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase URL (optional, uses mock data if absent) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase Anon Key (optional) |

> **Note:** Google Maps API key is **NOT required**. The platform uses Leaflet.js + OpenStreetMap (100% free).
>
> If Supabase env vars are not set, the platform automatically uses AI-simulated mock data. The platform is fully functional without Supabase.

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Sign-in methods → Enable:
   - **Email/Password**
   - **Google**
4. Go to **Project Settings** → **General** → **Your apps** → Add Web App
5. Copy the config values to your `.env.local`

### Admin Access

Admin accounts are managed via email allowlist:
- Default admin emails: `admin@city.gov`, `traffic.control@city.gov`
- To add custom admin emails: set `NEXT_PUBLIC_ADMIN_EMAILS=email1@domain.com,email2@domain.com`
- Admin panel available at: `/master-admin` (Email/Password + Google Sign-In)

---

## 🗺️ Navigation System

The platform uses **100% free** navigation services:

- **Geocoding**: Nominatim (OpenStreetMap) — converts place names to coordinates
- **Routing**: OSRM (Open Source Routing Machine) — calculates driving routes
- **Maps**: Leaflet.js + OpenStreetMap tiles — renders interactive maps

### Supported Routes
Any source → destination within India, for example:
- Lucknow → Chandigarh University Unnao Campus
- Lucknow → Goa
- Lucknow → Kolkata
- Virajkhand → Hazratganj

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
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

---

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system architecture, data flow diagrams, and component hierarchy.

---

## 👥 Team

Built for Smart India Hackathon — AI Smart City Track
