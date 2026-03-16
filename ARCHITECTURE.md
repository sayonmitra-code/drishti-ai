# DRISHTI — System Architecture Document

> AI Smart Traffic Intelligence Platform — Technical Architecture

---

## 1. System Overview

DRISHTI is a full-stack Next.js application deployed on Vercel's edge network. It follows a modern **client-server hybrid architecture** using Next.js 16's App Router with both Server Components (for initial data fetching) and Client Components (for real-time interactivity).

The platform is split into two distinct operational phases:

```
┌───────────────────────────────────────────────────────────────────┐
│                      DRISHTI PLATFORM                             │
│                                                                   │
│  ┌────────────────────────┐    ┌─────────────────────────────┐   │
│  │  PHASE 1 — CITIZEN     │    │  PHASE 2 — OFFICIAL CONTROL │   │
│  │  Route: /              │    │  Route: /dashboard          │   │
│  │  Auth: NOT required    │    │  Auth: Firebase required    │   │
│  │  Theme: Light          │    │  Theme: Dark                │   │
│  │                        │    │                             │   │
│  │ • Full-screen map      │    │ • Traffic Command           │   │
│  │ • GPS live location    │    │ • VIP Movement              │   │
│  │ • India-wide routing   │    │ • Emergency Mgmt            │   │
│  │ • Auto alert banners   │    │ • Analytics                 │   │
│  │ • Congestion markers   │    │ • System Logs               │   │
│  └────────────────────────┘    └─────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┼──────────────┐
            ▼             ▼              ▼
     ┌──────────┐  ┌────────────────┐  ┌──────────────┐
     │ Firebase │  │ Leaflet.js +   │  │  Supabase    │
     │   Auth   │  │ OpenStreetMap  │  │  (Optional)  │
     └──────────┘  └────────────────┘  └──────────────┘
```

---

## 2. Technology Architecture

### 2.1 Frontend Layer

```
Next.js 16 App Router (Turbopack)
├── Server Components (RSC)     → Initial data fetch, SEO, layout
├── Client Components           → Interactivity, Firebase auth, maps, GPS
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
User → /auth/login → Firebase Auth → JWT Token
→ AuthContext updates → Redirect to /dashboard
```

### 2.3 Data Layer

```
Data Sources (Priority Order):
1. Supabase PostgreSQL (if configured)
   └── Real intersection data, vehicle counts, signals
2. Mock Data (lib/mock-data.ts)
   └── AI-simulated Lucknow traffic data
   └── Hourly pattern generation
   └── Peak hour detection
```

### 2.4 Maps & Navigation Layer

```
Leaflet.js + OpenStreetMap (free, no API key required)
├── Default center: Lucknow, India (26.8467°N, 80.9462°E)
├── OpenStreetMap tile layer
├── Intersection markers (colored by congestion level)
├── Route polyline — green (#16A34A) for citizen navigation
├── VIP route polyline — purple (#7C3AED) pulsing
├── Emergency route polyline — red flashing
├── GPS marker — blue pulsing circle at user's live location
├── Animated car marker for navigation mode
├── Alert markers — accidents, congestion, VIP, emergency
└── Congestion heatmap circles (high-congestion zones)

Geocoding: Nominatim (OpenStreetMap)
├── India-wide place name resolution
├── Fallback search (global) for unresolved places
└── Used for citizen routing AND VIP/emergency corridors

Routing: OSRM (Open Source Routing Machine)
├── Citizen navigation route calculation
├── VIP corridor route calculation
├── Emergency vehicle corridor route calculation
├── Full route geometry (polyline coordinates)
└── Distance and duration estimates
```

---

## 3. Phase Architecture

### 3.1 Phase 1 — Citizen Mode

