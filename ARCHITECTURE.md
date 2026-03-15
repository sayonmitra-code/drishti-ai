# DRISHTI — System Architecture Document

> AI Smart Traffic Intelligence Platform — Technical Architecture

---

## 1. System Overview

DRISHTI is a full-stack Next.js application deployed on Vercel's edge network. It follows a modern **client-server hybrid architecture** using Next.js 16's App Router with both Server Components (for initial data fetching) and Client Components (for real-time interactivity).

```
┌────────────────────────────────────────────────────────────────┐
│                    DRISHTI PLATFORM                            │
│                                                                │
│  ┌─────────────────────┐    ┌──────────────────────────────┐  │
│  │  CITIZEN DASHBOARD  │    │  TRAFFIC CONTROL CENTER      │  │
│  │  (Public Facing)    │    │  (Admin Panel)               │  │
│  │                     │    │                              │  │
│  │ • Route Planning    │    │ • Intersection Monitoring    │  │
│  │ • Traffic Map       │    │ • Signal Management          │  │
│  │ • AI Alerts         │    │ • Analytics Dashboard        │  │
│  │ • Signal Status     │    │ • AI Recommendations         │  │
│  └─────────────────────┘    └──────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
     ┌──────────┐  ┌────────────┐  ┌──────────────┐
     │ Firebase │  │ Google Maps│  │  Supabase    │
     │   Auth   │  │  Platform  │  │  (Optional)  │
     └──────────┘  └────────────┘  └──────────────┘
```

---

## 2. Technology Architecture

### 2.1 Frontend Layer

```
Next.js 16 App Router (Turbopack)
├── Server Components (RSC)     → Initial data fetch, SEO, layout
├── Client Components           → Interactivity, Firebase auth, maps
├── API Routes (Route Handlers) → Backend API endpoints
└── Proxy Middleware            → Route protection, redirects
```

### 2.2 Authentication Layer

```
Firebase Authentication
├── Email/Password Login
├── Google OAuth Sign-in
├── Auth State Management (AuthContext)
└── Client-side Session Persistence

Flow:
User → Login Page → Firebase Auth → JWT Token
→ AuthContext updates → Dashboard unlocked
```

### 2.3 Data Layer

```
Data Sources (Priority Order):
1. Supabase PostgreSQL (if configured)
   └── Real intersection data, vehicle counts, signals
2. Mock Data (lib/mock-data.ts)
   └── AI-simulated Bengaluru traffic data
   └── Hourly pattern generation
   └── Peak hour detection
```

### 2.4 Maps Layer

```
Google Maps JavaScript API
├── Dark-themed map tiles
├── Traffic Layer (real-time)
├── Intersection Markers (colored by congestion)
├── Info Windows (name + congestion status)
└── Fallback UI (when API key not configured)
```

---

## 3. Folder Structure Explained

