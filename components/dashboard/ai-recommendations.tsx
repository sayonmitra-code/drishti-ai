'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, CheckCircle2, X } from 'lucide-react'

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
    high: {
      badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
      border: 'border-l-red-400',
    },
    medium: {
      badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
      border: 'border-l-orange-400',
    },
    low: {
      badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      border: 'border-l-blue-400',
    },
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          AI Recommendations
          {aiMode && (
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium ml-auto">
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
          <div className="text-center py-8 text-slate-500 text-sm">
            No recommendations at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const style = priorityStyle[rec.priority] || priorityStyle.low
              return (
                <div
                  key={rec.id}
                  className={`p-4 bg-slate-800/60 border border-slate-700 rounded-xl border-l-4 ${style.border} space-y-2`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-500">{rec.recommendation_type}</span>
                    {rec.status !== 'pending' && (
                      <span className={`ml-auto text-[11px] font-medium flex items-center gap-1 ${
                        rec.status === 'implemented' ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {rec.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{rec.recommendation_text}</p>

                  {rec.status === 'pending' && !aiMode && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRecommendation(rec.id, 'implemented')}
                        className="flex-1 py-1.5 px-3 bg-green-500/15 border border-green-500/30 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/25 transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Implement
                      </button>
                      <button
                        onClick={() => handleRecommendation(rec.id, 'dismissed')}
                        className="flex-1 py-1.5 px-3 bg-slate-700/60 border border-slate-600 text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3 h-3" />
                        Dismiss
                      </button>
                    </div>
                  )}
                  {rec.status === 'pending' && aiMode && (
                    <div className="text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 flex items-center gap-2">
                      <Brain className="w-3 h-3 flex-shrink-0" />
                      AI is auto-implementing this recommendation…
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