```
User visits /
       │
       ▼
CitizenDashboard (Client Component — no auth check)
       │
       ├── Full-screen Leaflet Map
       │     ├── Congestion markers (green/yellow/red circles)
       │     ├── Alert markers (accidents, road closures)
       │     ├── Navigation route polyline (green) + car marker
       │     └── GPS blue pulsing marker
       │
       ├── Floating Navigation Panel (overlaid on map after route found)
       │     ├── Source / Destination inputs → Nominatim geocoding
       │     ├── Get Route → OSRM routing → green polyline
       │     └── GPS button → watchPosition() → car marker follows user
       │
       └── Auto Alert Banner (cycles automatically)
             ├── VIP movement active
             ├── Emergency vehicle corridor
             ├── Heavy congestion
             ├── Accident report
             └── Road closure
```

### 3.2 Phase 2 — Official Control Mode

```
User visits /auth/login → Firebase Auth → /dashboard
       │
       ▼
AdminDashboard (Client Component — auth required)
       │
       ├── Tab: Traffic Command
       │     ├── Global Mode Toggle (AI MODE / MANUAL MODE)
       │     └── Per-intersection signal override controls
       │
       ├── Tab: VIP Movement
       │     ├── From / To inputs → OSRM route
       │     ├── Map shows purple pulsing polyline + crown markers
       │     ├── Citizen alert preview
       │     └── Event logged to System Logs
       │
       ├── Tab: Emergency Mgmt
       │     ├── Emergency type selector (Ambulance / Fire / Police)
       │     ├── From / To inputs → OSRM route
       │     ├── Map shows red flashing polyline
       │     ├── Cross-traffic signals → RED
       │     └── Event logged to System Logs
       │
       ├── Tab: Analytics
       │     ├── Metric cards (vehicles, wait time, incidents, AI efficiency)
       │     └── Hourly traffic Recharts charts
       │
       └── Tab: System Logs
             └── Color-coded timestamped log of all control actions
```

---

## 4. GPS Integration Architecture

```
Browser navigator.geolocation.watchPosition()
       │
       ▼ coords (latitude, longitude)
TrafficMapInner (Client Component)
       │
       ├── Blue pulsing circle marker placed at GPS coords
       ├── Map auto-pans to follow user (setView)
       └── Car marker (navigation mode) updates to GPS position

Permissions model:
  User clicks "GPS" button → browser prompts for location permission
  On grant → watchPosition starts → continuous updates
  On deny → graceful no-op (button ignored)

Cost: Free — uses browser Geolocation API, no third-party service
```

---

## 5. VIP Corridor System Architecture

```
Official enters From / To locations
       │
       ▼
Nominatim geocoding → coordinates
       │
       ▼
OSRM /route/v1/driving/{lng1},{lat1};{lng2},{lat2}
       │
       ▼
Route geometry (polyline coordinates)
       │
       ├── Map layer: purple (#7C3AED) pulsing polyline
       ├── Crown icon markers at waypoints
       ├── Citizen alert banner: "VIP Movement Active — [route]"
       └── System Log entry: "VIP corridor activated: [from] → [to]"
```

---

## 6. Emergency Vehicle Routing Architecture

```
Official selects emergency type + From / To
       │
       ▼
Nominatim geocoding → coordinates
       │
       ▼
OSRM route → emergency corridor geometry
       │
       ├── Map layer: red flashing polyline
       ├── Intersections on corridor: signals → GREEN for emergency vehicle
       ├── Cross-traffic signals on corridor: signals → RED
       ├── Citizen alert banner: "[Type] Emergency Corridor Active"
       └── System Log entry: "[Ambulance/Fire/Police] emergency: [from] → [to]"

Emergency types:
  🚑 Ambulance  — medical emergency
  🚒 Fire Brigade — fire/hazard
  🚓 Police     — law enforcement
```

---

## 7. System Logs Architecture