```
drishti-ai/
├── app/                            # Next.js App Router
│   ├── api/                        # API Route Handlers (Server)
│   │   ├── analytics/              # GET /api/analytics
│   │   │   └── route.ts            # Hourly traffic volume data
│   │   ├── intersections/[id]/     # Dynamic route per intersection
│   │   │   └── data/route.ts       # GET signals + vehicle counts
│   │   ├── recommendations/        # AI recommendation routes
│   │   │   ├── route.ts            # GET recommendations list
│   │   │   └── update/route.ts     # POST update status
│   │   ├── routes/optimize/        # GET route optimization
│   │   │   └── route.ts
│   │   ├── signals/                # Signal management
│   │   │   ├── update/route.ts     # POST manual override
│   │   │   └── emergency/route.ts  # POST emergency corridor
│   │   └── traffic/predict/        # GET 24h predictions
│   │       └── route.ts
│   │
│   ├── auth/                       # Authentication Pages
│   │   ├── login/page.tsx          # Firebase login + Google OAuth
│   │   ├── sign-up/page.tsx        # Firebase registration
│   │   └── sign-up-success/page.tsx
│   │
│   ├── dashboard/                  # Protected Dashboard Area
│   │   ├── layout.tsx              # Firebase auth check (client)
│   │   ├── page.tsx                # Citizen Dashboard
│   │   └── admin/page.tsx          # Traffic Control Center
│   │
│   ├── layout.tsx                  # Root layout + AuthProvider
│   └── globals.css                 # Global styles + Tailwind
│
├── components/
│   ├── dashboard/
│   │   ├── citizen-dashboard.tsx   # Main citizen interface
│   │   ├── admin-dashboard.tsx     # Admin control panel
│   │   ├── traffic-map.tsx         # Google Maps integration
│   │   ├── traffic-signals.tsx     # Signal cards with countdown
│   │   ├── traffic-analytics.tsx   # Recharts line + bar charts
│   │   ├── ai-recommendations.tsx  # AI suggestion panel
│   │   └── nav.tsx                 # Navigation (Firebase logout)
│   └── ui/                         # shadcn/ui component library
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts               # Lazy Firebase initialization
│   │   ├── auth.ts                 # Auth functions (lazy imports)
│   │   └── auth-context.tsx        # React context + hook
│   ├── supabase/                   # Optional database layer
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server Supabase client
│   ├── mock-data.ts                # AI-simulated traffic data
│   └── db.ts                       # Database query helpers
│
├── proxy.ts                        # Next.js 16 middleware proxy
├── vercel.json                     # Vercel deployment config
├── .env.example                    # Environment template
└── package.json                    # Dependencies + scripts
```

---

## 4. Data Flow Diagrams

### 4.1 Authentication Flow

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User   │────▶│  Login Page  │────▶│  Firebase    │────▶│Dashboard │
│         │     │              │     │  Auth API    │     │          │
│         │     │ Email/Google │     │              │     │          │
└─────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │ AuthContext  │
                                     │ (React)      │
                                     │ user state   │
                                     └──────────────┘
```

### 4.2 Traffic Data Flow

```
┌──────────────────┐          ┌─────────────────┐
│  Dashboard Page  │          │   API Routes    │
│  (Server RSC)    │─────────▶│  /api/analytics │
│                  │          │  /api/signals   │
│  Passes mock     │          │  /api/recommend │
│  data as props   │          └────────┬────────┘
└──────────────────┘                   │
         │                             ▼
         ▼                    ┌────────────────┐
┌────────────────┐            │  Data Source   │
│  Client        │            │                │
│  Components    │            │  Supabase DB   │
│                │            │     OR         │
│  useEffect     │            │  Mock Data     │
│  fetch API     │◀───────────│  (lib/mock-    │
└────────────────┘            │   data.ts)     │
                              └────────────────┘
```

### 4.3 Google Maps Integration

```
┌──────────────────────────────────────────────────────┐
│  TrafficMap Component (Client)                       │
│                                                      │
│  1. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY            │
│     ├── Missing → Show Fallback UI with intersection │
│     │            buttons (functional for demo)       │
│     └── Present → Load Maps JS API dynamically      │
│                                                      │
│  2. Initialize Google Map (dark theme)               │
│  3. Attach TrafficLayer                              │
│  4. Place intersection markers (colored by           │
│     congestion: 🟢 low / 🟡 medium / 🔴 high)       │
│  5. Add click handlers → info windows + selection    │
└──────────────────────────────────────────────────────┘
```

---

## 5. Component Hierarchy

```
app/layout.tsx (Server)
└── AuthProvider (Client — Firebase context)
    └── app/dashboard/layout.tsx (Client — auth guard)
        └── DashboardNav (Client — Firebase logout)
        └── Page Content
            ├── CitizenDashboard (Client)
            │   ├── TrafficMap (Client — Google Maps)
            │   ├── TrafficSignals (Client — signal cards)
            │   ├── TrafficAnalytics (Client — Recharts)
            │   └── AIRecommendations (Client — AI panel)
            └── AdminDashboard (Client)
                ├── TrafficMap (Client — same component)
                ├── TrafficSignals (Client — override mode)
                ├── TrafficAnalytics (Client — admin view)
                └── AIRecommendations (Client — implement mode)
