'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Intersection {
  id: string
  name: string
}

interface Recommendation {
  id: string
  recommendation_type: string
  recommendation_text: string
  priority: string
  status: string
}

export default function AIRecommendations({
  intersection,
  aiMode = false,
}: {
  intersection: Intersection
  aiMode?: boolean
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?intersection_id=${intersection.id}`)
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
    const interval = setInterval(fetchRecommendations, 15000)
    return () => clearInterval(interval)
  }, [intersection.id])

  const handleRecommendation = async (
    recommendationId: string,
    action: 'implemented' | 'dismissed'
  ) => {
    try {
      await fetch('/api/recommendations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendationId, status: action }),
      })
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recommendationId ? { ...r, status: action } : r))
      )
    } catch (error) {
      console.error('Error updating recommendation:', error)
    }
  }

  const priorityStyle: Record<string, { badge: string; border: string }> = {
    high: { badge: 'bg-red-100 text-red-700 border border-red-200', border: 'border-l-red-400' },
    medium: { badge: 'bg-orange-100 text-orange-700 border border-orange-200', border: 'border-l-orange-400' },
    low: { badge: 'bg-blue-100 text-blue-700 border border-blue-200', border: 'border-l-blue-400' },
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          🤖 AI Recommendations
          {aiMode && (
            <span className="text-xs bg-cyan-100 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full font-medium ml-auto">
              Auto-applying
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recommendations at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const style = priorityStyle[rec.priority] || priorityStyle.low
              return (
                <div
                  key={rec.id}
                  className={`p-4 bg-muted/30 border border-border rounded-xl border-l-4 ${style.border} space-y-2`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.badge}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{rec.recommendation_type}</span>
                    {rec.status !== 'pending' && (
                      <span className={`ml-auto text-xs font-medium capitalize ${
                        rec.status === 'implemented' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        ✓ {rec.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{rec.recommendation_text}</p>

                  {rec.status === 'pending' && !aiMode && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRecommendation(rec.id, 'implemented')}
                        className="flex-1 py-1.5 px-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                      >
                        ✓ Implement
                      </button>
                      <button
                        onClick={() => handleRecommendation(rec.id, 'dismissed')}
                        className="flex-1 py-1.5 px-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  )}
                  {rec.status === 'pending' && aiMode && (
                    <div className="text-xs text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg p-2">
                      🤖 AI is auto-implementing this recommendation…
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
