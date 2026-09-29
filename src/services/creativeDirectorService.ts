import { CreativeBrief, CreativeConcept, ShotSequenceItem } from '../types';

/**
 * Creative Director Service
 * Clean provider abstraction layer.
 * Will connect to backend OpenAI route in subsequent phase.
 */

export interface ICreativeDirectorProvider {
  synthesizeConcept(
    brief: CreativeBrief,
    onProgress?: (step: string) => void
  ): Promise<CreativeConcept>;
}

class ArchitecturalCreativeDirectorProvider implements ICreativeDirectorProvider {
  async synthesizeConcept(
    brief: CreativeBrief,
    onProgress?: (step: string) => void
  ): Promise<CreativeConcept> {
    const productName = (brief.product_name || 'NOVAIR ONE').trim().toUpperCase();
    const objective = brief.objective || 'Product Launch';
    const primaryMood = brief.visual_moods?.length
      ? brief.visual_moods.join(', ')
      : brief.mood || 'Minimal, Cinematic, Luxury';
    const envChoice = brief.environment || 'Dark Studio';
    const cameraChoice = brief.camera_language || 'Slow Push';

    // Progressive generation phases with realistic pauses
    onProgress?.('Analyzing brief...');
    await new Promise((resolve) => setTimeout(resolve, 600));

    onProgress?.('Defining visual language...');
    await new Promise((resolve) => setTimeout(resolve, 700));

    onProgress?.('Building cinematic structure...');
    await new Promise((resolve) => setTimeout(resolve, 700));

    onProgress?.('Planning shot sequence...');
    await new Promise((resolve) => setTimeout(resolve, 600));

    const shotSequence: ShotSequenceItem[] = [
      {
        shot_number: 'K01',
        title: 'INTRODUCTION',
        purpose: `Establish atmospheric silhouette and iconic geometry of ${productName}.`,
        description: `Silhouette of ${productName} gradually emerging from atmospheric void. Subtle rim light sweeps across the primary contour.`,
        camera: 'Slow macro push',
        lens: '85mm macro',
        environment: envChoice === 'Modern Interior' ? 'Modern Interior' : 'Dark studio',
        lighting: 'Controlled directional highlight',
        duration: 8,
        transition: 'Slow dissolve to profile'
      },
      {
        shot_number: 'K02',
        title: 'PRODUCT REVEAL',
        purpose: `Reveal sculptural form and physical presence of ${productName}.`,
        description: `A 45-degree sweeping arc revealing the interplay between brushed metal and polished crystalline surfaces.`,
        camera: '45° smooth orbit',
        lens: '50mm prime',
        environment: 'Obsidian plinth',
        lighting: 'Anamorphic rim light',
        duration: 8,
        transition: 'Whip cut on specular flare'
      },
      {
        shot_number: 'K03',
        title: 'PRODUCT DETAIL',
        purpose: `Reveal the physical tactile quality and engineering tolerances of ${productName}.`,
        description: `Extreme close-up traversing laser-etched ports, diamond-knurled dials, and acoustic diaphragms.`,
        camera: 'Slow macro push',
        lens: '85mm macro',
        environment: 'Dark studio',
        lighting: 'Controlled directional highlight',
        duration: 6,
        transition: 'Rack focus to depth'
      },
      {
        shot_number: 'K04',
        title: 'FEATURE',
        purpose: `Communicate internal thermal / acoustic resonance architecture.`,
        description: `Refraction waves passing through internal titanium lattice, visualizing performance dynamics.`,
        camera: 'Linear push forward',
        lens: '65mm anamorphic',
        environment: 'Geometric void',
        lighting: 'Pulsing wavefront light',
        duration: 8,
        transition: 'Match cut to interior'
      },
      {
        shot_number: 'K05',
        title: 'REAL-WORLD INTERIOR',
        purpose: `Situate ${productName} in contemporary architectural space.`,
        description: `${productName} resting on a brutalist cast concrete monolithic desk under grazing dusk window illumination.`,
        camera: 'Architectural tracking',
        lens: '35mm cine',
        environment: 'Brutalist concrete gallery',
        lighting: 'Natural dusk grazing light',
        duration: 8,
        transition: 'Cut to human scale'
      },
      {
        shot_number: 'K06',
        title: 'APPLICATION',
        purpose: `Demonstrate physical interaction and intuitive tactile response.`,
        description: `Fingertip grazes knurled control ring, triggering a subtle violet responsive haptic glow.`,
        camera: 'Profile low-angle tilt',
        lens: '50mm master prime',
        environment: 'Minimalist dark room',
        lighting: 'Specular edge glow',
        duration: 8,
        transition: 'Quick fade'
      },
      {
        shot_number: 'K07',
        title: 'HERO',
        purpose: `Iconic monumental portrait framing.`,
        description: `Monumental low-angle perspective with dual violet backlighting cutting through horizon haze.`,
        camera: 'Low-angle pedestal crane',
        lens: '40mm anamorphic 2x',
        environment: 'Atmospheric horizon void',
        lighting: 'Dual spectral violet rim',
        duration: 8,
        transition: 'Decelerate to stop'
      },
      {
        shot_number: 'K08',
        title: 'FINAL FRAME',
        purpose: `Cinematic brand lockup and memory anchor.`,
        description: `${productName} stabilizes in geometric equilibrium. Clean typographic lockup illuminated in titanium silver.`,
        camera: 'Static precision lockup',
        lens: '50mm macro prime',
        environment: 'Pure architectural black',
        lighting: 'Controlled studio fade',
        duration: 8,
        transition: 'Fade to black'
      }
    ];

    return {
      id: `concept-${Date.now()}`,
      title: `${productName} — Direction Synthesis`,
      concept: 'POWER, REFINED',
      concept_description: `A controlled product reveal that presents ${productName} as a precision-built piece of modern technology rather than simply an electrical appliance.`,
      creative_direction_prose: `A disciplined, cinematic visual approach designed for ${objective}. The emotional tone balances quiet authority with visceral engineering precision. Rather than frantic cuts or decorative filler, the film relies on deliberate macro choreography, monolithic surfaces, and negative space to establish ${productName} as a sculptural milestone.`,
      visual_language_attributes: {
        environment: envChoice === 'Modern Interior' ? 'Modern architectural spaces with raw materials' : 'Minimal architectural spaces and dark voids',
        lighting: 'Controlled directional light with deep shadow falloff',
        materials: 'Matte surfaces, brushed metal, smoked crystal glass',
        color: 'Deep charcoal with restrained warm highlights and violet atmospheric rim accents',
        camera: `${cameraChoice || 'Slow cinematic'} movement with shallow depth of field`,
        composition: 'Centered product compositions with generous negative space'
      },
      cinematic_rules: [
        'Preserve product geometry and authentic industrial design curves.',
        'Maintain consistent product proportions across all focal lengths.',
        'Keep branding readable with high-contrast metallic typography.',
        'Avoid unnecessary visual clutter or chaotic background noise.',
        'Use controlled, physical camera movements (no unmotivated pans).',
        'Maintain lighting and material continuity between consecutive shots.',
        'Treat the product as the hero and architectural centerpiece.',
        'Avoid generic stock-photo aesthetics or over-saturated neon gimmicks.'
      ],
      visual_language: `High-contrast monochromatic materials (titanium, smoked crystalline glass, obsidian plinths). Controlled specular rim lighting with deep violet atmospheric haze. Architectural framing with zero visual clutter.`,
      camera_language: `Slow deliberate dolly moves, extreme shallow depth-of-field macro passes (85mm–100mm T2.9), and geometric tracking shots that respect the product's natural proportions.`,
      lighting: `Sculpted studio directional light, razor-thin edge highlights, and deep controlled shadow falloff with soft atmospheric violet fills.`,
      shot_sequence: shotSequence,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

let activeProvider: ICreativeDirectorProvider = new ArchitecturalCreativeDirectorProvider();

export const creativeDirectorService = {
  setProvider(provider: ICreativeDirectorProvider) {
    activeProvider = provider;
  },
  async generateConcept(
    brief: CreativeBrief,
    onProgress?: (step: string) => void
  ): Promise<CreativeConcept> {
    return activeProvider.synthesizeConcept(brief, onProgress);
  }
};
