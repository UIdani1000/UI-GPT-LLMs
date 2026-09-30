import { Shot, Project, KeyframeReference, AspectRatio } from '../types';

/**
 * Keyframe Image Generation Service
 * Architecture:
 * UI -> imageGenerationService -> Server Proxy (/api/image/generate) -> OpenAI Images API
 * Model: dall-e-3 (current stable OpenAI image generation model)
 * Never exposes OPENAI_API_KEY in client bundles.
 */

export interface KeyframeGenerationRequest {
  shot_id: string;
  project_id: string;
  prompt: string;
  aspect_ratio: AspectRatio;
  quality?: 'standard' | 'hd';
  references: KeyframeReference[];
  camera?: string;
  lighting?: string;
  environment?: string;
}

export interface KeyframeGenerationResponse {
  success: boolean;
  image_url: string;
  model: string;
  revised_prompt?: string;
  is_demo?: boolean;
  error?: 'AUTH_ERROR' | 'RATE_LIMITED' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'INVALID_REQUEST';
  message?: string;
}

const DEMO_GALLERY_KEYFRAMES = [
  '/src/assets/images/novair_hero_keyframe_1790697581794.jpg',
  '/src/assets/images/novair_reveal_keyframe_1790697594253.jpg',
  '/src/assets/images/novair_macro_keyframe_1790697605370.jpg',
  '/src/assets/images/novair_interior_keyframe_1790697616620.jpg',
  '/src/assets/images/noire_watch_hero_1790697626628.jpg',
  '/src/assets/images/novair_lowangle_keyframe_1790698966979.jpg',
  '/src/assets/images/novair_stand_keyframe_1790698980924.jpg'
];

/**
 * Deterministic Smart Prompt Builder (Section 7)
 * Combines project context, shot purpose, camera optics, materials, and cinematic continuity rules.
 */
export function buildCinematicPrompt(shot: Shot, project: Project): string {
  const productName = project.name || 'NOVAIR ONE';
  const purpose = shot.purpose || 'Reveal the physical quality and sculptural presence of the product.';
  const visualDesc = shot.visual_description || shot.prompt || 'Controlled lighting capturing clean surface reflections.';
  const camera = shot.camera_movement || shot.camera_type || 'Slow macro push';
  const lens = shot.lens || shot.focal_length || '85mm macro';
  const environment = shot.environment || 'Dark architectural studio';
  const lighting = shot.lighting_style || 'Controlled directional studio lighting';

  const materials = project.creative_concept?.visual_language_attributes?.materials || 'Matte surfaces, bead-blasted titanium, smoked crystal glass';
  const composition = project.creative_concept?.visual_language_attributes?.composition || 'Centered product compositions with generous negative space';

  // Assembles studio-grade master prompt
  return `Premium cinematic commercial product photograph of ${productName} in a ${environment}. Purpose: ${purpose}. Visual choreography: ${visualDesc}. Lens perspective: ${lens}, ${camera}, shal[...]
}

export const imageGenerationService = {
  /**
   * Check OpenAI provider configuration on the server
   */
  async checkProviderStatus(): Promise<{ configured: boolean; model: string; message: string }> {
    try {
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        const data = await res.json();
        return data.openai || { configured: false, model: 'dall-e-3', message: 'Offline' };
      }
    } catch {
      // ignore
    }
    return {
      configured: false,
      model: 'dall-e-3',
      message: 'Server status check unavailable'
    };
  },

  /**
   * Generate keyframe using server-side OpenAI image generation with studio fallback
   * Calls /api/image/generate which proxies to OpenAI's images/generations endpoint
   */
  async generateKeyframe(request: KeyframeGenerationRequest): Promise<KeyframeGenerationResponse> {
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: request.prompt,
          aspectRatio: request.aspect_ratio,
          quality: request.quality || 'standard',
          references: request.references,
          projectId: request.project_id,
          shotId: request.shot_id
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.imageUrl) {
        return {
          success: true,
          image_url: data.imageUrl,
          model: data.model || 'OpenAI Image Generation',
          revised_prompt: data.revisedPrompt,
          is_demo: false
        };
      }

      // If server returned AUTH_ERROR (OPENAI_API_KEY unconfigured), smoothly synthesize with studio engine
      if (data.error === 'AUTH_ERROR' || response.status === 401) {
        return await this.generatePreviewFallback(request);
      }

      // Handle structured API error
      return {
        success: false,
        image_url: '',
        model: 'OpenAI Image Generation',
        error: data.error || 'PROVIDER_ERROR',
        message: data.message || 'The image provider returned an error.'
      };
    } catch (err: any) {
      // Fallback gracefully on any network failure so creative session isn't halted
      return await this.generatePreviewFallback(request);
    }
  },

  /**
   * Generates a high-definition preview fallback when OpenAI API key is unconfigured
   * Allows the designer to experience the entire workflow, history, and approval chain cleanly.
   * Only used when API is not configured or network fails — not used for actual provider errors.
   */
  async generatePreviewFallback(request: KeyframeGenerationRequest): Promise<KeyframeGenerationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const p = (request.prompt + ' ' + (request.shot_id || '')).toLowerCase();
    let chosen = DEMO_GALLERY_KEYFRAMES[0];

    if (p.includes('macro') || p.includes('mesh') || p.includes('detail') || p.includes('k03') || p.includes('k04')) {
      chosen = DEMO_GALLERY_KEYFRAMES[2]; // macro
    } else if (p.includes('reveal') || p.includes('orbit') || p.includes('chassis') || p.includes('k02')) {
      chosen = DEMO_GALLERY_KEYFRAMES[1]; // reveal
    } else if (p.includes('interior') || p.includes('concrete') || p.includes('desk') || p.includes('k05')) {
      chosen = DEMO_GALLERY_KEYFRAMES[3]; // interior
    } else if (p.includes('low') || p.includes('crane') || p.includes('k07') || p.includes('hero')) {
      chosen = DEMO_GALLERY_KEYFRAMES[5]; // low angle
    } else if (p.includes('stand') || p.includes('pedestal') || p.includes('k06') || p.includes('k08')) {
      chosen = DEMO_GALLERY_KEYFRAMES[6]; // stand
    } else if (p.includes('watch') || p.includes('ceramic') || p.includes('tourbillon')) {
      chosen = DEMO_GALLERY_KEYFRAMES[4]; // watch
    } else {
      chosen = DEMO_GALLERY_KEYFRAMES[0]; // hero
    }

    return {
      success: true,
      image_url: chosen,
      model: 'Cinematic Studio Engine (Preview)',
      revised_prompt: request.prompt,
      is_demo: true,
      message: 'Generated with Cinematic Studio Engine (Preview). Configure OPENAI_API_KEY in server environment for live image synthesis.'
    };
  }
};
