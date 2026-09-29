-- =========================================================================
-- Cinematic Lab — Supabase Database & Storage Schema
-- Complete Relational Tables, Indexes, Triggers & RLS Security
-- =========================================================================

-- Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- 1. PROJECTS
create table if not exists public.projects (
  id text primary key,
  user_id text,
  name text not null,
  description text default '',
  tagline text default '',
  status text not null default 'in_progress',
  aspect_ratio text not null default '16:9',
  target_length_seconds integer not null default 60,
  pinned_asset_ids jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CREATIVE BRIEFS
create table if not exists public.creative_briefs (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  product_name text not null default '',
  product_description text default '',
  objective text default 'Product Launch',
  visual_moods jsonb default '["Minimal", "Cinematic", "Luxury"]'::jsonb,
  mood text default 'Cinematic',
  environment text default 'Dark Studio',
  camera_language text default 'Slow Push',
  lighting_style text default 'Controlled Highlight',
  creative_notes text default '',
  visual_references jsonb default '[]'::jsonb,
  reference_asset_ids jsonb default '[]'::jsonb,
  target_length integer default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_brief_project unique (project_id)
);

-- 3. CREATIVE CONCEPTS
create table if not exists public.creative_concepts (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  concept text not null,
  concept_description text default '',
  visual_language_attributes jsonb default '{}'::jsonb,
  cinematic_rules jsonb default '[]'::jsonb,
  shot_sequence jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_concept_project unique (project_id)
);

-- 4. SHOTS
create table if not exists public.shots (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  sequence_order integer not null default 0,
  shot_number text not null,
  title text not null,
  purpose text default '',
  visual_description text default '',
  prompt text default '',
  duration_seconds integer default 5,
  camera_type text default 'Dolly / Push',
  focal_length text default '85mm Macro',
  lens text default '85mm Prime',
  camera_movement text default 'Slow push-in',
  lighting_style text default 'Controlled Directional Highlight',
  environment text default 'Dark Studio',
  transition text default 'Cut',
  status text not null default 'PLANNED',
  keyframe_url text default '',
  approved_keyframe_id text,
  selected_version_id text,
  video_url text,
  approved_video_id text,
  selected_video_version_id text,
  start_frame_url text,
  end_frame_url text,
  subject_motion text default 'Product remains stationary',
  camera_motion text default 'Slow push-in',
  environmental_motion text default 'Reflections moving across surface',
  motion_intensity text default 'Cinematic',
  motion_notes text default '',
  motion_prompt text default '',
  model_target text default 'Veo 3.1',
  product_reference_ids jsonb default '[]'::jsonb,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. ASSETS
create table if not exists public.assets (
  id text primary key,
  project_id text references public.projects(id) on delete cascade,
  name text not null,
  file_name text not null,
  file_url text not null,
  storage_path text,
  type text not null default 'image',
  category text not null default 'reference',
  tags jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. SHOT REFERENCES
create table if not exists public.shot_references (
  id text primary key,
  shot_id text not null references public.shots(id) on delete cascade,
  asset_id text not null references public.assets(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  constraint uq_shot_asset unique (shot_id, asset_id)
);

-- 7. KEYFRAMES
create table if not exists public.keyframes (
  id text primary key,
  shot_id text not null references public.shots(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,
  version_number integer not null default 1,
  prompt text not null,
  provider text not null default 'openai',
  model text not null default 'dall-e-3',
  status text not null default 'completed',
  image_url text not null,
  storage_path text,
  aspect_ratio text default '16:9',
  metadata jsonb default '{}'::jsonb,
  is_approved boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 8. VIDEOS
create table if not exists public.videos (
  id text primary key,
  shot_id text not null references public.shots(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,
  version_number integer not null default 1,
  provider text not null default 'google_veo',
  model text not null default 'veo-3.1',
  motion_prompt text not null,
  duration_seconds integer not null default 5,
  aspect_ratio text not null default '16:9',
  status text not null default 'completed',
  video_url text not null,
  start_frame_url text,
  end_frame_url text,
  storage_path text,
  metadata jsonb default '{}'::jsonb,
  is_approved boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. GENERATION JOBS
create table if not exists public.generation_jobs (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  shot_id text references public.shots(id) on delete set null,
  type text not null, -- 'IMAGE' | 'VIDEO' | 'FINAL_ASSEMBLY'
  provider text not null,
  model text,
  status text not null default 'QUEUED', -- 'QUEUED' | 'GENERATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'INTERRUPTED'
  progress integer not null default 0,
  request jsonb default '{}'::jsonb,
  result_url text,
  error text,
  thumbnail_url text,
  shot_number text,
  shot_title text,
  duration integer default 5,
  is_demo boolean default false,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- 10. FINAL ASSEMBLIES
create table if not exists public.final_assemblies (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  timeline jsonb not null default '[]'::jsonb,
  resolution text not null default '4K',
  aspect_ratio text not null default '16:9',
  status text not null default 'Configuration_Ready',
  output_url text,
  assembly_manifest jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_assembly_project unique (project_id)
);

-- =========================================================================
-- Indexes for High Performance Queries
-- =========================================================================
create index if not exists idx_shots_project_order on public.shots(project_id, sequence_order);
create index if not exists idx_keyframes_shot on public.keyframes(shot_id);
create index if not exists idx_videos_shot on public.videos(shot_id);
create index if not exists idx_jobs_project_status on public.generation_jobs(project_id, status);
create index if not exists idx_assets_project on public.assets(project_id);

-- =========================================================================
-- Row Level Security (RLS)
-- =========================================================================
alter table public.projects enable row level security;
alter table public.creative_briefs enable row level security;
alter table public.creative_concepts enable row level security;
alter table public.shots enable row level security;
alter table public.assets enable row level security;
alter table public.shot_references enable row level security;
alter table public.keyframes enable row level security;
alter table public.videos enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.final_assemblies enable row level security;

-- Public / Anon policies for workstation operation
create policy "Allow all actions for authenticated and anon client" on public.projects for all using (true) with check (true);
create policy "Allow all actions on briefs" on public.creative_briefs for all using (true) with check (true);
create policy "Allow all actions on concepts" on public.creative_concepts for all using (true) with check (true);
create policy "Allow all actions on shots" on public.shots for all using (true) with check (true);
create policy "Allow all actions on assets" on public.assets for all using (true) with check (true);
create policy "Allow all actions on shot_references" on public.shot_references for all using (true) with check (true);
create policy "Allow all actions on keyframes" on public.keyframes for all using (true) with check (true);
create policy "Allow all actions on videos" on public.videos for all using (true) with check (true);
create policy "Allow all actions on jobs" on public.generation_jobs for all using (true) with check (true);
create policy "Allow all actions on assemblies" on public.final_assemblies for all using (true) with check (true);

-- =========================================================================
-- Storage Bucket Setup (execute in Supabase dashboard / migration)
-- =========================================================================
-- insert into storage.buckets (id, name, public) values ('cinematic-vault', 'cinematic-vault', true) on conflict do nothing;
-- create policy "Public Access to cinematic-vault" on storage.objects for select using (bucket_id = 'cinematic-vault');
-- create policy "Authenticated and anon upload to cinematic-vault" on storage.objects for insert with check (bucket_id = 'cinematic-vault');
