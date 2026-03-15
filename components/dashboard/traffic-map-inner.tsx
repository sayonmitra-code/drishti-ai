'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

const CONGESTION_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
}

function getCongestionLevel(index: number): 'low' | 'medium' | 'high' {
  if (index % 3 === 0) return 'high'
  if (index % 3 === 1) return 'medium'
  return 'low'
}

// Road segment connections between intersections (simulate road network)
const ROAD_CONNECTIONS: [number, number][] = [
  [0, 4], // MG Road → Koramangala
  [0, 5], // MG Road → Indiranagar
  [1, 4], // Silk Board → Koramangala
  [2, 0], // Hebbal → MG Road
  [3, 1], // Electronic City → Silk Board
  [4, 5], // Koramangala → Indiranagar
]

function MapBounds({ intersections }: { intersections: Intersection[] }) {
  const map = useMap()
  useEffect(() => {
    if (intersections.length === 0) return
    const lats = intersections.map((i) => parseFloat(i.latitude)).filter((v) => !isNaN(v))
    const lngs = intersections.map((i) => parseFloat(i.longitude)).filter((v) => !isNaN(v))
    if (lats.length === 0) return
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
      [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02],
    ]
    map.fitBounds(bounds)
  }, [intersections, map])
  return null
}

export default function LeafletMapInner({
  intersections,
  onSelectIntersection,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
}) {
  const defaultCenter: [number, number] = [12.9716, 77.5946]

  const validIntersections = intersections.filter((i) => {
    const lat = parseFloat(i.latitude)
    const lng = parseFloat(i.longitude)
    return !isNaN(lat) && !isNaN(lng)
  })

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: '480px', width: '100%', borderRadius: '0 0 0.75rem 0.75rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds intersections={validIntersections} />

      {/* Road segment polylines */}
      {ROAD_CONNECTIONS.map(([fromIdx, toIdx], idx) => {
        const from = validIntersections[fromIdx]
        const to = validIntersections[toIdx]
        if (!from || !to) return null
        const congestion = getCongestionLevel(idx)
        return (
          <Polyline
            key={`road-${idx}`}
            positions={[
              [parseFloat(from.latitude), parseFloat(from.longitude)],
              [parseFloat(to.latitude), parseFloat(to.longitude)],
            ]}
            color={CONGESTION_COLORS[congestion]}
            weight={4}
            opacity={0.7}
            dashArray={congestion === 'high' ? '8 4' : undefined}
          />
        )
      })}

      {/* Congestion zone circles */}
      {validIntersections.map((intersection, idx) => {
        const congestion = getCongestionLevel(idx)
        if (congestion !== 'high') return null
        return (
          <Circle
            key={`zone-${intersection.id}`}
            center={[parseFloat(intersection.latitude), parseFloat(intersection.longitude)]}
            radius={600}
            pathOptions={{
              color: CONGESTION_COLORS.high,
              fillColor: CONGESTION_COLORS.high,
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        )
      })}

      {/* Intersection markers */}
      {validIntersections.map((intersection, idx) => {
        const congestion = getCongestionLevel(idx)
        const color = CONGESTION_COLORS[congestion]
        const signalColors: Record<string, string> = { low: 'GREEN', medium: 'YELLOW', high: 'RED' }
        const signal = signalColors[congestion]

        return (
          <CircleMarker
            key={intersection.id}
            center={[parseFloat(intersection.latitude), parseFloat(intersection.longitude)]}
            radius={14}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: color,
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSelectIntersection(intersection),
            }}
          >
            <Popup>
              <div className="min-w-[180px] p-1">
                <p className="font-semibold text-gray-900 text-sm mb-1">{intersection.name}</p>
                <p className="text-gray-500 text-xs mb-2">{intersection.description}</p>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {congestion.toUpperCase()} — Signal: {signal}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
