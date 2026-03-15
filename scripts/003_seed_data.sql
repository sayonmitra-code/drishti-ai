-- Seed intersections (major traffic hubs)
insert into public.intersections (name, latitude, longitude, description) values
  ('Main & 5th Street', 40.7128, -74.0060, 'Downtown intersection with high traffic'),
  ('Park Avenue & 42nd', 40.7505, -73.9776, 'Midtown commercial hub'),
  ('Broadway & Times Square', 40.7589, -73.9851, 'Tourist district high traffic'),
  ('3rd Avenue & 34th', 40.7489, -73.9680, 'East side major intersection'),
  ('Madison Ave & 59th', 40.7662, -73.9776, 'Uptown retail district')
on conflict do nothing;

-- Seed traffic signals for first intersection
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds) 
select id, 'North-South Signal', 'green', 45 from public.intersections where name = 'Main & 5th Street' on conflict do nothing;
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds) 
select id, 'East-West Signal', 'red', 30 from public.intersections where name = 'Main & 5th Street' on conflict do nothing;

-- Seed traffic signals for second intersection
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds) 
select id, 'North-South Signal', 'red', 30 from public.intersections where name = 'Park Avenue & 42nd' on conflict do nothing;
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds) 
select id, 'East-West Signal', 'green', 45 from public.intersections where name = 'Park Avenue & 42nd' on conflict do nothing;

-- Seed more intersections' signals
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'North-South Signal', 'yellow', 5 from public.intersections where name = 'Broadway & Times Square' on conflict do nothing;
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'East-West Signal', 'red', 35 from public.intersections where name = 'Broadway & Times Square' on conflict do nothing;

insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'North-South Signal', 'green', 40 from public.intersections where name = '3rd Avenue & 34th' on conflict do nothing;
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'East-West Signal', 'red', 40 from public.intersections where name = '3rd Avenue & 34th' on conflict do nothing;

insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'North-South Signal', 'red', 35 from public.intersections where name = 'Madison Ave & 59th' on conflict do nothing;
insert into public.traffic_signals (intersection_id, signal_name, status, timing_seconds)
select id, 'East-West Signal', 'green', 50 from public.intersections where name = 'Madison Ave & 59th' on conflict do nothing;
