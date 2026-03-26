'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

export interface RouteCoords {
  coordinates: [number, number][] // [lat, lng] pairs
  distance: number // meters
  duration: number // seconds
  steps: { instruction: string; distance: number }[]
  navActive?: boolean // whether navigation mode is active (shows car marker)
}

export interface MapAlert {
  position: [number, number]
  type: 'accident' | 'congestion' | 'vip' | 'emergency'
  message: string
}

// Internal type for digital twin vehicles
interface SimVehicle {
  id: number
  fromIdx: number
  toIdx: number
  progress: number // 0→1
  speed: number
}

// Vehicle speed constants (progress per 200ms tick, i.e., fraction of a road segment traveled)
const SIM_VEHICLE_MIN_SPEED = 0.022   // slowest vehicle
const SIM_VEHICLE_SPEED_VARIANTS = 6  // number of distinct speed steps
const SIM_VEHICLE_SPEED_INCREMENT = 0.009 // increment per speed variant
// Route selection multiplier — distributes vehicles across different next-connections
// by making each vehicle's "turn preference" unique based on its id
const ROUTE_SELECTION_MULTIPLIER = 3
// Default city zoom — level 12 shows all 43 Lucknow intersections within the viewport
const DEFAULT_CITY_ZOOM_LEVEL = 12

// VIP pulse animation constants
const PULSE_CYCLE_STEPS = 20       // number of ticks per full oscillation cycle
const PULSE_AMPLITUDE_FACTOR = 0.35 // fraction of base radius to oscillate by
const BASE_PULSE_RADIUS = 70       // base radius (metres) for VIP pulsing circles

const CONGESTION_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
}

const VEHICLE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

// Deterministic congestion based on intersection id
function getCongestionLevel(id: string): 'low' | 'medium' | 'high' {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  if (hash % 3 === 0) return 'high'
  if (hash % 3 === 1) return 'medium'
  return 'low'
}

// Lucknow road network connections — expanded for 43 localities
const ROAD_CONNECTIONS: [number, number][] = [
  [0, 4],   // Hazratganj → Aminabad
  [0, 7],   // Hazratganj → Kaiserbagh
  [0, 22],  // Hazratganj → Civil Lines
  [0, 23],  // Hazratganj → Dalibagh
  [1, 4],   // Charbagh → Aminabad
  [1, 14],  // Charbagh → Amber Ganj
  [1, 29],  // Charbagh → Lalbagh
  [2, 1],   // Alambagh → Charbagh
  [2, 28],  // Alambagh → Kanpur Road
  [3, 5],   // Gomti Nagar → Indira Nagar
  [3, 39],  // Gomti Nagar → Vibhuti Khand
  [4, 7],   // Aminabad → Kaiserbagh
  [4, 42],  // Aminabad → Wazirganj
  [5, 6],   // Indira Nagar → Aliganj
  [5, 26],  // Indira Nagar → Faizabad Road
  [6, 0],   // Aliganj → Hazratganj
  [6, 17],  // Aliganj → Nirala Nagar
  [7, 30],  // Kaiserbagh → Lalbagh
  [8, 2],   // Aashiana → Alambagh
  [9, 0],   // Adarsh Nagar → Hazratganj
  [10, 5],  // Ahmamau → Indira Nagar
  [11, 2],  // Aishbagh → Alambagh
  [12, 2],  // Amausi → Alambagh
  [13, 1],  // Amber Ganj → Charbagh
  [14, 0],  // Anand Nagar → Hazratganj
  [15, 8],  // Ashiyana → Aashiana
  [16, 0],  // Ashok Marg → Hazratganj
  [17, 6],  // Balaganj → Aliganj
  [18, 2],  // Banthra → Alambagh
  [19, 5],  // Bijnaur → Indira Nagar
  [20, 3],  // Chinhat → Gomti Nagar
  [21, 22], // Civil Lines → Dalibagh
  [24, 3],  // Dilkusha → Gomti Nagar
  [25, 3],  // Faizabad Road → Gomti Nagar
  [26, 3],  // Jankipuram → Gomti Nagar
  [27, 1],  // Kalyanpur → Charbagh
  [28, 2],  // Kanpur Road → Alambagh
  [29, 0],  // Lalbagh → Hazratganj
  [30, 0],  // Cantonment → Hazratganj
  [31, 3],  // Mahanagar → Gomti Nagar
  [32, 0],  // Nirala Nagar → Hazratganj
  [33, 0],  // Nishatganj → Hazratganj
  [34, 1],  // Rajajipuram → Charbagh
  [35, 2],  // Sarojini Nagar → Alambagh
  [36, 2],  // Telibagh → Alambagh
  [37, 1],  // Thakurganj → Charbagh
  [38, 3],  // Triveni Nagar → Gomti Nagar
  [39, 3],  // Vibhuti Khand → Gomti Nagar
  [40, 5],  // Vikas Nagar → Indira Nagar
  [41, 3],  // Vrindavan Yojana → Gomti Nagar
  [42, 4],  // Wazirganj → Aminabad
]

