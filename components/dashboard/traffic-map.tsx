'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

export default function TrafficMap({
  intersections,
  onSelectIntersection,
}: {
  intersections: Intersection[]
  onSelectIntersection: (intersection: Intersection) => void
}) {
  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="gradient-text">Traffic Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96 bg-gradient-to-br from-slate-100 dark:from-slate-800 to-slate-200 dark:to-slate-700 rounded-lg border border-primary/20 flex flex-col items-center justify-center p-6 glow-cyan">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 border border-cyan-500/50 rounded-full animate-pulse-glow">
              <svg
                className="w-8 h-8 text-cyan-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 17.618V6.382a1 1 0 00-1.553-.894L15 8m0 13V8m0 0L9 5"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-1">Interactive Map</h3>
              <p className="text-foreground/60 text-sm mb-4">
                Displaying {intersections.length} traffic intersections
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {intersections.slice(0, 4).map((intersection) => (
                <button
                  key={intersection.id}
                  onClick={() => onSelectIntersection(intersection)}
                  className="px-3 py-2 glass-sm hover:glass bg-cyan-600/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600/40 transition text-sm font-medium"
                >
                  {intersection.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
