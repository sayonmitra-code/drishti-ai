'use client'

import { useState } from 'react'
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
    <div className="h-[580px] flex items-center justify-center bg-slate-900/50 rounded-b-xl">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Loading interactive map…</p>
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
  const [showDigitalTwin, setShowDigitalTwin] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)

  return (
    <Card className="h-full bg-slate-900 border-slate-800 shadow-xl">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
            <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.894 2.447A1 1 0 0021 18.618V7.382a1 1 0 00-1.447-.894L15 8m0 13V8" />
            </svg>
            Live Traffic Map — Lucknow
            <span className="flex items-center gap-1 text-[10px] font-normal text-green-400 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </span>
          </CardTitle>

          {/* Feature Toggles */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowDigitalTwin((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                showDigitalTwin
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              Digital Twin
            </button>
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                showHeatmap
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
              AI Heatmap
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-green-500 inline-block" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-orange-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-red-500 inline-block" /> High</span>
          {routeCoords && (
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <span className="w-3 h-1.5 rounded bg-blue-500 inline-block" /> Active Route
            </span>
          )}
          {showDigitalTwin && (
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Digital Twin: {48} vehicles
            </span>
          )}
          {showHeatmap && (
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block opacity-60" /> AI Predicted Zones
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <LeafletMapInner
          intersections={intersections}
          onSelectIntersection={onSelectIntersection}
          routeCoords={routeCoords}
          showDigitalTwin={showDigitalTwin}
          showHeatmap={showHeatmap}
        />
      </CardContent>
    </Card>
  )
}