// Initialize simulated vehicles spread across road connections
function initSimVehicles(): SimVehicle[] {
  return Array.from({ length: 48 }, (_, i) => {
    const connIdx = i % ROAD_CONNECTIONS.length
    const [fromIdx, toIdx] = ROAD_CONNECTIONS[connIdx]
    return {
      id: i,
      fromIdx,
      toIdx,
      progress: i / 48, // stagger starting positions along each connection
      speed: SIM_VEHICLE_MIN_SPEED + (i % SIM_VEHICLE_SPEED_VARIANTS) * SIM_VEHICLE_SPEED_INCREMENT,
    }
  })
}

// Digital Traffic Twin — animated vehicles moving along the road network
function DigitalTwinVehicles({ intersections }: { intersections: Intersection[] }) {
  const [vehicles, setVehicles] = useState<SimVehicle[]>(initSimVehicles)

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          let { fromIdx, toIdx, progress } = v
          progress += v.speed

          if (progress >= 1) {
            // Find connected road segments from the current destination
            const nextConns = ROAD_CONNECTIONS.filter(
              ([f, t]) => f === toIdx || t === toIdx
            )
            if (nextConns.length > 0) {
              // Deterministic pick based on vehicle id to avoid re-renders with Math.random
              const pick = nextConns[(v.id * ROUTE_SELECTION_MULTIPLIER + 1) % nextConns.length]
              fromIdx = pick[0] === toIdx ? pick[0] : pick[1]
              toIdx = pick[0] === toIdx ? pick[1] : pick[0]
            } else {
              // No outgoing connections — reverse direction
              const tmp = fromIdx
              fromIdx = toIdx
              toIdx = tmp
            }
            progress = 0
          }

          return { ...v, fromIdx, toIdx, progress }
        })
      )
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {vehicles.map((v) => {
        const from = intersections[v.fromIdx]
        const to = intersections[v.toIdx]
        if (!from || !to) return null

        const fromLat = parseFloat(from.latitude)
        const fromLng = parseFloat(from.longitude)
        const toLat = parseFloat(to.latitude)
        const toLng = parseFloat(to.longitude)

        if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) return null

        const lat = fromLat + (toLat - fromLat) * v.progress
        const lng = fromLng + (toLng - fromLng) * v.progress
        const color = VEHICLE_COLORS[v.id % VEHICLE_COLORS.length]

        return (
          <CircleMarker
            key={`twin-${v.id}`}
            center={[lat, lng]}
            radius={3.5}
            pathOptions={{
              color: '#0f172a',
              weight: 0.8,
              fillColor: color,
              fillOpacity: 0.9,
            }}
          />
        )
      })}
    </>
  )
}

