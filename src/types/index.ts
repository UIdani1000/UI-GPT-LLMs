/**
 * Cinematic Lab - Core Data Models
 * Clean TypeScript interfaces designed for easy migration to Supabase/PostgreSQL.
 */

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type TargetDuration = '15 sec' | '30 sec' | '45 sec' | '60 sec' | 'Custom';

export type ShotStatus =
  | 'PLANNED'
  | 'KEYFRAME_READY'
  | 'VIDEO_READY'
  | 'IN_PROGRESS'
  | 'FAILED'
  // Backwards compatibility with initial seed data
  | 'ready'
  | 'completed'
  | 'generating'
  | 'queued'
  | 'draft';

export type ProjectStatus = 'in_progress' | 'completed' | 'draft';

export type VideoGenStatus = 'READY' | 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface KeyframeReference {
  asset_id: string;
  type: 'product' | 'visual';
  url: string;
  name: string;
  category?: string;
}

export interface KeyframeGeneration {
  id: string;
  project_id: string;
  shot_id: string;
  version_number: number; // e.g. 1, 2, 3...
  prompt: string;
  references: KeyframeReference[];
  model: string; // e.g. "OpenAI Image (DALL·E 3)"
  aspect_ratio: AspectRatio;
  quality?: 'standard' | 'hd';
  status: 'completed' | 'failed' | 'generating';
  image_url: string;
  is_approved: boolean;
  created_at: string;
  error?: string;
  is_demo?: boolean; // distinguishes demo content from newly generated real images
}

export interface VideoGeneration {
  id: string;
  project_id: string;
  shot_id: string;
  version_number: number; // e.g. 1, 2, 3...
  motion_prompt: string;
  start_frame_url: string;
  end_frame_url?: string;
  model: string; // e.g. "Veo 3.1", "Veo 3.1 Lite"
  duration_seconds: number;
  aspect_ratio: AspectRatio;
  status: 'completed' | 'failed' | 'generating';
  video_url: string;
  is_approved: boolean;
  created_at: string;
  is_demo?: boolean; // distinguishes demo content from newly generated real videos
  error?: string;
}

export type QueueJobStatus =
  | 'READY'
  | 'QUEUED'
  | 'GENERATING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'INTERRUPTED';

