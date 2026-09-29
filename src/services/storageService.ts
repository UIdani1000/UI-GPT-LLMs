import { Asset } from '../types';
import { ProjectService } from './projectService';

/**
 * Storage Service
 * Abstracted for local memory / Supabase Storage migration.
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
    // Generate object URL or data URL
    const objectUrl = URL.createObjectURL(file);
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      project_id: projectId,
      name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      file_name: file.name,
      file_url: objectUrl,
      file_type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
      category: category || 'Product',
      tags: [category || 'Upload', 'Local Asset'],
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