// AI Predictive Heatmap — gradient congestion circles around intersections
function PredictiveHeatmap({ intersections }: { intersections: Intersection[] }) {
  const hour = new Date().getHours()
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 21)

  return (
    <>
      {intersections.map((intersection) => {
        const hash = intersection.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        const base = hash % 3 // 0=low, 1=medium, 2=high
        // Escalate medium→high during peak hours
        const level = isPeak && base === 1 ? 2 : base

        if (level === 0) return null // skip low congestion — nothing to show

        const lat = parseFloat(intersection.latitude)
        const lng = parseFloat(intersection.longitude)
        if (isNaN(lat) || isNaN(lng)) return null

        const color = level === 2 ? '#ef4444' : '#f97316'
        const radius = level === 2 ? 650 : 420
        const opacity = level === 2 ? 0.18 : 0.11

        return (
          <Circle
            key={`hm-${intersection.id}`}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: opacity, weight: 0 }}
          />
        )
      })}
    </>
  )
}

function MapBounds({ intersections, routeCoords }: { intersections: Intersection[]; routeCoords?: RouteCoords }) {
  const map = useMap()
  const prevRoute = useRef<RouteCoords | undefined>(undefined)

  useEffect(() => {
    if (routeCoords && routeCoords.coordinates.length > 0) {
      if (prevRoute.current === routeCoords) return
      prevRoute.current = routeCoords
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(...routeCoords.coordinates.map((c) => c[0])) - 0.005,
          Math.min(...routeCoords.coordinates.map((c) => c[1])) - 0.005,
        ],
        [
          Math.max(...routeCoords.coordinates.map((c) => c[0])) + 0.005,
          Math.max(...routeCoords.coordinates.map((c) => c[1])) + 0.005,
        ],
      ]
      map.fitBounds(bounds, { padding: [30, 30] })
      return
    }

    if (intersections.length === 0) return
    const lats = intersections.map((i) => parseFloat(i.latitude)).filter((v) => !isNaN(v))
    const lngs = intersections.map((i) => parseFloat(i.longitude)).filter((v) => !isNaN(v))
    if (lats.length === 0) return
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
      [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02],
    ]
    map.fitBounds(bounds)
  }, [intersections, routeCoords, map])
  return null
}

// Simulated vehicle counts per signal (refreshed on mount)
const VEHICLE_COUNTS: Record<string, number> = {}
function getVehicleCount(id: string): number {
  if (!(id in VEHICLE_COUNTS)) {
    VEHICLE_COUNTS[id] = Math.floor(Math.random() * 120 + 20)
  }
  return VEHICLE_COUNTS[id]
}

// ─── Icon singletons (created once at module level; Leaflet is client-only) ──────

