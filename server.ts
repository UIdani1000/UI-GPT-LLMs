import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url !== 'MY_SUPABASE_URL' && key !== 'MY_SUPABASE_SERVICE_ROLE_KEY' && key !== 'MY_SUPABASE_ANON_KEY') {
    return createClient(url, key);
  }
  return null;
};

// Health / Provider Status API
app.get('/api/providers/status', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MY_OPENAI_API_KEY';
  const rawGemini = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const hasGemini = !!rawGemini && rawGemini !== 'MY_GEMINI_API_KEY';
  const hasSupabaseUrl = !!process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'MY_SUPABASE_URL';
  const hasSupabaseAnon = !!process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'MY_SUPABASE_ANON_KEY';
  const hasSupabaseService = !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'MY_SUPABASE_SERVICE_ROLE_KEY';
  const hasSupabase = hasSupabaseUrl && (hasSupabaseAnon || hasSupabaseService);

  res.json({
    openai: {
      configured: hasOpenAI,
      provider: 'OpenAI Image Generation',
      model: 'gpt-image-1',
      message: hasOpenAI
        ? 'OpenAI API key active on server (gpt-image-1)'
        : 'Add OPENAI_API_KEY to your server environment secrets.'
    },
    gemini_veo: {
      configured: hasGemini,
      provider: 'Google Gemini / Veo',
      model: 'veo-3.1-generate-preview',
      message: hasGemini
        ? 'Gemini / Veo API active on server'
        : 'Add GEMINI_API_KEY to your server environment secrets to enable live Veo video generation.'
    },
    supabase: {
      configured: hasSupabase,
      storageConfigured: hasSupabase,
      provider: 'Supabase Cloud Database & Storage',
      urlConfigured: hasSupabaseUrl,
      anonKeyConfigured: hasSupabaseAnon,
      serviceRoleConfigured: hasSupabaseService,
      message: hasSupabase
        ? 'Supabase Cloud persistence & storage active'
        : 'Configure SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY to enable cloud persistence.'
    },
    final_assembly: {
      configured: false,
      provider: 'Media Processing Pipeline',
      status: 'Configuration_Ready',
      message: 'Server-side media encoder requires FFmpeg / cloud transcoder integration. Sequence EDL export available.'
    }
  });
});

// Safe Supabase Client Config Endpoint (Zero Secret Leaks)
app.get('/api/supabase/config', (req, res) => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const isConfigured = !!url && url !== 'MY_SUPABASE_URL' && !!anonKey && anonKey !== 'MY_SUPABASE_ANON_KEY';

  if (!isConfigured) {
    return res.json({
      configured: false,
      message: 'Supabase credentials not configured. Local Storage Vault active.'
    });
  }

  // Return ONLY public anon key and URL — NEVER service role key!
  res.json({
    configured: true,
    url,
    anonKey
  });
});

