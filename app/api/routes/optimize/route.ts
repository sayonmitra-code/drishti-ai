import { NextRequest, NextResponse } from 'next/server'

interface Intersection {
  id: string
  name: string
  lat: number
  lng: number
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateRouteScore(
  source: string,
  destination: string,
  intersections: Intersection[]
): { score: number; intersectionCount: number; estimatedTime: number } {
  // Find source and destination intersections
  const sourceIntersection = intersections.find(
    (i) => i.name.toLowerCase().includes(source.toLowerCase())
  )
  const destIntersection = intersections.find(
    (i) => i.name.toLowerCase().includes(destination.toLowerCase())
  )

  if (!sourceIntersection || !destIntersection) {
    return { score: 50, intersectionCount: 0, estimatedTime: 0 }
  }

  // Calculate distance
  const distance = calculateDistance(
    sourceIntersection.lat,
    sourceIntersection.lng,
    destIntersection.lat,
    destIntersection.lng
  )

  // Find intersections along the route (simplified)
  let intersectionCount = 0
  let totalWaitTime = 0

  intersections.forEach((intersection) => {
    const distToSource = calculateDistance(
      sourceIntersection.lat,
      sourceIntersection.lng,
      intersection.lat,
      intersection.lng
    )
    const distToDest = calculateDistance(
      intersection.lat,
      intersection.lng,
      destIntersection.lat,
      destIntersection.lng
    )

    // If intersection is roughly on the route
    if (distToSource + distToDest <= distance * 1.3) {
      intersectionCount++
      totalWaitTime += Math.random() * 30 + 10 // Simulate wait time 10-40 seconds
    }
  })

  // Calculate score (100 is best)
  const baseScore = 100
  const intersectionPenalty = Math.min(intersectionCount * 5, 30) // Up to 30% penalty for intersections
  const distancePenalty = Math.min((distance / 20) * 10, 20) // Up to 20% penalty for distance

  const score = Math.max(baseScore - intersectionPenalty - distancePenalty, 30)
  const estimatedTime = Math.round(distance * 2 + totalWaitTime / 60) // Distance * 2 min/km + wait time

  return { score, intersectionCount, estimatedTime }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, destination, intersections } = body

    if (!source || !destination || !intersections || intersections.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const result = calculateRouteScore(source, destination, intersections)

    return NextResponse.json({
      score: result.score,
      intersections: result.intersectionCount,
      estimatedTime: result.estimatedTime,
    })
  } catch (error) {
    console.error('Route optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize route' },
      { status: 500 }
    )
  }
}
