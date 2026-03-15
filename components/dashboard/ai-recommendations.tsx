'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export default function AIRecommendations({ intersection }: { intersection: Intersection }) {
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
    const interval = setInterval(fetchRecommendations, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [intersection.id])

  const handleRecommendation = async (recommendationId: string, action: 'implemented' | 'dismissed') => {
    try {
      await fetch('/api/recommendations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          status: action,
        }),
      })

      setRecommendations((prev) =>
        prev.map((r) => (r.id === recommendationId ? { ...r, status: action } : r))
      )
    } catch (error) {
      console.error('Error updating recommendation:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-white/60 text-center py-8">Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="text-white/60 text-center py-8">No recommendations at this time</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-white/60">{rec.recommendation_type}</span>
                    </div>
                    <p className="text-white text-sm">{rec.recommendation_text}</p>
                  </div>
                </div>

                {rec.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleRecommendation(rec.id, 'implemented')}
                      className="flex-1 py-2 px-3 bg-green-600/30 border border-green-500/50 text-green-400 rounded text-sm font-semibold hover:bg-green-600/40 transition"
                    >
                      Implement
                    </button>
                    <button
                      onClick={() => handleRecommendation(rec.id, 'dismissed')}
                      className="flex-1 py-2 px-3 bg-gray-600/30 border border-gray-500/50 text-gray-400 rounded text-sm font-semibold hover:bg-gray-600/40 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {rec.status !== 'pending' && (
                  <div className="pt-2 text-xs text-white/50">
                    Status: <span className="capitalize">{rec.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
