import { Project, Shot, Asset } from '../types';

// Real high-fidelity generated images
const NOVAIR_HERO = '/src/assets/images/novair_hero_keyframe_1790697581794.jpg';
const NOVAIR_REVEAL = '/src/assets/images/novair_reveal_keyframe_1790697594253.jpg';
const NOVAIR_MACRO = '/src/assets/images/novair_macro_keyframe_1790697605370.jpg';
const NOVAIR_INTERIOR = '/src/assets/images/novair_interior_keyframe_1790697616620.jpg';
const NOIRE_HERO = '/src/assets/images/noire_watch_hero_1790697626628.jpg';

export const INITIAL_SHOTS_NOVAIR: Shot[] = [
  {
    id: 'shot-k01',
    shot_number: 'K01',
    title: 'INTRODUCTION',
    purpose: 'Establish atmospheric silhouette and iconic geometry of NOVAIR ONE.',
    visual_description: 'Silhouette of NOVAIR ONE gradually emerging from atmospheric void. Subtle rim light sweeps across the primary contour.',
    camera_type: 'Macro Slow Dolly In',
    focal_length: '85mm Macro',
    camera_movement: 'Slow macro push',
    lens: '85mm macro',
    lighting_style: 'Subtle Rim Illumination',
    environment: 'Deep Atmospheric Void',
    duration_seconds: 8,
    transition: 'Slow dissolve to profile',
    creative_notes: 'Keep ambient sound at sub-bass hum. Rim light should reveal bead-blasted titanium texture.',
    status: 'VIDEO_READY',
    prompt: 'Cinematic commercial product photograph of a futuristic luxury spatial audio headphone sculptured from bead-blasted dark titanium and smoked crystal, resting in a dark minimalist architectural studio, dramatic soft purple and violet rim illumination, deep moody shadows, ultra high-end industrial design aesthetic, 8k commercial film still',
    keyframe_url: NOVAIR_HERO,
    video_url: NOVAIR_HERO,
    motion_prompt: 'Slow imperceptible dolly creeping in toward the titanium edge, volumetric violet atmospheric haze parting slightly',
    motion_preset: 'Dolly In (Slow)',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k02',
    shot_number: 'K02',
    title: 'PRODUCT REVEAL',
    purpose: 'Reveal sculptural form, headband architecture, and physical presence.',
    visual_description: 'A 45-degree sweeping arc revealing the interplay between brushed metal and polished crystalline surfaces.',
    camera_type: 'Sweeping 45° Orbit',
    focal_length: '50mm Prime',
    camera_movement: '45° smooth orbit',
    lens: '50mm prime',
    lighting_style: 'Anamorphic Edge Flare',
    environment: 'Polished Obsidian Plinth',
    duration_seconds: 8,
    transition: 'Whip cut on specular flare',
    creative_notes: 'Obsidian plinth acts as dark mirror. Reflection must stay clean.',
    status: 'VIDEO_READY',
    prompt: 'Cinematic wide-angle product reveal of a sleek dark titanium acoustic device hovering slightly above a dark polished obsidian pedestal, ethereal atmospheric purple haze, controlled studio reflections, cinematic anamorphic lighting, luxury tech commercial aesthetic',
    keyframe_url: NOVAIR_REVEAL,
    video_url: NOVAIR_REVEAL,
    motion_prompt: 'Smooth continuous orbit around the headband curve revealing the mirror titanium curvature and obsidian pedestal reflection',
    motion_preset: 'Orbit Left 45°',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k03',
    shot_number: 'K03',
    title: 'PRODUCT DETAIL',
    purpose: 'Reveal the physical quality of NOVAIR ONE.',
    visual_description: 'Extreme close-up traversing laser-etched ports, diamond-knurled dials, and acoustic diaphragms.',
    camera_type: 'Ultra Macro Rack Focus',
    focal_length: '85mm Macro',
    camera_movement: 'Slow macro push',
    lens: '85mm macro',
    lighting_style: 'Controlled Directional Highlight',
    environment: 'Dark Studio',
    duration_seconds: 6,
    transition: 'Rack focus to depth',
    creative_notes: 'T2.9 aperture for razor-thin depth of field. Diamond knurling must catch light.',
    status: 'KEYFRAME_READY',
    prompt: 'Cinematic extreme macro 85mm photograph of precision laser-etched acoustic titanium diaphragm mesh and knurled aerospace metal dial, razor shallow depth of field, dramatic directional soft studio light with subtle magenta purple accents, Leica optics',
    keyframe_url: NOVAIR_MACRO,
    motion_prompt: 'Rack focus from the outer knurled dial to the acoustic diaphragm mesh, micro-haptic rotation click feedback',
    motion_preset: 'Rack Focus + Pan',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k04',
    shot_number: 'K04',
    title: 'FEATURE',
    purpose: 'Communicate internal acoustic resonance wavefront and titanium lattice.',
    visual_description: 'Visualization of internal acoustics through ethereal refraction waves across the metal lattice.',
    camera_type: 'High-speed Phantom 4K',
    focal_length: '65mm Anamorphic',
    camera_movement: 'Linear push forward',
    lens: '65mm anamorphic',
    lighting_style: 'Pulsing Wavefront Light',
    environment: 'Geometric Resonance Field',
    duration_seconds: 8,
    transition: 'Match cut to interior',
    creative_notes: 'Light pulses at exactly 40Hz resonant frequency visual simulation.',
    status: 'KEYFRAME_READY',
    prompt: 'Macro shot of acoustic spatial chamber with ethereal soundwave reflections, bead-blasted dark metal framing, subtle purple glow along acoustic channels',
    keyframe_url: NOVAIR_MACRO,
    motion_prompt: 'Pulsing sonic ripple visualized through light refracting across the titanium mesh grill',
    motion_preset: 'Linear Push Forward',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k05',
    shot_number: 'K05',
    title: 'REAL-WORLD INTERIOR',
    purpose: 'Situate NOVAIR ONE in contemporary architectural space.',
    visual_description: 'NOVAIR ONE resting on a brutalist cast concrete monolithic desk under grazing dusk window illumination.',
    camera_type: 'Architectural Tracking Shot',
    focal_length: '35mm Cine',
    camera_movement: 'Architectural tracking',
    lens: '35mm cine',
    lighting_style: 'Natural Dusk Grazing Light',
    environment: 'Brutalist Concrete Gallery',
    duration_seconds: 8,
    transition: 'Cut to human scale',
    creative_notes: 'Architectural purity. Concrete texture contrasts cold titanium smoothly.',
    status: 'KEYFRAME_READY',
    prompt: 'Architectural interior photograph of a luxury dark titanium audio product resting on a brutalist cast concrete monolithic desk, moody dusk ambient light through tall minimalist window, atmospheric haze, museum gallery aesthetic',
    keyframe_url: NOVAIR_INTERIOR,
    motion_prompt: 'Slow horizontal slide across the concrete monolith surface, soft natural shadows lengthening in dusk window light',
    motion_preset: 'Truck Right',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k06',
    shot_number: 'K06',
    title: 'APPLICATION',
    purpose: 'Demonstrate physical interaction and intuitive tactile haptic response.',
    visual_description: 'Fingertip grazes knurled control ring, triggering a subtle violet responsive haptic glow.',
    camera_type: 'Profile Low-Angle Tilt',
    focal_length: '50mm Master Prime',
    camera_movement: 'Profile low-angle tilt',
    lens: '50mm master prime',
    lighting_style: 'Specular Edge Glow',
    environment: 'Minimalist Dark Spatial Room',
    duration_seconds: 8,
    transition: 'Quick fade',
    creative_notes: 'Subtle human presence without showing distracting full face.',
    status: 'PLANNED',
    prompt: 'Silhouette silhouette profile of human hand approaching the knurled dial of the titanium audio device, subtle haptic ring light pulsing in violet',
    keyframe_url: '',
    motion_prompt: 'Fingertip grazes the knurled crown, immediate subtle haptic light aura radiates outwards',
    motion_preset: 'Tilt Up & Hold',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k07',
    shot_number: 'K07',
    title: 'HERO',
    purpose: 'Iconic monumental portrait framing with atmospheric presence.',
    visual_description: 'Monumental low-angle perspective with dual violet backlighting cutting through horizon haze.',
    camera_type: 'Dramatic Low-Angle Crane',
    focal_length: '40mm Anamorphic 2x',
    camera_movement: 'Low-angle pedestal crane',
    lens: '40mm anamorphic 2x',
    lighting_style: 'Dual Spectral Violet Rim',
    environment: 'Architectural Void with Horizon Fog',
    duration_seconds: 8,
    transition: 'Decelerate to stop',
    creative_notes: 'Slowest camera move in the entire film. Pure sculptural authority.',
    status: 'PLANNED',
    prompt: 'Monumental low-angle profile of NOVAIR ONE suspended against deep atmospheric horizon, dual violet and deep purple backlight creating an ethereal aura, commercial film still',
    keyframe_url: '',
    motion_prompt: 'Epic slow pedestal crane lowering down, headlamps of studio grid catching the titanium brushed grain',
    motion_preset: 'Crane Down',
    model_target: 'Veo 2'
  },
  {
    id: 'shot-k08',
    shot_number: 'K08',
    title: 'FINAL FRAME',
    purpose: 'Cinematic brand lockup and memory anchor.',
    visual_description: 'Product stabilizes in geometric equilibrium. Clean typographic lockup illuminated in titanium silver.',
    camera_type: 'Static Optical Precision',
    focal_length: '50mm Macro Prime',
    camera_movement: 'Static precision lockup',
    lens: '50mm macro prime',
    lighting_style: 'Controlled Studio Fade',
    environment: 'Pure Architectural Black',
    duration_seconds: 8,
    transition: 'Fade to black',
    creative_notes: 'Zero camera shake. Monolithic stability before fade out.',
    status: 'PLANNED',
    prompt: 'Precision centered framing of NOVAIR ONE resting in silence, subtle typographic mark NOVAIR ONE illuminated in pristine silver typography below, 8k commercial end frame',
    keyframe_url: '',
    motion_prompt: 'Product stabilizes in perfect center frame, subtle light shimmer passes left to right across the brand wordmark',
    motion_preset: 'Static Lockup',
    model_target: 'Veo 2'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-novair-one',
    name: 'NOVAIR ONE',
    tagline: 'Power, refined.',
    description: 'A controlled product reveal that presents NOVAIR ONE as a precision-built piece of modern technology rather than simply an electrical appliance.',
    cover_image: NOVAIR_HERO,
    aspect_ratio: '16:9',
    target_length_seconds: 64,
    status: 'in_progress',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-29T08:30:00Z',
    pinned_asset_ids: ['asset-1', 'asset-2', 'asset-3'],
    creative_brief: {
      product_name: 'NOVAIR ONE',
      product_description: 'A premium cinematic product film introducing NOVAIR ONE, an uncompromising spatial acoustic instrument crafted from bead-blasted aerospace titanium, smoked optical crystal, and custom diamond-cut haptic knurling.',
      objective: 'Product Launch',
      visual_moods: ['Minimal', 'Cinematic', 'Luxury', 'Architectural'],
      environment: 'Dark Studio',
      camera_language: 'Slow Push',
      creative_notes: 'Preserve product geometry. Zero frantic cuts. Every motion must feel controlled, heavy, and purposeful.',
      audience: 'Audiophile purists, industrial design collectors, high-end creative professionals',
      mood: 'Monolithic, quiet power, architectural serenity, surgical precision, nocturnal luxury',
      visual_references: ['B&O Form 1 legacy', 'Dieter Rams functionalism', 'Brutalist cast concrete architecture'],
      creative_constraints: 'Zero cheesy tech jargon. Avoid stock photo aesthetic.',
      output_format: '16:9',
      target_length: '60 sec',
      reference_asset_ids: ['asset-1', 'asset-2', 'asset-3']
    },
    creative_concept: {
      id: 'concept-novair',
      title: 'POWER, REFINED',
      concept: 'POWER, REFINED',
      concept_description: 'A controlled product reveal that presents NOVAIR ONE as a precision-built piece of modern technology rather than simply an electrical appliance.',
      creative_direction_prose: 'A disciplined, cinematic visual approach designed for Product Launch. The emotional tone balances quiet authority with visceral engineering precision. Rather than frantic cuts or decorative filler, the film relies on deliberate macro choreography, monolithic surfaces, and negative space to establish NOVAIR ONE as a sculptural milestone.',
      visual_language_attributes: {
        environment: 'Minimal architectural spaces',
        lighting: 'Controlled directional light',
        materials: 'Matte surfaces, brushed metal, glass',
        color: 'Deep charcoal with restrained warm highlights',
        camera: 'Slow cinematic movement',
        composition: 'Centered product compositions with generous negative space'
      },
      cinematic_rules: [
        'Preserve product geometry.',
        'Maintain consistent product proportions.',
        'Keep branding readable.',
        'Avoid unnecessary visual clutter.',
        'Use controlled camera movement.',
        'Maintain continuity between shots.',
        'Treat the product as the hero.',
        'Avoid generic stock-photo aesthetics.'
      ],
      visual_language: 'Minimal architectural environments, controlled specular reflections on dark metal, obsidian plinths, and atmospheric dusk fog.',
      camera_language: 'Slow deliberate dolly movements, razor-shallow macro focal planes (85mm–100mm), and controlled architectural perspectives.',
      lighting: 'Soft directional studio illumination with deep controlled shadows and subtle violet spectral rim accents.',
      shot_sequence: INITIAL_SHOTS_NOVAIR.map((s, idx) => ({
        shot_number: s.shot_number,
        title: s.title,
        purpose: s.purpose,
        description: s.visual_description || s.prompt,
        camera: s.camera_movement || s.camera_type,
        lens: s.lens || s.focal_length,
        environment: s.environment,
        lighting: s.lighting_style,
        duration: s.duration_seconds,
        transition: s.transition
      })),
      created_at: '2026-09-15T11:00:00Z',
      updated_at: '2026-09-20T14:30:00Z'
    },
    shots: INITIAL_SHOTS_NOVAIR
  },
  {
    id: 'proj-noire',
    name: 'NOIRÉ',
    tagline: 'Time measured in mechanical micro-shadows.',
    description: 'An open-worked mechanical chronograph crafted from single-block black ceramic with exposed purple-anodized balance wheels.',
    cover_image: NOIRE_HERO,
    aspect_ratio: '16:9',
    target_length_seconds: 45,
    status: 'in_progress',
    created_at: '2026-09-20T14:00:00Z',
    updated_at: '2026-09-28T16:00:00Z',
    pinned_asset_ids: ['asset-4', 'asset-5'],
    creative_brief: {
      product_name: 'NOIRÉ Chronograph',
      product_description: 'An open-worked mechanical chronograph crafted from single-block black ceramic with exposed purple-anodized balance wheels and sapphire crystal casing.',
      objective: 'Brand Film',
      visual_moods: ['Cinematic', 'Luxury', 'Dramatic', 'Technical'],
      environment: 'Dark Studio',
      camera_language: 'Macro',
      output_format: '16:9',
      target_length: '45 sec',
      reference_asset_ids: ['asset-4']
    },
    creative_concept: {
      id: 'concept-noire',
      title: 'OSCILLATION IN DARKNESS',
      concept: 'OSCILLATION IN DARKNESS',
      concept_description: 'Time measured in mechanical micro-shadows.',
      creative_direction_prose: 'High-contrast monochromatic study of micro-mechanical horology and friction-free balance wheel oscillation.',
      visual_language_attributes: {
        environment: 'Pitch black acoustic chamber and liquid obsidian plinth',
        lighting: 'Single overhead Fresnel beam with deep violet rim falloff',
        materials: 'Matte obsidian ceramic, anti-reflective sapphire crystal, titanium',
        color: 'Monochrome obsidian black with pinpoint purple luminescence',
        camera: 'Extreme close-up macro sweeps traversing balance springs',
        composition: 'Macro asymmetry with extreme optical magnification'
      },
      cinematic_rules: [
        'Preserve gear teeth micro-geometry and horological authenticity.',
        'Keep balance spring frequency consistent throughout cuts.',
        'Avoid digital motion blur that obscures escapement physics.'
      ],
      visual_language: 'Pitch black backdrop, pinpoint rim lighting, high-contrast reflections across chamfered ceramic edges.',
      camera_language: 'Extreme close-up macro sweeps traversing balance springs and escapement wheels.',
      lighting: 'Single overhead Fresnel beam with deep violet rim falloff.',
      shot_sequence: [
        { shot_number: 'K01', title: 'EMERGENCE', description: 'Ceramic bezel emerges from obsidian fluid', camera: 'Macro 100mm', duration: 6 },
        { shot_number: 'K02', title: 'BALANCE WHEEL', description: 'High-speed oscillation of tourbillon cage', camera: 'Phantom 4K 1000fps', duration: 8 }
      ],
      created_at: '2026-09-20T14:30:00Z',
      updated_at: '2026-09-20T14:30:00Z'
    },
    shots: [
      {
        id: 'noire-k01',
        shot_number: 'K01',
        title: 'EMERGENCE',
        purpose: 'Introduce the matte ceramic case surfacing from reflective fluid.',
        visual_description: 'Slow emergence from liquid obsidian, droplets beading off sapphire crystal.',
        camera_type: 'Macro 100mm',
        focal_length: '100mm Prime',
        camera_movement: 'Slow dolly up',
        lens: '100mm macro',
        lighting_style: 'Specular Edge',
        environment: 'Liquid Obsidian',
        duration_seconds: 6,
        status: 'KEYFRAME_READY',
        prompt: 'Cinematic commercial product still of a high-end luxury mechanical watch crafted from matte black obsidian ceramic with exposed micro-mechanical tourbillon movement',
        keyframe_url: NOIRE_HERO,
        motion_prompt: 'Slow emergence from liquid surface, droplets beading off anti-reflective sapphire',
        motion_preset: 'Slow Dolly Up'
      },
      {
        id: 'noire-k02',
        shot_number: 'K02',
        title: 'TOURBILLON OSCILLATION',
        purpose: 'Highlight high-frequency mechanical tourbillon assembly.',
        visual_description: 'Continuous 360 degree rotation matching escapement frequency in vacuum.',
        camera_type: 'Probe Lens Tracking',
        focal_length: '24mm Probe T14',
        camera_movement: 'Axial rotation',
        lens: '24mm probe',
        lighting_style: 'Pinpoint Fiber Optic',
        environment: 'Casing Interior',
        duration_seconds: 8,
        status: 'KEYFRAME_READY',
        prompt: 'Extreme close up of ceramic tourbillon cage rotating in vacuum with purple anodized weights',
        keyframe_url: NOIRE_HERO,
        motion_prompt: 'Continuous 360 degree rotation matching escapement frequency',
        motion_preset: 'Axial Rotation'
      }
    ]
  },
  {
    id: 'proj-eleve',
    name: 'ÉLÉVÉ',
    tagline: 'Silent lift without turbulence.',
    description: 'An autonomous personal aerial mobility craft shaped by wind tunnel simulations, composed of autoclaved carbon fiber.',
    cover_image: NOVAIR_REVEAL,
    aspect_ratio: '16:9',
    target_length_seconds: 30,
    status: 'draft',
    created_at: '2026-09-24T09:00:00Z',
    updated_at: '2026-09-26T12:00:00Z',
    pinned_asset_ids: [],
    creative_brief: {
      product_name: 'ÉLÉVÉ Aero Flightcraft',
      product_description: 'An autonomous personal aerial mobility craft shaped by wind tunnel simulations, composed of autoclaved carbon fiber and electromagnetic levitation rotors.',
      objective: 'Product Advertisement',
      visual_moods: ['Futuristic', 'Minimal', 'Cinematic'],
      environment: 'Modern Interior',
      camera_language: 'Tracking',
      output_format: '16:9',
      target_length: '30 sec'
    },
    creative_concept: {
      id: 'concept-eleve',
      title: 'AQUEOUS GRAVITY',
      concept: 'AQUEOUS GRAVITY',
      concept_description: 'Silent lift without turbulence.',
      creative_direction_prose: 'Clean aerodynamic lines, misty dawn horizon, carbon weave micro-textures.',
      visual_language_attributes: {
        environment: 'Glass and concrete architectural hangar with mountain dawn vista',
        lighting: 'Soft alpine dawn gradient fading into deep dusk violet',
        materials: 'Autoclaved carbon fiber weave, electromagnetic induction coils',
        color: 'Cool slate gray, aero frost blue, warm dawn rim highlights',
        camera: 'Wide anamorphic horizons with sweeping dynamic chase cameras',
        composition: 'Expansive negative space emphasizing weightless float'
      },
      cinematic_rules: [
        'Emphasize silent, effortless lift rather than violent thrust.',
        'Preserve aerodynamic wind-tunnel curvature in silhouette.',
        'Maintain scale continuity relative to landscape.'
      ],
      visual_language: 'Clean aerodynamic lines, misty dawn horizon, carbon weave micro-textures.',
      camera_language: 'Wide anamorphic horizons with sweeping dynamic chase cameras.',
      lighting: 'Soft alpine dawn gradient fading into deep dusk violet.',
      shot_sequence: [
        { shot_number: 'K01', title: 'DAWN HANGAR', description: 'Silhouette resting on alpine launch terrace', camera: 'Crane Up', duration: 6 }
      ],
      created_at: '2026-09-24T09:30:00Z',
      updated_at: '2026-09-24T09:30:00Z'
    },
    shots: [
      {
        id: 'eleve-k01',
        shot_number: 'K01',
        title: 'DAWN HANGAR',
        purpose: 'Establish weightless aesthetic and architectural hangar scale.',
        visual_description: 'Silhouette resting on alpine launch terrace overlooking mist.',
        camera_type: 'Follow Drone',
        focal_length: '28mm Anamorphic',
        camera_movement: 'Fly through',
        lens: '28mm anamorphic',
        lighting_style: 'Alpine Dawn Rim',
        environment: 'Glass & Concrete Hangar',
        duration_seconds: 6,
        status: 'PLANNED',
        prompt: 'Minimalist carbon fiber personal aerial craft standing in an architectural hangar overlooking mist-covered mountains at dawn',
        keyframe_url: NOVAIR_REVEAL,
        motion_prompt: 'Smooth drone push through open glass hangar bay toward the vehicle cockpit',
        motion_preset: 'Fly Through'
      }
    ]
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    project_id: 'proj-novair-one',
    name: 'Titanium Headband CAD Reference',
    file_name: 'novair_cad_profile_01.png',
    file_url: NOVAIR_HERO,
    file_type: 'image',
    category: 'Product',
    tags: ['CAD', 'Titanium', 'Profile'],
    dimensions: '3840x2160',
    size_bytes: 4200000,
    created_at: '2026-09-16T10:00:00Z'
  },
  {
    id: 'asset-2',
    project_id: 'proj-novair-one',
    name: 'Brutalist Concrete Material Board',
    file_name: 'concrete_monolith_texture.png',
    file_url: NOVAIR_INTERIOR,
    file_type: 'image',
    category: 'Environment',
    tags: ['Concrete', 'Interior', 'Brutalist'],
    dimensions: '3840x2160',
    size_bytes: 3800000,
    created_at: '2026-09-17T11:20:00Z'
  },
  {
    id: 'asset-3',
    project_id: 'proj-novair-one',
    name: 'Acoustic Diaphragm Knurling Cues',
    file_name: 'knurling_85mm_reference.png',
    file_url: NOVAIR_MACRO,
    file_type: 'image',
    category: 'Lighting',
    tags: ['Macro', 'Optics', 'Lighting'],
    dimensions: '3840x2160',
    size_bytes: 5100000,
    created_at: '2026-09-18T14:15:00Z'
  },
  {
    id: 'asset-4',
    project_id: 'proj-noire',
    name: 'Matte Obsidian Ceramic Finish',
    file_name: 'ceramic_obsidian_sample.png',
    file_url: NOIRE_HERO,
    file_type: 'image',
    category: 'References',
    tags: ['Ceramic', 'Matte', 'Horology'],
    dimensions: '3840x2160',
    size_bytes: 3100000,
    created_at: '2026-09-21T09:00:00Z'
  },
  {
    id: 'asset-5',
    project_id: 'proj-novair-one',
    name: 'Volumetric Dusk Violet Studio Plate',
    file_name: 'violet_haze_lighting_plate.png',
    file_url: NOVAIR_REVEAL,
    file_type: 'image',
    category: 'Lighting',
    tags: ['Atmosphere', 'Glow', 'Violet'],
    dimensions: '3840x2160',
    size_bytes: 4900000,
    created_at: '2026-09-22T16:30:00Z'
  }
];

