import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Health / Provider Status API (Prompt 04 & 06/07)
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
      provider: 'OpenAI Image',
      model: 'dall-e-3',
      message: hasOpenAI
        ? 'OpenAI API key active on server'
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

// OpenAI Image Generation Proxy API (Sections 12, 13, 14, 28)
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

    // Map aspect ratio to DALL-E 3 supported dimensions
    let size = '1792x1024';
    if (aspectRatio === '9:16') {
      size = '1024x1792';
    } else if (aspectRatio === '1:1') {
      size = '1024x1024';
    }

    // Call real OpenAI Images API server-side
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: quality === 'hd' ? 'hd' : 'standard'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMessage = errData.error?.message || response.statusText;

      let errorType = 'PROVIDER_ERROR';
      if (response.status === 401) errorType = 'AUTH_ERROR';
      else if (response.status === 429) errorType = 'RATE_LIMITED';

      console.error('[OpenAI Image Error]', response.status, errMessage);

      return res.status(response.status).json({
        success: false,
        error: errorType,
        message: errMessage
      });
    }

    const data = await response.json();
    const generatedImage = data.data?.[0];

    if (!generatedImage || !generatedImage.url) {
      return res.status(500).json({
        success: false,
        error: 'PROVIDER_ERROR',
        message: 'No image URL was returned by OpenAI.'
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImage.url,
      revisedPrompt: generatedImage.revised_prompt || prompt,
      model: 'dall-e-3',
      aspectRatio,
      quality
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

// Edit Image Foundation Endpoint (Section 20)
app.post('/api/image/edit', (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'NOT_SUPPORTED',
    message: 'DALL·E 3 does not currently support inpainting masks; edit pipeline staged for upcoming image model integration.'
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
