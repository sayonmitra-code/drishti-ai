'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RouteCoords } from './traffic-map-inner'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

const LeafletMapInner = dynamic(() => import('./traffic-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-b-xl">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Loading interactive map…</p>
      </div>
    </div>
  ),
})

export default function TrafficMap({
  intersections,
  onSelectIntersection,
  routeCoords,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
  routeCoords?: RouteCoords
}) {
  return (
    <Card className="h-full shadow-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base font-semibold">
          <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" />
          </svg>
          Live Traffic Map — Lucknow
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            OpenStreetMap
          </span>
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-green-500 inline-block" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-orange-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-red-500 inline-block" /> High</span>
          {routeCoords && (
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <span className="w-3 h-1.5 rounded bg-blue-500 inline-block" /> Active Route
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <LeafletMapInner
          intersections={intersections}
          onSelectIntersection={onSelectIntersection}
          routeCoords={routeCoords}
        />
      </CardContent>
    </Card>
  )
}