```
Any control action in Phase 2
       │
       ▼
addLogEntry(type, message)
       │
       ▼
logs[] state array (React useState)
       │
       ├── Stored in component state (session-scoped)
       ├── Displayed in System Logs tab with timestamp
       └── Color-coded by type:
             🔵 ai       — AI mode decisions
             🟡 override — manual signal overrides
             🟣 vip      — VIP corridor events
             🔴 emergency — emergency activations
             ⚪ system   — mode switches, general events

Logged events:
  • Global mode switched (AI ↔ Manual)
  • Signal manually overridden at intersection [X]
  • VIP corridor activated: [from] → [to]
  • Emergency ([type]) corridor activated: [from] → [to]
  • AI recommendation applied at intersection [X]
```

---

## 8. Full-screen Map Architecture

```
Phase 1 — Two states:

State A (default — no active route):
  ┌─────────────────────────────────────┐
  │  Header + Search Panel              │
  │  Alert Banner (cycling)             │
  │  Map (fixed height, e.g. 400px)     │
  └─────────────────────────────────────┘

State B (route active):
  ┌─────────────────────────────────────┐
  │  Map (100vh, full viewport)         │
  │  ┌─────────────────────────────┐    │
  │  │  Floating Nav Panel         │    │
  │  │  (position: absolute)       │    │
  │  │  Source / Destination       │    │
  │  │  GPS button                 │    │
  │  │  Route info (dist, time)    │    │
  │  └─────────────────────────────┘    │
  │  Alert Banner (floating)            │
  └─────────────────────────────────────┘

Trigger: routeCoords.length > 0 → expand map to full viewport
```

---

## 9. Folder Structure Explained

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
│   ├── dashboard/                  # Protected Dashboard Area (Phase 2)
│   │   ├── layout.tsx              # Firebase auth check (client)
│   │   └── page.tsx                # Official Control Center (5 modules)
│   │
│   ├── page.tsx                    # Citizen Interface (Phase 1, public)
│   ├── layout.tsx                  # Root layout + AuthProvider
│   └── globals.css                 # Global styles + Tailwind
│
├── components/
│   ├── dashboard/
│   │   ├── citizen-dashboard.tsx   # Phase 1: full-screen map, GPS, alerts
│   │   ├── admin-dashboard.tsx     # Phase 2: tabbed command center
│   │   ├── traffic-map.tsx         # Leaflet.js + OpenStreetMap wrapper
│   │   ├── traffic-map-inner.tsx   # Map internals: GPS, VIP, emergency layers
│   │   ├── traffic-signals.tsx     # Signal cards with countdown
│   │   ├── traffic-analytics.tsx   # Recharts line + bar charts
│   │   ├── ai-recommendations.tsx  # AI suggestion panel
│   │   └── nav.tsx                 # Sidebar (Traffic Command, VIP, Emergency,
│   │                               #          Analytics, System Logs, Citizen View)
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

## 10. Data Flow Diagrams

### 10.1 Authentication Flow

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  User   │────▶│ /auth/login  │────▶│  Firebase    │────▶│/dashboard  │
│         │     │              │     │  Auth API    │     │(Phase 2)   │
│         │     │ Email/Google │     │              │     │            │
└─────────┘     └──────────────┘     └──────────────┘     └────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │ AuthContext  │
                                     │ (React)      │
                                     │ user state   │
                                     └──────────────┘
