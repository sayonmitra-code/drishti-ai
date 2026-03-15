-- Insert test intersections
INSERT INTO public.intersections (name, latitude, longitude, description) VALUES
  ('Main St & Central Ave', 40.7128, -74.0060, 'Downtown intersection'),
  ('Broadway & 42nd St', 40.7505, -73.9865, 'Times Square area'),
  ('Park Ave & 59th St', 40.7665, -73.9778, 'Upper East Side'),
  ('5th Ave & 34th St', 40.7484, -73.9857, 'Madison Square Park'),
  ('Houston St & Bowery', 40.7211, -73.9897, 'Lower East Side'),
  ('Canal St & Lafayette St', 40.7196, -73.9995, 'Chinatown'),
  ('Spring St & Lafayette St', 40.7254, -73.9980, 'NoLita'),
  ('Atlantic Ave & Flatbush Ave', 40.6845, -73.9760, 'Brooklyn Heights')
ON CONFLICT DO NOTHING;

-- Get intersection IDs
WITH intersections AS (
  SELECT id FROM public.intersections ORDER BY created_at ASC
)
INSERT INTO public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
SELECT 
  i.id,
  'Signal ' || ROW_NUMBER() OVER (PARTITION BY i.id),
  'red',
  30
FROM (
  SELECT id FROM public.intersections
) i
CROSS JOIN (
  SELECT * FROM (VALUES (1), (2), (3), (4)) AS t(val)
) AS signal_nums
ON CONFLICT DO NOTHING;

-- Insert initial vehicle counts
WITH signal_data AS (
  SELECT id, intersection_id FROM public.traffic_signals LIMIT 32
)
INSERT INTO public.vehicle_counts (intersection_id, signal_id, direction, vehicle_count)
SELECT 
  sd.intersection_id,
  sd.id,
  directions.dir,
  FLOOR(RANDOM() * 50 + 10)::INTEGER
FROM signal_data sd
CROSS JOIN (
  SELECT * FROM (VALUES ('North'), ('South'), ('East'), ('West')) AS dirs(dir)
) directions
ON CONFLICT DO NOTHING;

-- Insert traffic analytics for 24 hours
WITH intersections_with_hours AS (
  SELECT i.id, h.hour
  FROM public.intersections i
  CROSS JOIN (
    SELECT * FROM GENERATE_SERIES(0, 23) AS hours(hour)
  ) h
)
INSERT INTO public.traffic_analytics (intersection_id, hour_of_day, average_vehicles, peak_congestion)
SELECT 
  iwh.id,
  iwh.hour,
  CASE 
    WHEN iwh.hour >= 7 AND iwh.hour <= 9 THEN FLOOR(RANDOM() * 100 + 300)::INTEGER
    WHEN iwh.hour >= 12 AND iwh.hour <= 13 THEN FLOOR(RANDOM() * 80 + 250)::INTEGER
    WHEN iwh.hour >= 17 AND iwh.hour <= 19 THEN FLOOR(RANDOM() * 150 + 350)::INTEGER
    ELSE FLOOR(RANDOM() * 100 + 100)::INTEGER
  END,
  CASE 
    WHEN iwh.hour >= 7 AND iwh.hour <= 9 THEN true
    WHEN iwh.hour >= 17 AND iwh.hour <= 19 THEN true
    ELSE false
  END
FROM intersections_with_hours iwh
ON CONFLICT DO NOTHING;

-- Insert sample AI recommendations
WITH intersections_sample AS (
  SELECT id FROM public.intersections LIMIT 4
)
INSERT INTO public.ai_recommendations (intersection_id, recommendation_type, recommendation_text, priority, status)
SELECT 
  i.id,
  CASE (ROW_NUMBER() OVER (PARTITION BY i.id) - 1) % 3
    WHEN 0 THEN 'Signal Timing'
    WHEN 1 THEN 'Route Optimization'
    ELSE 'Emergency Corridor'
  END,
  CASE (ROW_NUMBER() OVER (PARTITION BY i.id) - 1) % 3
    WHEN 0 THEN 'Increase green light timing during peak hours (7-9 AM) by 10 seconds'
    WHEN 1 THEN 'Optimize traffic flow by adjusting signal patterns for rush hour'
    ELSE 'Pre-stage emergency corridor activation during peak hours'
  END,
  CASE FLOOR(RANDOM() * 3)::INTEGER
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  'pending'
FROM intersections_sample i
CROSS JOIN (SELECT 1 UNION SELECT 2) AS recommendations
ON CONFLICT DO NOTHING;
