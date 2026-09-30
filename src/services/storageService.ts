import { Asset } from '../types';
import { ProjectService } from './projectService';
import { supabaseService } from './supabaseService';

/**
 * Storage Service
 * Supports Supabase Storage bucket 'cinematic-vault' with local vault fallback.
 */
export const storageService = {
  async listAssets(projectId?: string, category?: string): Promise<Asset[]> {
    let assets = ProjectService.getAssets();
    if (projectId) {
      assets = assets.filter((a) => !a.project_id || a.project_id === projectId);
    }
    if (category && category !== 'All') {
      assets = assets.filter((a) => a.category === category);
    }
    return assets;
  },

  async uploadAsset(file: File, category: Asset['category'], projectId?: string): Promise<Asset> {
    let fileUrl = URL.createObjectURL(file);
    let storagePath: string | undefined = undefined;

    // Check if Supabase Storage is configured (Phase C Section 26)
    if (supabaseService.isConfigured()) {
      const uploadRes = await supabaseService.uploadAssetFile(
        projectId || 'proj-novair-one',
        file,
        file.name,
        'references'
      );
      if (uploadRes.success && uploadRes.url) {
        fileUrl = uploadRes.url;
        storagePath = uploadRes.storagePath;
      }
    }

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      project_id: projectId,
      name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      file_name: file.name,
      file_url: fileUrl,
      file_type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
      category: category || 'Product',
      tags: [category || 'Upload', storagePath ? 'Cloud Stored' : 'Local Vault'],
      dimensions: '3840x2160',
      size_bytes: file.size,
      created_at: new Date().toISOString()
    };

    ProjectService.addAsset(newAsset);
    return newAsset;
  },

  async deleteAsset(assetId: string): Promise<void> {
    ProjectService.deleteAsset(assetId);
  }
};
