export interface Intersection {
  id: string
  name: string
  latitude: string
  longitude: string
  description: string
}

export interface Signal {
  id: string
  signal_name: string
  status: string
  timing_seconds: number
  intersection_id: string
}

export interface AnalyticsPoint {
  hour: number
  average_vehicles: number
  peak_congestion: boolean
}

export interface Recommendation {
  id: string
  recommendation_type: string
  recommendation_text: string
  priority: string
  status: string
  intersection_id: string
}

// Sample intersections for Lucknow, Uttar Pradesh, India
export const MOCK_INTERSECTIONS: Intersection[] = [
  {
    id: 'int-001',
    name: 'Hazratganj Chauraha',
    latitude: '26.8503',
    longitude: '80.9480',
    description: 'Central hub of Lucknow — high-density commercial & cultural zone',
  },
  {
    id: 'int-002',
    name: 'Charbagh Railway Station',
    latitude: '26.8373',
    longitude: '80.9197',
    description: 'Major transit node — peak congestion during train arrivals',
  },
  {
    id: 'int-003',
    name: 'Alambagh Bus Terminal',
    latitude: '26.8063',
    longitude: '80.9156',
    description: 'Southern gateway — inter-city bus terminus with high footfall',
  },
  {
    id: 'int-004',
    name: 'Gomti Nagar Viram Khand',
    latitude: '26.8500',
    longitude: '81.0066',
    description: 'Fast-growing IT & residential corridor in eastern Lucknow',
  },
  {
    id: 'int-005',
    name: 'Aminabad Market Crossing',
    latitude: '26.8523',
    longitude: '80.9231',
    description: 'Densely packed commercial market — chronic congestion zone',
  },
  {
    id: 'int-006',
    name: 'Indira Nagar Crossing',
    latitude: '26.8847',
    longitude: '81.0022',
    description: 'Major north-east residential & commercial intersection',
  },
  {
    id: 'int-007',
    name: 'Aliganj Sector D',
    latitude: '26.8780',
    longitude: '80.9570',
    description: 'Northern residential colony with school-hour traffic spikes',
  },
  {
    id: 'int-008',
    name: 'Kaiserbagh Chauraha',
    latitude: '26.8560',
    longitude: '80.9365',
    description: 'Historic area crossing near government buildings',
  },
]

/**
 * Generates realistic hourly vehicle counts for urban Indian traffic.
 * Pattern based on typical metro city traffic:
 * - Night hours (0–5): minimal traffic (2–10% of peak)
 * - Morning peak (7–9): rapid build-up to 75–95% of daily max
 * - Midday (10–15): moderate steady flow (55–70%)
 * - Evening peak (17–20): maximum congestion (75–100% of daily max)
 * - Late evening (21–23): gradual decline to 15–35%
 */
function getHourlyPattern(hour: number, baseVehicles: number): number {
  const patterns: Record<number, number> = {
    0: 0.05, 1: 0.03, 2: 0.02, 3: 0.02, 4: 0.04, 5: 0.10,
    6: 0.30, 7: 0.75, 8: 0.95, 9: 0.85, 10: 0.60, 11: 0.65,
    12: 0.70, 13: 0.65, 14: 0.55, 15: 0.60, 16: 0.75, 17: 0.90,
    18: 1.00, 19: 0.95, 20: 0.80, 21: 0.55, 22: 0.35, 23: 0.15,
  }
  const multiplier = patterns[hour] ?? 0.5
  const noise = (Math.random() - 0.5) * 0.1
  return Math.max(0, Math.round(baseVehicles * (multiplier + noise)))
}

export function getMockAnalytics(intersectionId: string): AnalyticsPoint[] {
  const baseVehicles = intersectionId === 'int-002' ? 600 : intersectionId === 'int-005' ? 550 : 400
  return Array.from({ length: 24 }, (_, hour) => {
    const avgVehicles = getHourlyPattern(hour, baseVehicles)
    return {
      hour,
      average_vehicles: avgVehicles,
      peak_congestion: avgVehicles > baseVehicles * 0.7,
    }
  })
}

export function getMockSignals(intersectionId: string): Signal[] {
  const directions = ['North', 'South', 'East', 'West']
  const statuses = ['red', 'green', 'yellow', 'red']
  return directions.map((dir, idx) => ({
    id: `sig-${intersectionId}-${dir.toLowerCase()}`,
    signal_name: `${dir} Arm Signal`,
    status: statuses[idx],
    timing_seconds: [45, 60, 10, 45][idx],
    intersection_id: intersectionId,
  }))
}

export function getMockVehicleCounts(intersectionId: string): Record<string, number> {
  const signals = getMockSignals(intersectionId)
  const counts: Record<string, number> = {}
  signals.forEach((s) => {
    counts[s.id] = Math.floor(Math.random() * 50 + 10)
  })
  return counts
}

export function getMockRecommendations(intersectionId: string): Recommendation[] {
  return [
    {
      id: `rec-${intersectionId}-1`,
      recommendation_type: 'Signal Timing',
      recommendation_text:
        'Extend green phase on North arm by 15s during 8–9 AM to reduce peak-hour queue length by ~30%.',
      priority: 'high',
      status: 'pending',
      intersection_id: intersectionId,
    },
    {
      id: `rec-${intersectionId}-2`,
      recommendation_type: 'Congestion Prediction',
      recommendation_text:
        'AI model predicts 85% congestion probability between 6–8 PM. Deploy dynamic signal control.',
      priority: 'medium',
      status: 'pending',
      intersection_id: intersectionId,
    },
    {
      id: `rec-${intersectionId}-3`,
      recommendation_type: 'Route Diversion',
      recommendation_text:
        'Suggest alternate route via Service Road to ease bottleneck during school hours (7–9 AM).',
      priority: 'low',
      status: 'pending',
      intersection_id: intersectionId,
    },
  ]
}

export function getMockPredictions(intersectionId: string) {
  const analytics = getMockAnalytics(intersectionId)
  const currentHour = new Date().getHours()
  return Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHour + i) % 24
    const point = analytics.find((a) => a.hour === hour)
    const congestion = point
      ? Math.min(Math.round((point.average_vehicles / 600) * 100), 100)
      : Math.round(Math.random() * 60)
    const signalStatus = congestion < 33 ? 'GREEN' : congestion < 66 ? 'YELLOW' : 'RED'
    return { hour, congestion, signalStatus }
  })
}
