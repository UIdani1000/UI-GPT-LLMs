import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Shot, Asset, GenerationJob, KeyframeGeneration, VideoGeneration } from '../types';

export interface SupabaseConfigStatus {
  configured: boolean;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  serviceRoleConfigured: boolean;
  message: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private configStatus: SupabaseConfigStatus = {
    configured: false,
    urlConfigured: false,
    anonKeyConfigured: false,
    serviceRoleConfigured: false,
    message: 'Checking cloud database status...'
  };
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    this.init();
  }

  public async init(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // First check client-side env variables
        const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
        const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

        if (envUrl && envKey && envUrl !== 'MY_SUPABASE_URL') {
          this.client = createClient(envUrl, envKey);
          this.configStatus = {
            configured: true,
            urlConfigured: true,
            anonKeyConfigured: true,
            serviceRoleConfigured: false,
            message: 'Supabase Cloud Vault connected via environment'
          };
          return true;
        }

        // Otherwise request safe public config from backend
        const res = await fetch('/api/supabase/config');
        if (res.ok) {
          const data = await res.json();
          if (data.configured && data.url && data.anonKey) {
            this.client = createClient(data.url, data.anonKey);
            this.configStatus = {
              configured: true,
              urlConfigured: true,
              anonKeyConfigured: true,
              serviceRoleConfigured: false,
              message: 'Supabase Cloud Vault connected'
            };
            return true;
          }
        }

        // Fetch complete status from provider matrix
        const statusRes = await fetch('/api/providers/status');
        if (statusRes.ok) {
          const matrix = await statusRes.json();
          if (matrix.supabase) {
            this.configStatus = matrix.supabase;
          }
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud connection inactive, using Local Storage Vault', err);
      }

      this.configStatus.configured = false;
      return false;
    })();

    return this.initPromise;
  }

  public isConfigured(): boolean {
    return this.configStatus.configured && this.client !== null;
  }

  public getStatus(): SupabaseConfigStatus {
    return this.configStatus;
  }

  // =========================================================================
  // Projects Persistence
  // =========================================================================

  public async getProjects(): Promise<Project[] | null> {
    await this.init();
    if (!this.client || !this.isConfigured()) return null;

    try {
      const { data: projects, error } = await this.client
        .from('projects')
        .select(`
          *,
          creative_briefs(*),
          creative_concepts(*),
          shots(
            *,
            keyframes(*),
            videos(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error || !projects) {
        console.warn('[SupabaseService] getProjects error:', error);
        return null;
      }

      // Map relational rows to clean Project shape
      return projects.map((p: any) => this.mapRowToProject(p));
    } catch (err) {
      console.warn('[SupabaseService] getProjects exception:', err);
      return null;
    }
  }

  public async getProject(projectId: string): Promise<Project | null> {
    await this.init();
    if (!this.client || !this.isConfigured()) return null;

    try {
      const { data, error } = await this.client
        .from('projects')
        .select(`
          *,
          creative_briefs(*),
          creative_concepts(*),
          shots(
            *,
            keyframes(*),
            videos(*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error || !data) return null;
      return this.mapRowToProject(data);
    } catch (err) {
      console.warn('[SupabaseService] getProject exception:', err);
      return null;
    }
  }

  public async saveProject(project: Project): Promise<boolean> {
    await this.init();
    if (!this.client || !this.isConfigured()) return false;

    try {
      // 1. Upsert Project row
      const { error: projErr } = await this.client.from('projects').upsert({
        id: project.id,
        name: project.name,
        description: project.description || '',
        tagline: project.tagline || '',
        status: project.status || 'in_progress',
        aspect_ratio: project.aspect_ratio || '16:9',
        target_length_seconds: project.target_length_seconds || 60,
        pinned_asset_ids: project.pinned_asset_ids || [],
        updated_at: new Date().toISOString()
      });

      if (projErr) throw projErr;

      // 2. Upsert Creative Brief
      if (project.creative_brief) {
        await this.client.from('creative_briefs').upsert({
          id: `brief-${project.id}`,
          project_id: project.id,
          product_name: project.creative_brief.product_name,
          product_description: project.creative_brief.product_description,
          objective: project.creative_brief.objective,
          visual_moods: project.creative_brief.visual_moods,
          mood: project.creative_brief.mood,
          environment: project.creative_brief.environment,
          camera_language: project.creative_brief.camera_language,
          lighting_style: project.creative_brief.lighting_style,
          creative_notes: project.creative_brief.creative_notes,
          visual_references: project.creative_brief.visual_references,
          reference_asset_ids: project.creative_brief.reference_asset_ids,
          target_length: project.creative_brief.target_length,
          updated_at: new Date().toISOString()
        });
      }

      // 3. Upsert Creative Concept
      if (project.creative_concept) {
        await this.client.from('creative_concepts').upsert({
          id: `concept-${project.id}`,
          project_id: project.id,
          concept: project.creative_concept.concept,
          concept_description: project.creative_concept.concept_description,
          visual_language_attributes: project.creative_concept.visual_language_attributes,
          cinematic_rules: project.creative_concept.cinematic_rules,
          shot_sequence: project.creative_concept.shot_sequence,
          updated_at: new Date().toISOString()
        });
      }

      // 4. Upsert Shots
      if (project.shots && project.shots.length > 0) {
        const shotRows = project.shots.map((s, idx) => ({
          id: s.id,
          project_id: project.id,
          sequence_order: idx,
          shot_number: s.shot_number,
          title: s.title,
          purpose: s.purpose || '',
          visual_description: s.visual_description || '',
          prompt: s.prompt || '',
          duration_seconds: s.duration_seconds || 5,
          camera_type: s.camera_type || 'Dolly',
          focal_length: s.focal_length || '85mm Macro',
          lens: s.lens || '85mm Prime',
          camera_movement: s.camera_movement || 'Slow push',
          lighting_style: s.lighting_style || 'Controlled Studio',
          environment: s.environment || 'Dark Studio',
          transition: s.transition || 'Cut',
          status: s.status || 'PLANNED',
          keyframe_url: s.keyframe_url || '',
          approved_keyframe_id: s.approved_keyframe_id,
          selected_version_id: s.selected_version_id,
          video_url: s.video_url,
          approved_video_id: s.approved_video_id,
          selected_video_version_id: s.selected_video_version_id,
          start_frame_url: s.start_frame_url,
          end_frame_url: s.end_frame_url,
          subject_motion: s.subject_motion,
          camera_motion: s.camera_motion,
          environmental_motion: s.environmental_motion,
          motion_intensity: s.motion_intensity,
          motion_notes: s.motion_notes,
          motion_prompt: s.motion_prompt,
          model_target: s.model_target,
          product_reference_ids: s.product_reference_ids || [],
          notes: s.notes || '',
          updated_at: new Date().toISOString()
        }));

        await this.client.from('shots').upsert(shotRows);
      }

      return true;
    } catch (err) {
      console.warn('[SupabaseService] saveProject failed:', err);
      return false;
    }
  }

  public async updateShot(projectId: string, shot: Shot): Promise<boolean> {
    await this.init();
    if (!this.client || !this.isConfigured()) return false;

    try {
      const { error } = await this.client.from('shots').upsert({
        id: shot.id,
        project_id: projectId,
        shot_number: shot.shot_number,
        title: shot.title,
        purpose: shot.purpose || '',
        visual_description: shot.visual_description || '',
        prompt: shot.prompt || '',
        duration_seconds: shot.duration_seconds || 5,
        camera_type: shot.camera_type,
        focal_length: shot.focal_length,
        lens: shot.lens,
        camera_movement: shot.camera_movement,
        lighting_style: shot.lighting_style,
        environment: shot.environment,
        transition: shot.transition,
        status: shot.status,
        keyframe_url: shot.keyframe_url,
        approved_keyframe_id: shot.approved_keyframe_id,
        selected_version_id: shot.selected_version_id,
        video_url: shot.video_url,
        approved_video_id: shot.approved_video_id,
        selected_video_version_id: shot.selected_video_version_id,
        start_frame_url: shot.start_frame_url,
        end_frame_url: shot.end_frame_url,
        subject_motion: shot.subject_motion,
        camera_motion: shot.camera_motion,
        environmental_motion: shot.environmental_motion,
        motion_intensity: shot.motion_intensity,
        motion_notes: shot.motion_notes,
        motion_prompt: shot.motion_prompt,
        product_reference_ids: shot.product_reference_ids || [],
        notes: shot.notes,
        updated_at: new Date().toISOString()
      });

      return !error;
    } catch (err) {
      console.warn('[SupabaseService] updateShot failed:', err);
      return false;
    }
  }

  public async reorderShots(projectId: string, orderedShotIds: string[]): Promise<boolean> {
    await this.init();
    if (!this.client || !this.isConfigured()) return false;

    try {
      const updates = orderedShotIds.map((id, index) =>
        this.client!.from('shots').update({ sequence_order: index }).eq('id', id)
      );
      await Promise.all(updates);
      return true;
    } catch (err) {
      console.warn('[SupabaseService] reorderShots failed:', err);
      return false;
    }
  }

  // =========================================================================
  // Generation Jobs Persistence (Phase D)
  // =========================================================================

  public async getGenerationJobs(projectId: string): Promise<GenerationJob[] | null> {
    await this.init();
    if (!this.client || !this.isConfigured()) return null;

    try {
      const { data, error } = await this.client
        .from('generation_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      return data.map((j: any) => ({
        id: j.id,
        projectId: j.project_id,
        shotId: j.shot_id,
        type: j.type,
        provider: j.provider,
        model: j.model,
        status: j.status,
        progress: j.progress,
        request: j.request,
        resultUrl: j.result_url,
        error: j.error,
        thumbnailUrl: j.thumbnail_url,
        shotNumber: j.shot_number,
        shotTitle: j.shot_title,
        duration: j.duration,
        isDemo: j.is_demo,
        createdAt: j.created_at,
        startedAt: j.started_at,
        completedAt: j.completed_at
      }));
    } catch (err) {
      console.warn('[SupabaseService] getGenerationJobs failed:', err);
      return null;
    }
  }

  public async saveGenerationJob(job: GenerationJob): Promise<boolean> {
    await this.init();
    if (!this.client || !this.isConfigured()) return false;

    try {
      const { error } = await this.client.from('generation_jobs').upsert({
        id: job.id,
        project_id: job.projectId,
        shot_id: job.shotId || null,
        type: job.type,
        provider: job.provider,
        model: job.model,
        status: job.status,
        progress: job.progress,
        request: job.request || {},
        result_url: job.resultUrl,
        error: job.error,
        thumbnail_url: job.thumbnailUrl,
        shot_number: job.shotNumber,
        shot_title: job.shotTitle,
        duration: job.duration,
        is_demo: job.isDemo || false,
        created_at: job.createdAt || new Date().toISOString(),
        startedAt: job.startedAt,
        completed_at: job.completedAt
      });

      return !error;
    } catch (err) {
      console.warn('[SupabaseService] saveGenerationJob failed:', err);
      return false;
    }
  }

  // =========================================================================
  // Storage Integration (Phase C)
  // =========================================================================

  public async uploadAssetFile(
    projectId: string,
    file: File | Blob,
    filename: string,
    folder: 'references' | 'keyframes' | 'videos' | 'exports' = 'references'
  ): Promise<{ success: boolean; url?: string; storagePath?: string; message?: string }> {
    await this.init();
    if (!this.client || !this.isConfigured()) {
      return {
        success: false,
        message: 'Supabase Storage is not configured. Local assets active.'
      };
    }

    try {
      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storagePath = `projects/${projectId}/${folder}/${safeFilename}`;

      const { data, error } = await this.client.storage
        .from('cinematic-vault')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { success: false, message: error.message };
      }

      const { data: publicUrlData } = this.client.storage
        .from('cinematic-vault')
        .getPublicUrl(storagePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        storagePath
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error uploading to Supabase Storage'
      };
    }
  }

  // =========================================================================
  // Internal Row Mapper
  // =========================================================================

  private mapRowToProject(row: any): Project {
    const brief = row.creative_briefs?.[0] || row.creative_briefs || {};
    const concept = row.creative_concepts?.[0] || row.creative_concepts || {};

    const shots: Shot[] = (row.shots || [])
      .sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0))
      .map((s: any) => ({
        id: s.id,
        shot_number: s.shot_number,
        title: s.title,
        purpose: s.purpose,
        visual_description: s.visual_description,
        prompt: s.prompt,
        duration_seconds: s.duration_seconds,
        camera_type: s.camera_type,
        focal_length: s.focal_length,
        lens: s.lens,
        camera_movement: s.camera_movement,
        lighting_style: s.lighting_style,
        environment: s.environment,
        transition: s.transition,
        status: s.status,
        keyframe_url: s.keyframe_url,
        approved_keyframe_id: s.approved_keyframe_id,
        selected_version_id: s.selected_version_id,
        video_url: s.video_url,
        approved_video_id: s.approved_video_id,
        selected_video_version_id: s.selected_video_version_id,
        start_frame_url: s.start_frame_url,
        end_frame_url: s.end_frame_url,
        subject_motion: s.subject_motion,
        camera_motion: s.camera_motion,
        environmental_motion: s.environmental_motion,
        motion_intensity: s.motion_intensity,
        motion_notes: s.motion_notes,
        motion_prompt: s.motion_prompt,
        model_target: s.model_target,
        product_reference_ids: s.product_reference_ids || [],
        notes: s.notes,
        generations: (s.keyframes || []).map((k: any) => ({
          id: k.id,
          shot_id: k.shot_id,
          project_id: k.project_id,
          version_number: k.version_number,
          prompt: k.prompt,
          image_url: k.image_url,
          aspect_ratio: k.aspect_ratio || '16:9',
          is_approved: k.is_approved,
          created_at: k.created_at,
          is_demo: k.is_demo
        })),
        video_generations: (s.videos || []).map((v: any) => ({
          id: v.id,
          shot_id: v.shot_id,
          project_id: v.project_id,
          version_number: v.version_number,
          motion_prompt: v.motion_prompt,
          duration_seconds: v.duration_seconds,
          aspect_ratio: v.aspect_ratio || '16:9',
          model: v.model,
          status: v.status,
          video_url: v.video_url,
          start_frame_url: v.start_frame_url,
          end_frame_url: v.end_frame_url,
          is_approved: v.is_approved,
          created_at: v.created_at,
          is_demo: v.is_demo
        }))
      }));

    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      tagline: row.tagline || '',
      status: row.status,
      aspect_ratio: row.aspect_ratio,
      target_length_seconds: row.target_length_seconds || 60,
      pinned_asset_ids: row.pinned_asset_ids || [],
      creative_brief: {
        product_name: brief.product_name || row.name,
        product_description: brief.product_description || '',
        objective: brief.objective || 'Product Launch',
        visual_moods: brief.visual_moods || ['Minimal', 'Cinematic'],
        mood: brief.mood,
        environment: brief.environment,
        camera_language: brief.camera_language,
        lighting_style: brief.lighting_style,
        creative_notes: brief.creative_notes,
        visual_references: brief.visual_references || [],
        reference_asset_ids: brief.reference_asset_ids || [],
        target_length: brief.target_length
      },
      creative_concept: {
        concept: concept.concept || 'Precision in Motion',
        concept_description: concept.concept_description,
        visual_language_attributes: concept.visual_language_attributes || {
          environment: 'Minimal architectural spaces',
          lighting: 'Controlled directional light',
          materials: 'Matte surfaces, brushed titanium, smoked crystal',
          color: 'Deep obsidian with restrained violet accents',
          camera: 'Slow cinematic movement',
          composition: 'Centered product composition'
        },
        cinematic_rules: concept.cinematic_rules || [
          'Preserve product geometry.',
          'Maintain consistent proportions.',
          'Keep branding readable.',
          'Treat the product as the hero.'
        ],
        shot_sequence: concept.shot_sequence || []
      },
      shots,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export const supabaseService = new SupabaseService();