// Crown icon for VIP route endpoints
let CROWN_ICON: L.DivIcon | null = null
function getCrownIcon(): L.DivIcon {
  if (!CROWN_ICON) {
    CROWN_ICON = L.divIcon({
      html: `<div style="font-size:20px;text-shadow:0 1px 4px rgba(0,0,0,0.6);line-height:1;">👑</div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }
  return CROWN_ICON
}

// GPS marker icon
let GPS_ICON: L.DivIcon | null = null
function getGpsIcon(): L.DivIcon {
  if (!GPS_ICON) {
    GPS_ICON = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 8px rgba(59,130,246,0.2);animation:gpsPulse 1.5s ease-in-out infinite;"></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }
  return GPS_ICON
}

// Car marker icon for navigation mode — created once at module level (Leaflet is client-only)
let CAR_ICON: L.DivIcon | null = null
function getCarIcon(): L.DivIcon {
  if (!CAR_ICON) {
    CAR_ICON = L.divIcon({
      html: `<div style="
        width:32px;height:32px;
        background:linear-gradient(135deg,#3b82f6,#1d4ed8);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 2px 8px rgba(59,130,246,0.6);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg viewBox="0 0 24 24" width="16" height="16" style="transform:rotate(45deg);fill:white;">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
          <circle cx="7.5" cy="16.5" r="1.5"/>
          <circle cx="16.5" cy="16.5" r="1.5"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }
  return CAR_ICON
}

// Animated car marker that moves along the route
function CarNavigationMarker({ routeCoords }: { routeCoords: RouteCoords }) {
  const [posIndex, setPosIndex] = useState(0)
  // Track the coordinates array reference separately so position is only reset
  // when the actual route changes, not when navActive flag toggles or the
  // parent re-renders and creates a new wrapper object.
  const prevCoordsRef = useRef<[number, number][] | null>(null)

  const coords = routeCoords.coordinates
  const navActive = routeCoords.navActive

  useEffect(() => {
    if (!navActive || coords.length === 0) return

    // Reset position only when a new route is loaded
    if (prevCoordsRef.current !== coords) {
      prevCoordsRef.current = coords
      setPosIndex(0)
    }

    const total = coords.length
    // Advance one step per tick; step size scales so the full route takes ~200 ticks (40 seconds).
    // For short routes the step is 1; for long routes it proportionally increases.
    const STEP = Math.max(1, Math.ceil(total / 200))
    const interval = setInterval(() => {
      setPosIndex((prev) => {
        const next = prev + STEP
        return next >= total - 1 ? total - 1 : next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [navActive, coords])

  if (!navActive || coords.length === 0) return null

  const position = coords[Math.min(posIndex, coords.length - 1)]

  return (
    <Marker position={position} icon={getCarIcon()}>
      <Popup>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Your vehicle</div>
      </Popup>
    </Marker>
  )
}


// ─── GPS keyframe style injector ────────────────────────────────────────────────
function GpsStyle() {
  useEffect(() => {
    const styleId = 'drishti-gps-pulse-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes gpsPulse {
          0%   { box-shadow: 0 0 0 0    rgba(59,130,246,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(59,130,246,0);   }
          100% { box-shadow: 0 0 0 0    rgba(59,130,246,0);   }
        }
      `
      document.head.appendChild(style)
    }
  }, [])
  return null
}

// ─── GPS auto-pan: re-centres the map whenever position changes ──────────────
function GpsAutoPan({ position }: { position: [number, number] }) {
  const map = useMap()
  const prevPosition = useRef<[number, number] | null>(null)

  useEffect(() => {
    if (
      prevPosition.current === null ||
      prevPosition.current[0] !== position[0] ||
      prevPosition.current[1] !== position[1]
    ) {
      prevPosition.current = position
      map.setView(position, map.getZoom())
    }
  }, [position, map])

  return null
}

// ─── VIP pulsing circles at each point along the corridor ───────────────────
function VipPulsingCircles({ coords }: { coords: [number, number][] }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => (t + 1) % PULSE_CYCLE_STEPS), 100)
    return () => clearInterval(interval)
  }, [])

  // Smooth sinusoidal radius oscillation
  const scale = 1 + Math.sin((tick / PULSE_CYCLE_STEPS) * 2 * Math.PI) * PULSE_AMPLITUDE_FACTOR
  const radius = Math.round(BASE_PULSE_RADIUS * scale)

  return (
    <>
      {coords.map((coord, i) => (
        <Circle
          key={`vip-pulse-${i}`}
          center={coord}
          radius={radius}
          pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.18, weight: 1 }}
        />
      ))}
    </>
  )
}

// ─── Emergency polyline with flashing opacity ────────────────────────────────
function EmergencyPolyline({ coords }: { coords: [number, number][] }) {
  const [bright, setBright] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setBright((b) => !b), 550)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Outer glow */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#ef4444', weight: 12, opacity: bright ? 0.22 : 0.05 }}
      />
      {/* Core line */}
      <Polyline
        positions={coords}
        pathOptions={{ color: '#ef4444', weight: 6, opacity: bright ? 0.85 : 0.3 }}
      />
    </>
  )
}

// ─── Alert circle markers ────────────────────────────────────────────────────
const ALERT_COLORS: Record<string, string> = {
  accident: '#f97316',
  congestion: '#eab308',
  vip: '#7c3aed',
  emergency: '#ef4444',
}

function AlertMarkers({ alerts }: { alerts: MapAlert[] }) {
  return (
    <>
      {alerts.map((alert, i) => {
        const color = ALERT_COLORS[alert.type] ?? '#6b7280'
        return (
          <CircleMarker
            key={`alert-${i}`}
            center={alert.position}
            radius={10}
            pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.9 }}
          >
            <Popup>
              <div style={{ minWidth: 160, padding: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color, marginBottom: 4, textTransform: 'capitalize' }}>
                  {alert.type} Alert
                </p>
                <p style={{ fontSize: 11, color: '#374151' }}>{alert.message}</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export default function LeafletMapInner({
  intersections,
  onSelectIntersection,
  routeCoords,
  showDigitalTwin = false,
  showHeatmap = false,
  gpsPosition,
  centerOnGps = false,
  vipRoute,
  emergencyRoute,
  mapAlerts,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
  routeCoords?: RouteCoords
  showDigitalTwin?: boolean
  showHeatmap?: boolean
  gpsPosition?: [number, number] | null
  centerOnGps?: boolean
  vipRoute?: [number, number][]
  emergencyRoute?: [number, number][]
  mapAlerts?: MapAlert[]
}) {
  // Default center: Lucknow, India
  const defaultCenter: [number, number] = [26.8467, 80.9462]

  const validIntersections = intersections.filter((i) => {
    const lat = parseFloat(i.latitude)
    const lng = parseFloat(i.longitude)
    return !isNaN(lat) && !isNaN(lng)
  })

  return (
    <MapContainer
      center={defaultCenter}
      zoom={DEFAULT_CITY_ZOOM_LEVEL}
      style={{ height: '580px', width: '100%', borderRadius: '0 0 0.75rem 0.75rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds intersections={validIntersections} routeCoords={routeCoords} />

      {/* AI Predictive Heatmap — shown when toggled on */}
      {showHeatmap && <PredictiveHeatmap intersections={validIntersections} />}

      {/* Route polyline — green navigation colours */}
      {routeCoords && routeCoords.coordinates.length > 1 && (
        <>
          {/* Route shadow */}
          <Polyline
            positions={routeCoords.coordinates}
            color="#15803d"
            weight={8}
            opacity={0.25}
          />
          {/* Route line */}
          <Polyline
            positions={routeCoords.coordinates}
            color="#16a34a"
            weight={5}
            opacity={0.9}
          />
          {/* Start marker */}
          <CircleMarker
            center={routeCoords.coordinates[0]}
            radius={8}
            pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700 }}>Start</div></Popup>
          </CircleMarker>
          {/* Destination marker */}
          <CircleMarker
            center={routeCoords.coordinates[routeCoords.coordinates.length - 1]}
            radius={8}
            pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700 }}>Destination</div></Popup>
          </CircleMarker>
        </>
      )}

      {/* Animated car navigation marker */}
      {routeCoords && routeCoords.navActive && (
        <CarNavigationMarker routeCoords={routeCoords} />
      )}

      {/* Road segment polylines (only shown when no route is active) */}
      {!routeCoords && ROAD_CONNECTIONS.map(([fromIdx, toIdx], idx) => {
        const from = validIntersections[fromIdx]
        const to = validIntersections[toIdx]
        if (!from || !to) return null
        const congestion = getCongestionLevel(`road-${idx}`)
        return (
          <Polyline
            key={`road-${idx}`}
            positions={[
              [parseFloat(from.latitude), parseFloat(from.longitude)],
              [parseFloat(to.latitude), parseFloat(to.longitude)],
            ]}
            color={CONGESTION_COLORS[congestion]}
            weight={3}
            opacity={0.55}
            dashArray={congestion === 'high' ? '8 4' : undefined}
          />
        )
      })}

      {/* Congestion heatmap circles (existing — high congestion zones) */}
      {validIntersections.map((intersection) => {
        const congestion = getCongestionLevel(intersection.id)
        if (congestion !== 'high') return null
        return (
          <Circle
            key={`zone-${intersection.id}`}
            center={[parseFloat(intersection.latitude), parseFloat(intersection.longitude)]}
            radius={500}
            pathOptions={{
              color: CONGESTION_COLORS.high,
              fillColor: CONGESTION_COLORS.high,
              fillOpacity: 0.07,
              weight: 1,
            }}
          />
        )
      })}

      {/* Traffic Signal Markers */}
      {validIntersections.map((intersection) => {
        const congestion = getCongestionLevel(intersection.id)
        const color = CONGESTION_COLORS[congestion]
        const signalLabel: Record<string, string> = { low: 'GREEN', medium: 'YELLOW', high: 'RED' }
        const signal = signalLabel[congestion]
        const vehicles = getVehicleCount(intersection.id)
        const timer = congestion === 'high' ? 45 : congestion === 'medium' ? 30 : 60
        const aiRec =
          congestion === 'high'
            ? `Extend green phase +15s (${vehicles} vehicles queued)`
            : congestion === 'medium'
            ? `Maintain current timing (${vehicles} vehicles)`
            : `Shorten red phase -10s (${vehicles} vehicles)`

        return (
          <CircleMarker
            key={intersection.id}
            center={[parseFloat(intersection.latitude), parseFloat(intersection.longitude)]}
            radius={13}
            pathOptions={{
              color: '#ffffff',
              weight: 2.5,
              fillColor: color,
              fillOpacity: 0.92,
            }}
            eventHandlers={{
              click: () => onSelectIntersection(intersection),
            }}
          >
            <Popup>
              <div style={{ minWidth: 210, padding: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 4 }}>
                  {intersection.name}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{intersection.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span
                    style={{
                      background: color,
                      color: '#fff',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {signal}
                  </span>
                  <span
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                    }}
                  >
                    {timer}s
                  </span>
                  <span
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                    }}
                  >
                    {vehicles} vehicles
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>AI: {aiRec}</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      {/* Digital Traffic Twin — simulated moving vehicles (shown when toggled on) */}
      {showDigitalTwin && <DigitalTwinVehicles intersections={validIntersections} />}

      {/* VIP Corridor */}
      {vipRoute && vipRoute.length > 1 && (
        <>
          <Polyline
            positions={vipRoute}
            pathOptions={{ color: '#7c3aed', weight: 6, opacity: 0.8, dashArray: '12 4' }}
          />
          <VipPulsingCircles coords={vipRoute} />
          {/* Crown markers at start and end */}
          <Marker position={vipRoute[0]} icon={getCrownIcon()}>
            <Popup><div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>VIP Corridor Start</div></Popup>
          </Marker>
          <Marker position={vipRoute[vipRoute.length - 1]} icon={getCrownIcon()}>
            <Popup><div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>VIP Corridor End</div></Popup>
          </Marker>
        </>
      )}

      {/* Emergency Corridor */}
      {emergencyRoute && emergencyRoute.length > 1 && (
        <>
          <EmergencyPolyline coords={emergencyRoute} />
          {/* Gradient circles at start and end */}
          <Circle
            center={emergencyRoute[0]}
            radius={120}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Emergency Route Start</div></Popup>
          </Circle>
          <Circle
            center={emergencyRoute[emergencyRoute.length - 1]}
            radius={120}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Emergency Route End</div></Popup>
          </Circle>
        </>
      )}

      {/* Alert markers */}
      {mapAlerts && mapAlerts.length > 0 && <AlertMarkers alerts={mapAlerts} />}

      {/* GPS user location marker */}
      {gpsPosition && (
        <>
          <GpsStyle />
          {centerOnGps && <GpsAutoPan position={gpsPosition} />}
          <Marker position={gpsPosition} icon={getGpsIcon()}>
            <Popup><div style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>Your Location</div></Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  )
}