// OpenAI Image Generation Proxy API
// Current official OpenAI multimodal image generation API (gpt-image-1)
app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', quality = 'standard', references = [], projectId, shotId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'A visual generation prompt is required.'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'MY_OPENAI_API_KEY') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_ERROR',
        message: 'OpenAI API key not configured on server. Add OPENAI_API_KEY to your server environment secrets.'
      });
    }

    // Map aspect ratio to OpenAI gpt-image-1 supported dimensions
    // gpt-image-1 supports: 1536x1024 (landscape / 16:9), 1024x1536 (portrait / 9:16), 1024x1024 (square / 1:1)
    let size = '1536x1024';
    if (aspectRatio === '9:16') {
      size = '1024x1536';
    } else if (aspectRatio === '1:1') {
      size = '1024x1024';
    }

    // Map quality options to gpt-image-1 supported values: 'low' | 'medium' | 'high'
    // UI provides 'standard' | 'hd'
    const mappedQuality = quality === 'hd' ? 'high' : 'medium';

    // Call OpenAI Images API with current gpt-image-1 model
    const requestPayload: Record<string, any> = {
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: mappedQuality,
      output_format: 'png'
    };

    console.log('[OpenAI Image Generation Request]', {
      model: requestPayload.model,
      size: requestPayload.size,
      quality: requestPayload.quality,
      output_format: requestPayload.output_format,
      aspectRatio,
      promptLength: prompt.length,
      referenceCount: Array.isArray(references) ? references.length : 0
    });

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMessage = errData.error?.message || response.statusText;

      let errorType = 'PROVIDER_ERROR';
      if (response.status === 401) {
        errorType = 'AUTH_ERROR';
        console.error('[OpenAI Auth Error]', response.status, 'Invalid or expired API key');
      } else if (response.status === 429) {
        errorType = 'RATE_LIMITED';
        console.error('[OpenAI Rate Limit]', response.status, 'Too many requests');
      } else if (response.status === 400) {
        errorType = 'INVALID_REQUEST';
        console.error('[OpenAI Invalid Request]', response.status, errMessage);
      } else {
        console.error('[OpenAI Provider Error]', response.status, errMessage);
      }

      return res.status(response.status).json({
        success: false,
        error: errorType,
        message: errMessage
      });
    }

    const data = await response.json();
    const generatedImage = data.data?.[0];

    if (!generatedImage) {
      return res.status(500).json({
        success: false,
        error: 'PROVIDER_ERROR',
        message: 'No image data was returned by OpenAI.'
      });
    }

    let imageUrl = '';

    // Handle gpt-image-1 base64 output
    if (generatedImage.b64_json) {
      const buffer = Buffer.from(generatedImage.b64_json, 'base64');
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const fileName = `keyframe-${shotId || Date.now()}-${Math.random().toString(36).slice(2, 7)}.png`;
          const filePath = `projects/${projectId || 'global'}/keyframes/${fileName}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('cinematic-vault')
            .upload(filePath, buffer, {
              contentType: 'image/png',
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage
              .from('cinematic-vault')
              .getPublicUrl(filePath);
            if (pubData?.publicUrl) {
              imageUrl = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('[Supabase Storage Keyframe Upload Warning]', storageErr);
        }
      }

      // Fallback to data URI if storage upload was not completed
      if (!imageUrl) {
        imageUrl = `data:image/png;base64,${generatedImage.b64_json}`;
      }
    } else if (generatedImage.url) {
      imageUrl = generatedImage.url;
    }

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        error: 'PROVIDER_ERROR',
        message: 'No valid image URL or base64 payload returned by OpenAI.'
      });
    }

    return res.json({
      success: true,
      imageUrl,
      revisedPrompt: generatedImage.revised_prompt || prompt,
      model: 'gpt-image-1',
      aspectRatio,
      quality: mappedQuality
    });
  } catch (err: any) {
    console.error('[Server Image Generation Error]', err);
    return res.status(500).json({
      success: false,
      error: 'NETWORK_ERROR',
      message: err.message || 'Network communication error connecting to OpenAI image provider.'
    });
  }
});

// Gemini / Veo Video Generation API (Prompt 04 Section 8, 9, 31)
app.post('/api/video/generate', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '16:9',
      duration = 5,
      startFrameUrl,
      endFrameUrl,
      model = 'veo-3.1-generate-preview',
      shotId,
      projectId
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'A motion prompt is required.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Gemini API key not configured on server. Add GEMINI_API_KEY to your server environment secrets.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare image payload if startFrameUrl is provided
    let imagePayload: any = undefined;
    if (startFrameUrl) {
      if (startFrameUrl.startsWith('data:image')) {
        const matches = startFrameUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          imagePayload = {
            imageBytes: matches[2],
            mimeType: matches[1]
          };
        }
      } else if (startFrameUrl.startsWith('/') || startFrameUrl.startsWith('./')) {
        // Read local file from server workspace
        const localPath = path.resolve(__dirname, startFrameUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          const fileBuffer = fs.readFileSync(localPath);
          const ext = path.extname(localPath).toLowerCase().replace('.', '');
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
          imagePayload = {
            imageBytes: fileBuffer.toString('base64'),
            mimeType
          };
        }
      }
    }

    // Call Veo model via @google/genai
    const operation = await ai.models.generateVideos({
      model: model === 'veo-3.1-lite-generate-preview' ? 'veo-3.1-lite-generate-preview' : 'veo-3.1-generate-preview',
      prompt,
      image: imagePayload,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
      }
    });

    return res.json({
      success: true,
      operationName: operation.name,
      model,
      duration,
      aspectRatio,
      isReal: true
    });
  } catch (err: any) {
    console.error('[Server Video Generation Error]', err);
    return res.status(500).json({
      success: false,
      error: 'PROVIDER_ERROR',
      message: err.message || 'Error occurred while contacting Gemini Veo video service.'
    });
  }
});

// Gemini / Veo Video Status Polling API
app.post('/api/video/status', async (req, res) => {
  try {
    const { operationName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Gemini API key not configured on server.'
      });
    }

    if (!operationName) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'operationName is required for polling.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const isDone = !!updated.done;
    let videoUrl = undefined;
    if (isDone) {
      videoUrl = updated.response?.generatedVideos?.[0]?.video?.uri;
    }

    return res.json({
      success: true,
      done: isDone,
      videoUrl,
      error: updated.error
    });
  } catch (err: any) {
    console.error('[Server Video Status Error]', err);
    return res.status(500).json({
      success: false,
      error: 'POLL_ERROR',
      message: err.message || 'Error polling video operation.'
    });
  }
});

// Final Assembly Export API (Prompt 04 Section 20 & 21)
app.post('/api/assembly/export', async (req, res) => {
  const { projectId, projectName, clips, aspectRatio, resolution } = req.body;

  return res.json({
    success: true,
    status: 'Configuration_Ready',
    message: 'Timeline EDL and sequence metadata assembled. Direct media transcoding requires FFmpeg server container module.',
    assemblyManifest: {
      projectId,
      projectName,
      aspectRatio,
      resolution,
      clipCount: clips?.length || 0,
      totalDurationSeconds: (clips || []).reduce((acc: number, c: any) => acc + (c.durationSeconds || 0), 0),
      exportedAt: new Date().toISOString()
    }
  });
});

// Edit Image Foundation Endpoint
app.post('/api/image/edit', (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'NOT_SUPPORTED',
    message: 'Image editing with mask is staged for upcoming gpt-image-1 multimodal edit pipeline.'
  });
});

// Vite Integration Setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cinematic Lab server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