export interface GenerationJob {
  id: string;
  projectId: string;
  shotId: string;
  shotNumber?: string;
  shotTitle?: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO' | 'FINAL_ASSEMBLY';
  provider: string; // e.g. "Google Gemini / Veo"
  model: string; // e.g. "veo-3.1-generate-preview"
  status: QueueJobStatus;
  progress: number; // 0 to 100
  duration?: number;
  request?: any;
  resultUrl?: string;
  isDemo?: boolean;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Shot {
  id: string;
  shot_number: string; // e.g. "K01"
  title: string; // e.g. "INTRODUCTION"
  purpose?: string; // e.g. "Reveal the physical quality of NOVAIR ONE"
  visual_description?: string; // e.g. "Macro approach in dusk void..."
  camera_type: string; // e.g. "Slow Dolly In"
  focal_length: string; // e.g. "85mm Macro"
  camera_movement?: string; // e.g. "Slow macro push"
  lens?: string; // e.g. "85mm macro"
  lighting_style: string; // e.g. "Soft Studio"
  environment: string; // e.g. "Dark Minimalist Void"
  duration_seconds: number; // e.g. 6 or 8
  transition?: string; // e.g. "Cut to macro angle"
  creative_notes?: string;
  status: ShotStatus;
  prompt: string;
  keyframe_url: string;
  start_frame_url?: string;
  end_frame_url?: string;
  approved_keyframe_id?: string;
  selected_version_id?: string;
  generations?: KeyframeGeneration[];
  video_generations?: VideoGeneration[];
  approved_video_id?: string;
  selected_video_version_id?: string;
  product_reference_ids?: string[];
  visual_reference_ids?: string[];
  video_url?: string;
  motion_prompt?: string;
  motion_preset?: string;
  model_target?: string;
  // Motion direction structured metadata (Prompt 04 Section 5)
  subject_motion?: string;
  camera_motion?: string;
  environmental_motion?: string;
  motion_intensity?: 'Minimal' | 'Controlled' | 'Cinematic' | 'Dynamic';
  motion_notes?: string;
}

export interface TimelineClip {
  id: string;
  shotId: string;
  shotNumber: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string;
  durationSeconds: number;
  trimStartSeconds: number;
  trimEndSeconds: number;
  enabled: boolean;
  transition: 'Cut' | 'Short Fade';
  order: number;
}

export interface FinalAssemblyExport {
  id: string;
  projectId: string;
  aspectRatio: AspectRatio;
  resolution: '1080p' | '4K';
  status: 'Preparing' | 'Assembling' | 'Processing' | 'Ready' | 'Failed';
  exportUrl?: string;
  message?: string;
  createdAt: string;
}

export interface CreativeConceptSection {
  title: string;
  content: string;
}

export interface ShotSequenceItem {
  shot_number: string; // "01", "K01", etc.
  title: string;
  purpose?: string;
  description: string;
  camera: string;
  lens?: string;
  lighting?: string;
  environment?: string;
  duration: number;
  transition?: string;
}

export interface VisualLanguageAttributes {
  environment: string;
  lighting: string;
  materials: string;
  color: string;
  camera: string;
  composition: string;
}

export interface CreativeConcept {
  id: string;
  title: string;
  concept: string; // e.g. "POWER, REFINED"
  concept_description?: string;
  creative_direction_prose?: string; // concise paragraph
  visual_language_attributes?: VisualLanguageAttributes;
  cinematic_rules: string[]; // e.g. ["Preserve product geometry.", ...]
  visual_language: string;
  camera_language: string;
  lighting: string;
  shot_sequence: ShotSequenceItem[];
  created_at: string;
  updated_at: string;
}

export interface CreativeBrief {
  product_name: string;
  product_description: string;
  objective?: string; // e.g. "Product Launch", "Brand Film", etc.
  visual_moods?: string[]; // e.g. ["Minimal", "Cinematic", "Luxury"]
  environment?: string; // e.g. "Dark Studio"
  camera_language?: string; // e.g. "Slow Push", "Macro"
  creative_notes?: string;
  reference_asset_ids?: string[];
  audience?: string;
  mood?: string;
  visual_references?: string[];
  creative_constraints?: string;
  output_format: AspectRatio;
  target_length: TargetDuration;
}

export interface CreativeContext {
  product: string;
  objective: string;
  mood: string[];
  environment: string;
  cameraLanguage: string;
  references: string[];
  concept: string;
  visualLanguage: VisualLanguageAttributes;
  cinematicRules: string[];
  shots: Shot[];
}

export interface Asset {
  id: string;
  project_id?: string;
  name: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  category: 'Product' | 'References' | 'Environment' | 'Lighting' | 'Brand' | 'Characters' | 'Other';
  tags: string[];
  dimensions?: string;
  size_bytes?: number;
  created_at: string;
}

export interface VideoGenerationJob {
  id: string;
  shot_id: string;
  start_frame_id: string;
  end_frame_id?: string;
  motion_prompt: string;
  duration_sec: number;
  model: 'Veo 2' | 'Runway Gen-3' | 'Kling 1.5';
  camera_motion: string;
  status: VideoGenStatus;
  progress_pct: number;
  video_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cover_image: string;
  aspect_ratio: AspectRatio;
  target_length_seconds: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  creative_brief: CreativeBrief;
  creative_concept: CreativeConcept;
  shots: Shot[];
  pinned_asset_ids: string[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  role: 'Creative Direction' | 'Keyframe Synthesis' | 'Video Generation' | 'Storage';
  provider: 'OpenAI' | 'Google Gemini / Veo' | 'Supabase' | 'Local';
  status: 'connected' | 'unconfigured' | 'mock_ready';
  details: string;
}