```

### 10.2 Traffic Data Flow

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

### 10.3 Leaflet.js + OpenStreetMap Integration

```
TrafficMapInner Component (Client)
       │
       ├── Initialize Leaflet map (OpenStreetMap tiles)
       ├── Place congestion markers (green/yellow/red by level)
       ├── Render citizen route polyline (green #16A34A)
       ├── Render VIP route polyline (purple #7C3AED, pulsing)
       ├── Render emergency route polyline (red, flashing)
       ├── Place GPS marker (blue pulsing circle) at watchPosition coords
       └── Auto-pan map when GPS coords update
```

---

## 11. Component Hierarchy

```
app/layout.tsx (Server)
└── AuthProvider (Client — Firebase context)
    ├── app/page.tsx → CitizenDashboard (Phase 1 — no auth)
    │   ├── TrafficMap (Client — Leaflet.js, congestion markers, GPS)
    │   ├── FloatingNavPanel (source/destination inputs, GPS button)
    │   └── AutoAlertBanner (cycles VIP/emergency/congestion/accident/closure)
    │
    └── app/dashboard/layout.tsx (Client — auth guard)
        └── DashboardNav (sidebar: Traffic Command, VIP, Emergency,
        │                          Analytics, System Logs, Citizen View)
        └── app/dashboard/page.tsx → AdminDashboard (Phase 2)
            ├── Tab: TrafficCommand
            │   ├── GlobalModeToggle (AI MODE / MANUAL MODE)
            │   └── IntersectionControls (per-junction overrides)
            ├── Tab: VIPMovement
            │   ├── CorridorInputs (from/to + activate button)
            │   └── TrafficMap (purple VIP polyline + crown markers)
            ├── Tab: EmergencyMgmt
            │   ├── EmergencyTypeSelector (Ambulance/Fire/Police)
            │   ├── CorridorInputs (from/to + activate button)
            │   └── TrafficMap (red emergency polyline)
            ├── Tab: Analytics
            │   ├── MetricCards
            │   └── TrafficAnalytics (Recharts)
            └── Tab: SystemLogs
                └── LogList (color-coded timestamped entries)
```

---

## 12. AI Traffic Intelligence Module

The AI module (`lib/mock-data.ts`) simulates realistic urban traffic patterns:

### 12.1 Traffic Pattern Algorithm

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

### 12.2 Congestion Level Classification

| Level | Vehicle Count (as % of capacity) | Signal Strategy |
|-------|-----------------------------------|-----------------|
| 🟢 Low | < 33% | Normal timing |
| 🟡 Medium | 33–66% | Extended green |
| 🔴 High | > 66% | Adaptive control |

### 12.3 AI Recommendation Types

1. **Signal Timing** — Optimal green/red duration based on queue length
2. **Congestion Prediction** — ML-style probability forecasting
3. **Route Diversion** — Alternative route suggestions

---

## 13. API Design

| Endpoint | Method | Description | Data Source |
|----------|--------|-------------|-------------|
| `/api/analytics` | GET | Hourly traffic volume | Supabase → Mock |
| `/api/traffic/predict` | GET | 24h congestion forecast | Analytics → Mock |
| `/api/intersections/[id]/data` | GET | Signals + vehicle counts | Supabase → Mock |
| `/api/recommendations` | GET | AI recommendations list | Supabase → Mock |
| `/api/recommendations/update` | POST | Update recommendation status | Supabase → Mock |
| `/api/signals/update` | POST | Manual signal override | Supabase → Mock |
| `/api/signals/emergency` | POST | Emergency corridor mode | Supabase → Mock |
| `/api/routes/optimize` | GET | Route optimization | OSRM (external) |

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

## 14. Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | Firebase JWT tokens |
| Route Protection | Client-side auth check in `/dashboard` layout |
| Public Route | `/` (Phase 1) intentionally unauthenticated |
| API Protection | Server-side auth verification (when Supabase is active) |
| Environment Secrets | Never exposed in client bundle (`NEXT_PUBLIC_` prefix only for public keys) |
| XSS Prevention | React's default escaping |
| HTTPS | Vercel enforced HTTPS |

---

## 15. Performance Optimizations

- **Turbopack** — 5x faster builds than Webpack
- **App Router** — Automatic code splitting per route
- **Static Generation** — Auth pages pre-rendered (`○`) for CDN caching
- **Dynamic Routes** — Dashboard renders on demand (`ƒ`) for fresh data
- **Lazy Firebase Initialization** — Firebase SDK loads only on client, never during SSR
- **Lazy Leaflet Loading** — Maps load only in browser (no SSR)
- **GPS Efficiency** — `watchPosition` runs only when GPS button is active
- **Mock Data Fallback** — Zero database latency for demo mode

---

## 16. Deployment Architecture

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
            ├──▶ OpenStreetMap + OSRM + Nominatim
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
