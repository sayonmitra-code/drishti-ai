'use client'

import { useEffect, useState } from 'react'
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

const CONGESTION_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
}

// Deterministic congestion based on intersection id
function getCongestionLevel(id: string): 'low' | 'medium' | 'high' {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  if (hash % 3 === 0) return 'high'
  if (hash % 3 === 1) return 'medium'
  return 'low'
}

// Lucknow road network connections
const ROAD_CONNECTIONS: [number, number][] = [
  [0, 4], // Hazratganj → Aminabad
  [0, 7], // Hazratganj → Kaiserbagh
  [1, 4], // Charbagh → Aminabad
  [2, 1], // Alambagh → Charbagh
  [3, 5], // Gomti Nagar → Indira Nagar
  [4, 7], // Aminabad → Kaiserbagh
  [5, 6], // Indira Nagar → Aliganj
  [6, 0], // Aliganj → Hazratganj
]

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

  useEffect(() => {
    if (!routeCoords.navActive || routeCoords.coordinates.length === 0) return
    setPosIndex(0)
    const total = routeCoords.coordinates.length
    // Advance every ~200ms to simulate movement
    const interval = setInterval(() => {
      setPosIndex((prev) => {
        if (prev >= total - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 200)
    return () => clearInterval(interval)
  }, [routeCoords])

  if (!routeCoords.navActive || routeCoords.coordinates.length === 0) return null

  const position = routeCoords.coordinates[Math.min(posIndex, routeCoords.coordinates.length - 1)]

  return (
    <Marker position={position} icon={getCarIcon()}>
      <Popup>
        <div style={{ fontSize: 12, fontWeight: 600 }}>🚗 Your vehicle</div>
      </Popup>
    </Marker>
  )
}


export default function LeafletMapInner({
  intersections,
  onSelectIntersection,
  routeCoords,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
  routeCoords?: RouteCoords
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
      zoom={13}
      style={{ height: '500px', width: '100%', borderRadius: '0 0 0.75rem 0.75rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds intersections={validIntersections} routeCoords={routeCoords} />

      {/* Route polyline */}
      {routeCoords && routeCoords.coordinates.length > 1 && (
        <>
          {/* Route shadow */}
          <Polyline
            positions={routeCoords.coordinates}
            color="#1e40af"
            weight={8}
            opacity={0.25}
          />
          {/* Route line */}
          <Polyline
            positions={routeCoords.coordinates}
            color="#3b82f6"
            weight={5}
            opacity={0.9}
          />
          {/* Start marker */}
          <CircleMarker
            center={routeCoords.coordinates[0]}
            radius={8}
            pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700 }}>🟢 Start</div></Popup>
          </CircleMarker>
          {/* Destination marker */}
          <CircleMarker
            center={routeCoords.coordinates[routeCoords.coordinates.length - 1]}
            radius={8}
            pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
          >
            <Popup><div style={{ fontSize: 12, fontWeight: 700 }}>🔴 Destination</div></Popup>
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

      {/* Congestion heatmap circles */}
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
                    ⏱ {timer}s
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
                    🚗 {vehicles}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>🤖 AI: {aiRec}</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
