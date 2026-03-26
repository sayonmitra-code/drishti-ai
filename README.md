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

The platform operates in two phases:
- **Phase 1 (Citizen Mode)** — Public-facing interface at `/`, no login required; light theme
- **Phase 2 (Official Control Mode)** — Authenticated command center at `/dashboard`; dark theme

Core integrations:
- **Real-time traffic visualization** via Leaflet.js + OpenStreetMap (100% free, no API key required)
- **Firebase Authentication** for secure official access (Google Sign-In + Email/Password)
- **AI-driven traffic analytics** and congestion prediction
- **India-wide routing** using OSRM + Nominatim geocoding
- **GPS Live Location** via browser `navigator.geolocation`
- **Default city: Lucknow, India** (26.8467°N, 80.9462°E)

---

## 🖥️ Platform Overview

| Phase | Route | Audience | Description |
|-------|-------|----------|-------------|
| **Phase 1 — Citizen Mode** | `/` | Public (no login) | Full-screen navigation map, GPS tracking, auto alert banners, India-wide routing |
| **Phase 2 — Official Control** | `/dashboard` | Authenticated officials | Traffic Command Center with 5 admin modules |
| **Login** | `/auth/login` | Officials | Firebase Auth → redirects to `/dashboard` |

### Dashboard Admin Modules (Phase 2)

| Module | Description |
|--------|-------------|
| **Traffic Command** | Global AI/Manual mode toggle + per-intersection signal controls |
| **VIP Movement** | Corridor activation with OSRM routing and citizen alert broadcast |
| **Emergency Mgmt** | Ambulance / Fire Brigade / Police green corridor with red cross-traffic |
| **Analytics** | Metric cards + hourly traffic Recharts charts |
| **System Logs** | Timestamped, color-coded event log of all control actions |

---

## ✨ Features

### Phase 1 — Citizen Mode (No Login Required)

- 🗺️ **Full-screen Navigation Map** — map expands to full viewport once a route is found; floating navigation panel overlaid
- 📍 **Free GPS Live Location** — `navigator.geolocation.watchPosition()` button in navigation panel; car marker follows user's real GPS position with auto-pan
- 🛣️ India-wide source → destination routing (Lucknow → Goa, Lucknow → Kolkata, etc.)
- 🚗 **Animated Car Marker** — moves along the green (#16A34A) route polyline
- 🔴🟡🟢 **Traffic Congestion Markers** — colored circles at key intersections
- 🔔 **Auto Alert Banners** — automatic cycling alerts (no toggle needed):
  - VIP movement active notices
  - Emergency vehicle corridor notices
  - Heavy congestion warnings
  - Accident reports
  - Road closures
- ☀️ **Light Theme** — white background, purple brand (#7C3AED), green navigation (#16A34A)
- 📱 Mobile-responsive UI

### Phase 2 — Official Control Mode (Login Required)

#### Traffic Command
- 🕹️ **Global Mode Toggle** — prominent AI MODE vs MANUAL MODE buttons
- ⚙️ Per-intersection manual signal override
- 🤖 AI-based signal timing recommendations

#### VIP Movement
- 👑 Enter from/to locations → auto-calculates OSRM route
- 🟣 Purple (#7C3AED) pulsing polyline with crown icon markers on the map
- 📢 Citizen alert preview broadcast when corridor is activated

#### Emergency Vehicle System
- 🚑 Three types: **Ambulance / Fire Brigade / Police**
- 🔴 Red flashing polyline on the map for the emergency corridor
- 🚦 Cross-traffic signals set to RED automatically
- ✅ Green corridor cleared for emergency vehicle passage

#### Analytics
- 📊 Metric cards (total vehicles, avg wait time, incidents, AI efficiency)
- 📈 Hourly traffic charts (Recharts line + bar)

#### System Logs
- 📋 All control actions logged automatically with timestamps
- 🎨 Color-coded by type: AI decisions, manual overrides, VIP activations, emergency activations, mode switches

### Map Enhancements

- 🔵 **GPS Marker** — blue pulsing circle at user's real GPS location
- 🟣 **VIP Route** — purple pulsing polyline with crown icon markers
- 🔴 **Emergency Route** — red flashing polyline
- 🟢 **Navigation Route** — green (#16A34A) polyline
- 📌 **Alert Markers** — colored markers for accidents, congestion, VIP, and emergency events

### AI Traffic Intelligence

- Simulated traffic density using realistic urban hour-of-day patterns
- Peak hour detection (8–9 AM, 6–8 PM)
- Congestion probability forecasting
- Priority-based signal recommendation system
- Vehicle count simulation (vehiclesIncoming, vehiclesWaiting, vehiclesPassed)

---

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
│   │   ├── login/                  # Firebase login page → redirects to /dashboard
│   │   └── sign-up/                # Firebase registration
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth-protected layout
│   │   └── page.tsx                # Official Control Center (Phase 2)
│   ├── page.tsx                    # Citizen Interface (Phase 1, no login)
│   └── layout.tsx                  # Root layout with AuthProvider
├── components/
│   ├── dashboard/
│   │   ├── traffic-map.tsx         # Leaflet map wrapper
│   │   ├── traffic-map-inner.tsx   # Leaflet map: car marker, GPS, VIP/Emergency routes
│   │   ├── traffic-signals.tsx     # Signal visualization
│   │   ├── traffic-analytics.tsx   # Charts & analytics
│   │   ├── ai-recommendations.tsx  # AI suggestion panel
│   │   ├── citizen-dashboard.tsx   # Phase 1: full-screen map + GPS + auto alerts
│   │   ├── admin-dashboard.tsx     # Phase 2: 5-module command center
│   │   └── nav.tsx                 # Sidebar: Traffic Command, VIP, Emergency, Analytics, Logs
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

Official accounts authenticate via Firebase and are redirected to `/dashboard` (Traffic Command Center). Admin emails are managed via the `NEXT_PUBLIC_ADMIN_EMAILS` environment variable:
- Default admin emails: `admin@city.gov`, `traffic.control@city.gov`
- To add custom admin emails: set `NEXT_PUBLIC_ADMIN_EMAILS=email1@domain.com,email2@domain.com`

---

## 🗺️ Navigation System

The platform uses **100% free** navigation services:

- **Geocoding**: Nominatim (OpenStreetMap) — converts place names to coordinates
- **Routing**: OSRM (Open Source Routing Machine) — calculates driving routes for citizen nav, VIP corridors, and emergency routing
- **Maps**: Leaflet.js + OpenStreetMap tiles — renders interactive maps
- **GPS**: Browser `navigator.geolocation.watchPosition()` — free, no API key required

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
