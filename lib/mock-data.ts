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

// Sample intersections for Lucknow, Uttar Pradesh, India — 43 major localities
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
  {
    id: 'int-009',
    name: 'Aashiana Chauraha',
    latitude: '26.8150',
    longitude: '80.9320',
    description: 'Residential colony intersection — moderate daily traffic flow',
  },
  {
    id: 'int-010',
    name: 'Adarsh Nagar Crossing',
    latitude: '26.8620',
    longitude: '80.9290',
    description: 'Mixed-use locality near Lucknow Cantonment',
  },
  {
    id: 'int-011',
    name: 'Ahmamau Chauraha',
    latitude: '26.9050',
    longitude: '81.0200',
    description: 'Peri-urban intersection on Lucknow-Faizabad Road corridor',
  },
  {
    id: 'int-012',
    name: 'Aishbagh Crossing',
    latitude: '26.8460',
    longitude: '80.9120',
    description: 'Dense residential area with market — frequent bottleneck',
  },
  {
    id: 'int-013',
    name: 'Amausi Airport Road',
    latitude: '26.7742',
    longitude: '80.8888',
    description: 'Lucknow Airport approach — peak traffic during flight hours',
  },
  {
    id: 'int-014',
    name: 'Amber Ganj Chauraha',
    latitude: '26.8690',
    longitude: '80.9180',
    description: 'Commercial area north of Charbagh — heavy goods vehicle movement',
  },
  {
    id: 'int-015',
    name: 'Anand Nagar Crossing',
    latitude: '26.8330',
    longitude: '80.9580',
    description: 'Residential colony intersection with school traffic spikes',
  },
  {
    id: 'int-016',
    name: 'Ashiyana Colony Chauraha',
    latitude: '26.8180',
    longitude: '80.9400',
    description: 'Large housing colony — peak inbound traffic 7–9 AM',
  },
  {
    id: 'int-017',
    name: 'Ashok Marg Junction',
    latitude: '26.8640',
    longitude: '80.9440',
    description: 'Key arterial road junction linking Hazratganj to Aliganj',
  },
  {
    id: 'int-018',
    name: 'Balaganj Crossing',
    latitude: '26.8710',
    longitude: '80.9300',
    description: 'Old city area — dense pedestrian and vehicle mix',
  },
  {
    id: 'int-019',
    name: 'Banthra Chauraha',
    latitude: '26.7650',
    longitude: '80.9620',
    description: 'Peri-urban intersection on Kanpur Road — growing traffic load',
  },
  {
    id: 'int-020',
    name: 'Bijnaur Road Junction',
    latitude: '26.8900',
    longitude: '80.9750',
    description: 'Outer ring road intersection — freight and commuter traffic',
  },
  {
    id: 'int-021',
    name: 'Chinhat Chauraha',
    latitude: '26.8720',
    longitude: '81.0700',
    description: 'Eastern suburb — IT park access and residential traffic',
  },
  {
    id: 'int-022',
    name: 'Civil Lines Crossing',
    latitude: '26.8680',
    longitude: '80.9510',
    description: 'Government offices cluster — peak morning and evening rush',
  },
  {
    id: 'int-023',
    name: 'Dalibagh Chauraha',
    latitude: '26.8550',
    longitude: '80.9550',
    description: 'Upscale residential area near Hazratganj',
  },
  {
    id: 'int-024',
    name: 'Deva Road Junction',
    latitude: '26.9100',
    longitude: '81.0050',
    description: 'Northern radial road — connects city to rural Barabanki',
  },
  {
    id: 'int-025',
    name: 'Dilkusha Crossing',
    latitude: '26.8590',
    longitude: '80.9850',
    description: 'Historic area near Dilkusha Gardens — tourist and commuter mix',
  },
  {
    id: 'int-026',
    name: 'Faizabad Road Chauraha',
    latitude: '26.8840',
    longitude: '81.0120',
    description: 'Major arterial highway — heavy inter-city and local traffic',
  },
  {
    id: 'int-027',
    name: 'Jankipuram Crossing',
    latitude: '26.9050',
    longitude: '80.9860',
    description: 'Large planned residential colony — high peak-hour congestion',
  },
  {
    id: 'int-028',
    name: 'Kalyanpur Chauraha',
    latitude: '26.8420',
    longitude: '80.8980',
    description: 'Western suburb — industrial and residential mix',
  },
  {
    id: 'int-029',
    name: 'Kanpur Road Junction',
    latitude: '26.8050',
    longitude: '80.8870',
    description: 'NH-27 entry point — heavy freight and passenger traffic',
  },
  {
    id: 'int-030',
    name: 'Lalbagh Chauraha',
    latitude: '26.8490',
    longitude: '80.9310',
    description: 'Commercial district near Charbagh — busy market traffic',
  },
  {
    id: 'int-031',
    name: 'Lucknow Cantonment Gate',
    latitude: '26.8440',
    longitude: '80.9630',
    description: 'Military cantonment entry — controlled but significant throughput',
  },
  {
    id: 'int-032',
    name: 'Mahanagar Crossing',
    latitude: '26.8730',
    longitude: '80.9680',
    description: 'Prime residential locality — morning rush to commercial zones',
  },
  {
    id: 'int-033',
    name: 'Nirala Nagar Chauraha',
    latitude: '26.8800',
    longitude: '80.9460',
    description: 'Upmarket residential enclave — peak school and office traffic',
  },
  {
    id: 'int-034',
    name: 'Nishatganj Bridge Junction',
    latitude: '26.8660',
    longitude: '80.9400',
    description: 'Gomti River bridge approach — critical chokepoint during rush',
  },
  {
    id: 'int-035',
    name: 'Rajajipuram Crossing',
    latitude: '26.8310',
    longitude: '80.9060',
    description: 'Large planned residential colony west of Charbagh',
  },
  {
    id: 'int-036',
    name: 'Sarojini Nagar Chauraha',
    latitude: '26.7890',
    longitude: '80.9120',
    description: 'Sub-urban residential area on Kanpur Road corridor',
  },
  {
    id: 'int-037',
    name: 'Telibagh Crossing',
    latitude: '26.7960',
    longitude: '80.9760',
    description: 'Southern suburb — growing peri-urban traffic zone',
  },
  {
    id: 'int-038',
    name: 'Thakurganj Chauraha',
    latitude: '26.8750',
    longitude: '80.9130',
    description: 'Dense old city neighbourhood — chronic congestion zone',
  },
  {
    id: 'int-039',
    name: 'Triveni Nagar Junction',
    latitude: '26.8220',
    longitude: '80.9720',
    description: 'Residential colony near Gomti Nagar — increasing traffic load',
  },
  {
    id: 'int-040',
    name: 'Vibhuti Khand Chauraha',
    latitude: '26.8460',
    longitude: '81.0150',
    description: 'Gomti Nagar commercial hub — high peak-hour congestion',
  },
  {
    id: 'int-041',
    name: 'Vikas Nagar Crossing',
    latitude: '26.8960',
    longitude: '80.9920',
    description: 'Northern planned township — school and office rush peaks',
  },
  {
    id: 'int-042',
    name: 'Vrindavan Yojana Chauraha',
    latitude: '26.8100',
    longitude: '81.0350',
    description: 'Eastern planned colony — emerging residential traffic zone',
  },
  {
    id: 'int-043',
    name: 'Wazirganj Crossing',
    latitude: '26.8540',
    longitude: '80.9220',
    description: 'Commercial district near Aminabad — dense market traffic',
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
