'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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
        </>
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
