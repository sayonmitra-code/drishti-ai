'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

function getCongestionLevel(index: number): string {
  if (index % 3 === 0) return 'high'
  if (index % 3 === 1) return 'medium'
  return 'low'
}

declare global {
  interface Window {
    google: typeof google
  }
}

export default function TrafficMap({
  intersections,
  onSelectIntersection,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setMapError(true)
      return
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      existingScript.addEventListener('load', initMap)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`
    script.async = true
    script.defer = true
    script.onload = initMap
    script.onerror = () => setMapError(true)
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', initMap)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return

    const center = intersections[0]
      ? {
          lat: parseFloat(intersections[0].latitude),
          lng: parseFloat(intersections[0].longitude),
        }
      : { lat: 12.9716, lng: 77.5946 }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      mapTypeId: 'roadmap',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8a92a0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1628' }] },
      ],
    })

    const trafficLayer = new window.google.maps.TrafficLayer()
    trafficLayer.setMap(map)

    intersections.forEach((intersection, idx) => {
      const lat = parseFloat(intersection.latitude)
      const lng = parseFloat(intersection.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const congestion = getCongestionLevel(idx)
      const color = CONGESTION_COLORS[congestion]

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: intersection.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="background:#1e293b;color:#f1f5f9;padding:12px;border-radius:8px;min-width:180px;">
            <strong style="color:#06b6d4;font-size:14px;">${intersection.name}</strong>
            <p style="margin:6px 0 4px;font-size:12px;color:#94a3b8;">${intersection.description}</p>
            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${color}30;color:${color};border:1px solid ${color}80;">
              ${congestion.toUpperCase()} CONGESTION
            </span>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        onSelectIntersection(intersection)
      })
    })

    mapInstanceRef.current = map
    setMapLoaded(true)
  }

  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" />
          </svg>
          Live Traffic Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {mapError ? (
          <div className="w-full h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-b-lg flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 border border-cyan-500/50 rounded-full animate-pulse-glow">
                <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" />
                </svg>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-1">Traffic Intersections</h3>
                <p className="text-foreground/60 text-sm mb-2">
                  Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for live map
                </p>
                <p className="text-foreground/40 text-xs mb-4">
                  {intersections.length} intersections monitored
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {intersections.slice(0, 4).map((intersection, idx) => {
                  const congestion = getCongestionLevel(idx)
                  return (
                    <button
                      key={intersection.id}
                      onClick={() => onSelectIntersection(intersection)}
                      className="px-3 py-2 glass-sm bg-cyan-600/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600/40 transition text-xs font-medium rounded-lg"
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: CONGESTION_COLORS[congestion] }}
                      />
                      {intersection.name.split(' & ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-96 rounded-b-lg"
              style={{ minHeight: '384px' }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-b-lg">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