const STORAGE_KEY = 'cinematic_lab_projects_v2';
const ASSETS_STORAGE_KEY = 'cinematic_lab_assets_v2';

export class ProjectService {
  static getProjects(): Project[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    // Initialize with demo data
    this.saveProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  }

  static getProjectById(id: string): Project | null {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }

  static createProject(data: Partial<Project> & { name: string; creative_brief: any }): Project {
    const projects = this.getProjects();
    const newId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: data.name,
      tagline: data.tagline || 'Power, refined.',
      description: data.description || data.creative_brief?.product_description || 'New cinematic production',
      cover_image: NOVAIR_HERO,
      aspect_ratio: data.aspect_ratio || '16:9',
      target_length_seconds: data.target_length_seconds || 60,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pinned_asset_ids: [],
      creative_brief: {
        product_name: data.name,
        product_description: data.creative_brief?.product_description || '',
        objective: data.creative_brief?.objective || 'Product Launch',
        visual_moods: data.creative_brief?.visual_moods || ['Minimal', 'Cinematic', 'Luxury'],
        environment: data.creative_brief?.environment || 'Dark Studio',
        camera_language: data.creative_brief?.camera_language || 'Slow Push',
        creative_notes: data.creative_brief?.creative_notes || '',
        audience: data.creative_brief?.audience || 'Global design community',
        mood: data.creative_brief?.mood || 'Atmospheric & Refined',
        output_format: data.aspect_ratio || '16:9',
        target_length: data.creative_brief?.target_length || '60 sec',
        visual_references: data.creative_brief?.visual_references || [],
        creative_constraints: data.creative_brief?.creative_constraints || '',
        reference_asset_ids: []
      },
      creative_concept: {
        id: `concept-${Date.now()}`,
        title: `${data.name} — Initial Direction`,
        concept: 'POWER, REFINED',
        concept_description: 'Controlled physical product reveal presenting the device as a piece of architectural sculpture.',
        creative_direction_prose: 'A disciplined, cinematic visual approach with high-end surface tactile framing and controlled negative space.',
        visual_language_attributes: {
          environment: 'Minimal architectural spaces',
          lighting: 'Controlled directional light',
          materials: 'Matte surfaces, brushed metal, glass',
          color: 'Deep charcoal with restrained warm highlights',
          camera: 'Slow cinematic movement',
          composition: 'Centered product compositions with generous negative space'
        },
        cinematic_rules: [
          'Preserve product geometry.',
          'Maintain consistent product proportions.',
          'Keep branding readable.',
          'Avoid unnecessary visual clutter.',
          'Use controlled camera movement.',
          'Maintain continuity between shots.',
          'Treat the product as the hero.',
          'Avoid generic stock-photo aesthetics.'
        ],
        visual_language: 'Monochromatic architectural environment with high-end surface tactile framing.',
        camera_language: 'Smooth deliberate camera tracking, 85mm macro focal depth, controlled perspectives.',
        lighting: 'Directional softbox with subtle deep violet rim accents.',
        shot_sequence: [
          { shot_number: 'K01', title: 'APPROACH', description: 'Low angle reveal in silhouette void', camera: 'Slow Dolly In', duration: 8 },
          { shot_number: 'K02', title: 'CHASSIS ROTATION', description: 'Controlled 45 degree orbit around key surface', camera: 'Orbit Right', duration: 8 },
          { shot_number: 'K03', title: 'MATERIAL DETAIL', description: 'Macro focus on precision textures', camera: 'Macro 85mm', duration: 8 },
          { shot_number: 'K04', title: 'FINAL LOCKUP', description: 'Product stabilizes with title typography', camera: 'Static Lockup', duration: 8 }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      shots: [
        {
          id: `shot-${Date.now()}-1`,
          shot_number: 'K01',
          title: 'APPROACH',
          purpose: `Establish atmospheric silhouette and iconic geometry of ${data.name}.`,
          visual_description: 'Low angle reveal in silhouette void with grazing edge illumination.',
          camera_type: 'Macro Slow Dolly In',
          focal_length: '85mm Macro',
          camera_movement: 'Slow macro push',
          lens: '85mm macro',
          lighting_style: 'Subtle Rim Illumination',
          environment: 'Deep Atmospheric Void',
          duration_seconds: 8,
          transition: 'Slow dissolve to profile',
          status: 'PLANNED',
          prompt: `Cinematic commercial still of ${data.name}, studio lighting, violet atmospheric rim light, 8k film still`,
          keyframe_url: NOVAIR_HERO,
          motion_prompt: 'Slow smooth push-in along the horizontal axis',
          motion_preset: 'Dolly In',
          model_target: 'Veo 2'
        },
        {
          id: `shot-${Date.now()}-2`,
          shot_number: 'K02',
          title: 'CHASSIS ROTATION',
          purpose: `Reveal sculptural form and physical presence of ${data.name}.`,
          visual_description: 'Controlled 45 degree orbit around primary chassis curvature.',
          camera_type: 'Orbit Right 45°',
          focal_length: '50mm Prime',
          camera_movement: '45° smooth orbit',
          lens: '50mm prime',
          lighting_style: 'Specular Edge Flare',
          environment: 'Dark Architecture',
          duration_seconds: 8,
          transition: 'Whip cut on highlight',
          status: 'PLANNED',
          prompt: `Sleek wide shot revealing ${data.name} contours in dark reflective studio, moody purple glow`,
          keyframe_url: NOVAIR_REVEAL,
          motion_prompt: 'Smooth continuous orbit around main geometry',
          motion_preset: 'Orbit Right 45°',
          model_target: 'Veo 2'
        }
      ]
    };

    projects.unshift(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  static updateProject(project: Project): void {
    const list = this.getProjects();
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx !== -1) {
      list[idx] = { ...project, updated_at: new Date().toISOString() };
      this.saveProjects(list);
    }
  }

  static updateShot(projectId: string, updatedShot: Shot): void {
    const project = this.getProjectById(projectId);
    if (!project) return;
    const shotIdx = project.shots.findIndex((s) => s.id === updatedShot.id);
    if (shotIdx !== -1) {
      project.shots[shotIdx] = updatedShot;
      this.updateProject(project);
    }
  }

  static addShot(projectId: string, newShotData?: Partial<Shot>): Shot {
    const project = this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const nextIndex = project.shots.length + 1;
    const shotNumber = `K${nextIndex < 10 ? '0' : ''}${nextIndex}`;

    const newShot: Shot = {
      id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      shot_number: shotNumber,
      title: newShotData?.title || 'NEW SHOT',
      purpose: newShotData?.purpose || 'Highlight key architectural feature or tactile interaction.',
      visual_description: newShotData?.visual_description || 'Controlled camera movement capturing clean surface reflections.',
      camera_type: newShotData?.camera_type || 'Macro Slow Dolly In',
      focal_length: newShotData?.focal_length || '85mm Macro',
      camera_movement: newShotData?.camera_movement || 'Slow macro push',
      lens: newShotData?.lens || '85mm macro',
      lighting_style: newShotData?.lighting_style || 'Controlled Directional Highlight',
      environment: newShotData?.environment || 'Dark Studio',
      duration_seconds: newShotData?.duration_seconds || 6,
      transition: newShotData?.transition || 'Dissolve to next beat',
      creative_notes: newShotData?.creative_notes || '',
      status: 'PLANNED',
      prompt: newShotData?.prompt || `Cinematic film still of ${project.name} ${shotNumber}, dark minimalist aesthetic, 8k commercial quality`,
      keyframe_url: '',
      model_target: 'Veo 2'
    };

    project.shots.push(newShot);
    this.updateProject(project);
    return newShot;
  }

  static duplicateShot(projectId: string, shotId: string): Shot | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const sourceIdx = project.shots.findIndex((s) => s.id === shotId);
    if (sourceIdx === -1) return null;

    const source = project.shots[sourceIdx];
    const newId = `shot-dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Build duplicate without generated media
    const duplicated: Shot = {
      ...source,
      id: newId,
      title: `Copy of ${source.title}`,
      status: 'PLANNED',
      keyframe_url: '',
      video_url: undefined
    };

    // Insert directly after source shot
    project.shots.splice(sourceIdx + 1, 0, duplicated);

    // Renumber all shots visibly (K01, K02...) while keeping stable IDs
    project.shots = project.shots.map((s, idx) => ({
      ...s,
      shot_number: `K${idx + 1 < 10 ? '0' : ''}${idx + 1}`
    }));

    this.updateProject(project);
    return duplicated;
  }

  static deleteShot(projectId: string, shotId: string): void {
    const project = this.getProjectById(projectId);
    if (!project) return;

    project.shots = project.shots.filter((s) => s.id !== shotId);

    // Renumber remaining shots
    project.shots = project.shots.map((s, idx) => ({
      ...s,
      shot_number: `K${idx + 1 < 10 ? '0' : ''}${idx + 1}`
    }));

    this.updateProject(project);
  }

  static reorderShots(projectId: string, orderedShotIds: string[]): Project | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const shotMap = new Map<string, Shot>();
    project.shots.forEach((s) => shotMap.set(s.id, s));

    const reordered: Shot[] = [];
    orderedShotIds.forEach((id) => {
      const s = shotMap.get(id);
      if (s) reordered.push(s);
    });

    // Also include any shots that were not in the array just in case
    project.shots.forEach((s) => {
      if (!orderedShotIds.includes(s.id)) {
        reordered.push(s);
      }
    });

    // Renumber sequence visibly (K01, K02...)
    project.shots = reordered.map((s, idx) => ({
      ...s,
      shot_number: `K${idx + 1 < 10 ? '0' : ''}${idx + 1}`
    }));

    this.updateProject(project);
    return project;
  }

  static getAssets(): Asset[] {
    try {
      const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveAssets(INITIAL_ASSETS);
    return INITIAL_ASSETS;
  }

  static saveAssets(assets: Asset[]): void {
    try {
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    } catch {}
  }

  static addAsset(asset: Asset): void {
    const assets = this.getAssets();
    assets.unshift(asset);
    this.saveAssets(assets);
  }

  static deleteAsset(assetId: string): void {
    const assets = this.getAssets().filter((a) => a.id !== assetId);
    this.saveAssets(assets);
  }

  static addKeyframeGeneration(projectId: string, shotId: string, generation: import('../types').KeyframeGeneration): Shot | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const shot = project.shots.find((s) => s.id === shotId);
    if (!shot) return null;

    if (!shot.generations) {
      shot.generations = [];
    }

    shot.generations.push(generation);
    shot.selected_version_id = generation.id;

    this.updateProject(project);
    return shot;
  }

  static approveKeyframe(projectId: string, shotId: string, generationId: string): Shot | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const shot = project.shots.find((s) => s.id === shotId);
    if (!shot || !shot.generations) return null;

    const targetGen = shot.generations.find((g) => g.id === generationId);
    if (!targetGen) return null;

    // Mark all other versions as not approved
    shot.generations.forEach((g) => {
      g.is_approved = g.id === generationId;
    });

    shot.approved_keyframe_id = generationId;
    shot.keyframe_url = targetGen.image_url;
    shot.status = 'KEYFRAME_READY';
    shot.selected_version_id = generationId;

    this.updateProject(project);
    return shot;
  }

  static selectKeyframeVersion(projectId: string, shotId: string, generationId: string): Shot | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const shot = project.shots.find((s) => s.id === shotId);
    if (!shot) return null;

    shot.selected_version_id = generationId;
    this.updateProject(project);
    return shot;
  }

  static saveGeneratedAssetAsReference(
    projectId: string,
    assetName: string,
    imageUrl: string,
    category: import('../types').Asset['category'] = 'Product'
  ): import('../types').Asset {
    const newAsset: import('../types').Asset = {
      id: `asset-gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      project_id: projectId,
      name: assetName,
      file_name: `${assetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`,
      file_url: imageUrl,
      file_type: 'image',
      category,
      tags: ['Approved Keyframe', 'Keyframe Vault', category],
      dimensions: '1536x1024',
      size_bytes: 4200000,
      created_at: new Date().toISOString()
    };

    this.addAsset(newAsset);
    return newAsset;
  }
}

