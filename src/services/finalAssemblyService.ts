import { Project, TimelineClip, FinalAssemblyExport } from '../types';

/**
 * Final Assembly Service (Prompt 04 Section 20 & 21)
 * Clean abstraction for final sequence compilation and export.
 * Exposes honest and accurate export states without faking finished MP4s.
 */
export const finalAssemblyService = {
  async exportSequence(
    project: Project,
    clips: TimelineClip[],
    resolution: '1080p' | '4K' = '4K'
  ): Promise<FinalAssemblyExport> {
    try {
      const response = await fetch('/api/assembly/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          clips,
          aspectRatio: project.aspect_ratio,
          resolution
        })
      });

      const data = await response.json();

      return {
        id: `export-${Date.now()}`,
        projectId: project.id,
        aspectRatio: project.aspect_ratio,
        resolution,
        status: 'Preparing',
        message: data.message || 'Export configuration registered. Cloud media rendering requires pipeline connection.',
        createdAt: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        id: `export-${Date.now()}`,
        projectId: project.id,
        aspectRatio: project.aspect_ratio,
        resolution,
        status: 'Failed',
        message: err.message || 'Assembly export service error',
        createdAt: new Date().toISOString()
      };
    }
  }
};