```

---

## 6. AI Traffic Intelligence Module

The AI module (`lib/mock-data.ts`) simulates realistic urban traffic patterns:

### 6.1 Traffic Pattern Algorithm

```typescript
// Hour-of-day multipliers based on real urban traffic research
const patterns = {
  0: 0.05,  // Midnight — minimal
  7: 0.75,  // Morning peak building
  8: 0.95,  // Peak morning rush
  18: 1.00, // Evening peak (maximum)
  22: 0.35, // Late evening
  23: 0.15  // Night
}

// Add ±5% random noise for realism
vehicles = baseVehicles × (multiplier + randomNoise(±0.05))
```

### 6.2 Congestion Level Classification

| Level | Vehicle Count (as % of capacity) | Signal Strategy |
|-------|-----------------------------------|-----------------|
| 🟢 Low | < 33% | Normal timing |
| 🟡 Medium | 33–66% | Extended green |
| 🔴 High | > 66% | Adaptive control |

### 6.3 AI Recommendation Types

1. **Signal Timing** — Optimal green/red duration based on queue length
2. **Congestion Prediction** — ML-style probability forecasting  
3. **Route Diversion** — Alternative route suggestions

---

## 7. API Design

| Endpoint | Method | Description | Data Source |
|----------|--------|-------------|-------------|
| `/api/analytics` | GET | Hourly traffic volume | Supabase → Mock |
| `/api/traffic/predict` | GET | 24h congestion forecast | Analytics → Mock |
| `/api/intersections/[id]/data` | GET | Signals + vehicle counts | Supabase → Mock |
| `/api/recommendations` | GET | AI recommendations list | Supabase → Mock |
| `/api/recommendations/update` | POST | Update recommendation status | Supabase → Mock |
| `/api/signals/update` | POST | Manual signal override | Supabase → Mock |
| `/api/signals/emergency` | POST | Emergency corridor mode | Supabase → Mock |
| `/api/routes/optimize` | GET | Route optimization | External API |

### Graceful Degradation Pattern

All API routes follow this pattern for resilience:
```typescript
// 1. Check if Supabase is configured
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  return NextResponse.json({ data: getMockData(id) })
}
// 2. Try Supabase
try {
  const data = await supabase.from('table').select('*')
  return NextResponse.json({ data })
} catch {
  // 3. Fall back to mock data
  return NextResponse.json({ data: getMockData(id) })
}
```

---

## 8. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | Firebase JWT tokens |
| Route Protection | Client-side auth check in dashboard layout |
| API Protection | Server-side auth verification (when Supabase is active) |
| Environment Secrets | Never exposed in client bundle (`NEXT_PUBLIC_` prefix only for public keys) |
| XSS Prevention | React's default escaping |
| HTTPS | Vercel enforced HTTPS |

---

## 9. Performance Optimizations

- **Turbopack** — 5x faster builds than Webpack
- **App Router** — Automatic code splitting per route
- **Static Generation** — Auth pages pre-rendered (`○`) for CDN caching
- **Dynamic Routes** — Dashboard renders on demand (`ƒ`) for fresh data
- **Lazy Firebase Initialization** — Firebase SDK loads only on client, never during SSR
- **Lazy Google Maps** — Maps API loads only when API key is available
- **Mock Data Fallback** — Zero database latency for demo mode

---

## 10. Deployment Architecture

```
Developer
    │
    ▼ git push
GitHub Repository
    │
    ▼ auto-deploy
Vercel Edge Network
    ├── Static Assets → CDN (global)
    ├── Server Functions → bom1 (Mumbai) region
    └── HTTPS + Custom Domain
            │
            ├──▶ Firebase Auth (Google Cloud)
            ├──▶ Google Maps Platform
            └──▶ Supabase (optional)
```

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",  
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

The `bom1` (Mumbai) region minimizes latency for Indian users — the target audience for a smart Indian city platform.
