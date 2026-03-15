-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'citizen' check (role in ('citizen', 'admin')),
  full_name text,
  created_at timestamp with time zone default now()
);

-- Create intersections table
create table if not exists public.intersections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Create traffic signals table
create table if not exists public.traffic_signals (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid not null references public.intersections(id) on delete cascade,
  signal_name text not null,
  status text default 'red' check (status in ('red', 'yellow', 'green')),
  timing_seconds integer default 30,
  emergency_mode boolean default false,
  updated_at timestamp with time zone default now()
);

-- Create vehicle counts table
create table if not exists public.vehicle_counts (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid not null references public.intersections(id) on delete cascade,
  signal_id uuid not null references public.traffic_signals(id) on delete cascade,
  direction text not null,
  vehicle_count integer default 0,
  timestamp timestamp with time zone default now()
);

-- Create AI recommendations table
create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid not null references public.intersections(id) on delete cascade,
  recommendation_type text not null,
  recommendation_text text not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'implemented', 'dismissed')),
  created_at timestamp with time zone default now()
);

-- Create traffic analytics table
create table if not exists public.traffic_analytics (
  id uuid primary key default gen_random_uuid(),
  intersection_id uuid not null references public.intersections(id) on delete cascade,
  hour_of_day integer not null,
  average_vehicles integer default 0,
  peak_congestion boolean default false,
  date date default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.intersections enable row level security;
alter table public.traffic_signals enable row level security;
alter table public.vehicle_counts enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.traffic_analytics enable row level security;

-- Profiles RLS policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Intersections RLS policies (all users can view)
create policy "intersections_select_all" on public.intersections for select using (true);
create policy "intersections_insert_admin" on public.intersections for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "intersections_update_admin" on public.intersections for update using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "intersections_delete_admin" on public.intersections for delete using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Traffic signals RLS policies (all users can view)
create policy "signals_select_all" on public.traffic_signals for select using (true);
create policy "signals_insert_admin" on public.traffic_signals for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "signals_update_admin" on public.traffic_signals for update using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "signals_delete_admin" on public.traffic_signals for delete using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Vehicle counts RLS policies (all users can view)
create policy "vehicle_counts_select_all" on public.vehicle_counts for select using (true);
create policy "vehicle_counts_insert_admin" on public.vehicle_counts for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- AI recommendations RLS policies (all users can view, admins can modify)
create policy "recommendations_select_all" on public.ai_recommendations for select using (true);
create policy "recommendations_insert_admin" on public.ai_recommendations for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "recommendations_update_admin" on public.ai_recommendations for update using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Traffic analytics RLS policies (all users can view)
create policy "analytics_select_all" on public.traffic_analytics for select using (true);
create policy "analytics_insert_admin" on public.traffic_analytics for insert with check (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
