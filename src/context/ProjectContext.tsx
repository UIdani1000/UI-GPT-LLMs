import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Project, Shot, Asset, CreativeConcept, CreativeContext, GenerationJob, VideoGeneration, QueueJobStatus } from '../types';
import { ProjectService } from '../services/projectService';
import { videoGenerationService } from '../services/videoGenerationService';
import { supabaseService, SupabaseConfigStatus } from '../services/supabaseService';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  createProject: (data: any) => Project;
  updateActiveProject: (updater: (prev: Project) => Project) => void;
  updateShot: (updatedShot: Shot) => void;
  addShot: (shotData?: Partial<Shot>) => Shot;
  duplicateShot: (shotId: string) => Shot | null;
  deleteShot: (shotId: string) => void;
  reorderShots: (orderedShotIds: string[]) => void;
  getCreativeContext: () => CreativeContext | null;
  selectedShotId: string | null;
  setSelectedShotId: (id: string | null) => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  // Queue Management (Prompt 04 & 06/07 Recovery)
  queue: GenerationJob[];
  addToQueue: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress'>) => GenerationJob;
  cancelQueueJob: (jobId: string) => void;
  retryQueueJob: (jobId: string) => void;
  clearCompletedQueue: () => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  // Supabase Persistence Status (Phase B)
  isCloudConnected: boolean;
  supabaseStatus: SupabaseConfigStatus;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const QUEUE_STORAGE_KEY = 'cinematic_lab_generation_queue_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode; initialProjectId?: string }> = ({
  children,
  initialProjectId
}) => {
  const [projects, setProjects] = useState<Project[]>(() => ProjectService.getProjects());
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    if (initialProjectId) return initialProjectId;
    const list = ProjectService.getProjects();
    return list[0]?.id || 'proj-novair-one';
  });

  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus>(() => supabaseService.getStatus());

  // Initialize queue from localStorage with interrupted job recovery (Phase D Section 29 & 30)
  const [queue, setQueue] = useState<GenerationJob[]>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed: GenerationJob[] = JSON.parse(stored);
        return parsed.map((job) => {
          if (job.status === 'GENERATING' || job.status === 'PROCESSING') {
            return {
              ...job,
              status: 'INTERRUPTED' as QueueJobStatus,
              error: 'Session was interrupted. Click Retry to re-generate.'
            };
          }
          return job;
        });
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Check Supabase cloud connection & hydrate projects
  useEffect(() => {
    supabaseService.init().then(async (connected) => {
      setIsCloudConnected(connected);
      setSupabaseStatus(supabaseService.getStatus());

      if (connected) {
        const cloudProjects = await supabaseService.getProjects();
        if (cloudProjects && cloudProjects.length > 0) {
          setProjects(cloudProjects);
        }
      }
    });
  }, []);

  // Sync queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  }, [queue]);

  // Keep projects synced with localStorage
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Set default selected shot when project changes
  useEffect(() => {
    if (activeProject && (!selectedShotId || !activeProject.shots.some((s) => s.id === selectedShotId))) {
      setSelectedShotId(activeProject.shots[0]?.id || null);
    }
  }, [activeProject, selectedShotId]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
  }, []);

  const createProject = useCallback((data: any): Project => {
    const newProj = ProjectService.createProject(data);
    setProjects(ProjectService.getProjects());
    setActiveProjectIdState(newProj.id);
    if (supabaseService.isConfigured()) {
      supabaseService.saveProject(newProj).catch(() => {});
    }
    showToast(`Project "${newProj.name}" created`, 'success');
    return newProj;
  }, [showToast]);

  const updateActiveProject = useCallback((updater: (prev: Project) => Project) => {
    setIsSaving(true);
    setProjects((prevList) => {
      const current = prevList.find((p) => p.id === activeProjectId);
      if (!current) return prevList;
      const updated = updater(current);
      ProjectService.updateProject(updated);
      if (supabaseService.isConfigured()) {
        supabaseService.saveProject(updated).catch(() => {});
      }
      const nextList = prevList.map((p) => (p.id === activeProjectId ? updated : p));
      return nextList;
    });

    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date());
    }, 200);
  }, [activeProjectId]);

  const updateShot = useCallback((updatedShot: Shot) => {
    setIsSaving(true);
    if (activeProjectId) {
      ProjectService.updateShot(activeProjectId, updatedShot);
      setProjects(ProjectService.getProjects());
      if (supabaseService.isConfigured()) {
        supabaseService.updateShot(activeProjectId, updatedShot).catch(() => {});
      }
    }
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date());
    }, 200);
  }, [activeProjectId]);

  const addShot = useCallback((shotData?: Partial<Shot>): Shot => {
    if (!activeProjectId) throw new Error('No active project');
    const created = ProjectService.addShot(activeProjectId, shotData);
    setProjects(ProjectService.getProjects());
    setSelectedShotId(created.id);
    showToast('Shot added to storyboard', 'success');
    return created;
  }, [activeProjectId, showToast]);

  const duplicateShot = useCallback((shotId: string): Shot | null => {
    if (!activeProjectId) return null;
    const duplicated = ProjectService.duplicateShot(activeProjectId, shotId);
    if (duplicated) {
      setProjects(ProjectService.getProjects());
      setSelectedShotId(duplicated.id);
      showToast('Shot duplicated', 'info');
    }
    return duplicated;
  }, [activeProjectId, showToast]);

  const deleteShot = useCallback((shotId: string) => {
    if (activeProjectId) {
      ProjectService.deleteShot(activeProjectId, shotId);
      setProjects(ProjectService.getProjects());
      showToast('Shot removed', 'warning');
    }
  }, [activeProjectId, showToast]);

  const reorderShots = useCallback((orderedShotIds: string[]) => {
    if (activeProjectId) {
      ProjectService.reorderShots(activeProjectId, orderedShotIds);
      setProjects(ProjectService.getProjects());
      if (supabaseService.isConfigured()) {
        supabaseService.reorderShots(activeProjectId, orderedShotIds).catch(() => {});
      }
      showToast('Sequence reordered', 'info');
    }
  }, [activeProjectId, showToast]);

  // Queue Operations
  const addToQueue = useCallback(
    (jobData: Omit<GenerationJob, 'id' | 'createdAt' | 'status' | 'progress'>): GenerationJob => {
      const newJob: GenerationJob = {
        ...jobData,
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'QUEUED',
        progress: 0,
        createdAt: new Date().toISOString()
      };
      setQueue((prev) => [...prev, newJob]);
      if (supabaseService.isConfigured()) {
        supabaseService.saveGenerationJob(newJob).catch(() => {});
      }
      showToast(`Added ${newJob.shotNumber || 'shot'} to production queue`, 'info');
      return newJob;
    },
    [showToast]
  );

  const cancelQueueJob = useCallback((jobId: string) => {
    setQueue((prev) =>
      prev.map((j) => (j.id === jobId && j.status !== 'COMPLETED' ? { ...j, status: 'CANCELLED' } : j))
    );
  }, []);

  const retryQueueJob = useCallback((jobId: string) => {
    setQueue((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              status: 'QUEUED',
              progress: 0,
              error: undefined,
              startedAt: undefined,
              completedAt: undefined
            }
          : j
      )
    );
    showToast('Job requeued for generation', 'info');
  }, [showToast]);

  const clearCompletedQueue = useCallback(() => {
    setQueue((prev) => prev.filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED'));
  }, []);

  // Persistent Queue Processor Worker (Prompt 04 Section 11)
  useEffect(() => {
    const queuedJob = queue.find((j) => j.status === 'QUEUED');
    if (!queuedJob) return;

    let isCancelled = false;

    const processJob = async () => {
      setQueue((prev) =>
        prev.map((j) =>
          j.id === queuedJob.id
            ? { ...j, status: 'GENERATING', startedAt: new Date().toISOString(), progress: 15 }
            : j
        )
      );

      try {
        const req = queuedJob.request || {
          shot_id: queuedJob.shotId,
          project_id: queuedJob.projectId,
          prompt: 'Cinematic commercial product film shot',
          aspect_ratio: '16:9',
          duration: queuedJob.duration || 5,
          model: queuedJob.model || 'veo-3.1-generate-preview'
        };

        const result = await videoGenerationService.generateVideo(req);

        if (isCancelled) return;

        if (result.status === 'generating' && result.operation_name) {
          // Poll real operation
          setQueue((prev) =>
            prev.map((j) => (j.id === queuedJob.id ? { ...j, status: 'PROCESSING', progress: 45 } : j))
          );

          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            const pollRes = await videoGenerationService.pollOperation(result.operation_name!);
            if (pollRes.done) {
              clearInterval(pollInterval);
              finalizeJob(queuedJob, pollRes.video_url || result.video_url, result.is_demo);
            } else if (attempts > 30) {
              clearInterval(pollInterval);
              setQueue((prev) =>
                prev.map((j) =>
                  j.id === queuedJob.id
                    ? { ...j, status: 'FAILED', error: 'Generation timed out. Please retry.' }
                    : j
                )
              );
            } else {
              setQueue((prev) =>
                prev.map((j) =>
                  j.id === queuedJob.id ? { ...j, progress: Math.min(90, 45 + attempts * 2) } : j
                )
              );
            }
          }, 3000);
        } else if (result.success && result.video_url) {
          // Progress simulation for prototype / preview
          for (let p = 30; p <= 90; p += 30) {
            await new Promise((r) => setTimeout(r, 600));
            if (isCancelled) return;
            setQueue((prev) =>
              prev.map((j) => (j.id === queuedJob.id ? { ...j, progress: p } : j))
            );
          }
          finalizeJob(queuedJob, result.video_url, result.is_demo);
        } else {
          setQueue((prev) =>
            prev.map((j) =>
              j.id === queuedJob.id
                ? { ...j, status: 'FAILED', error: result.message || 'Generation failed' }
                : j
            )
          );
        }
      } catch (err: any) {
        if (!isCancelled) {
          setQueue((prev) =>
            prev.map((j) =>
              j.id === queuedJob.id
                ? { ...j, status: 'FAILED', error: err.message || 'Queue processing error' }
                : j
            )
          );
        }
      }
    };

    const finalizeJob = (job: GenerationJob, videoUrl: string, isDemo?: boolean) => {
      setQueue((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                status: 'COMPLETED',
                progress: 100,
                resultUrl: videoUrl,
                isDemo,
                completedAt: new Date().toISOString()
              }
            : j
        )
      );

      // Find the shot across projects and add video generation
      setProjects((prevProjects) => {
        const targetProj = prevProjects.find((p) => p.id === job.projectId);
        if (!targetProj) return prevProjects;

        const targetShot = targetProj.shots.find((s) => s.id === job.shotId);
        if (!targetShot) return prevProjects;

        const existingVideoGens = targetShot.video_generations || [];
        const newVersionNumber = existingVideoGens.length + 1;

        const newVideoGen: VideoGeneration = {
          id: `vid-gen-${Date.now()}`,
          project_id: targetProj.id,
          shot_id: targetShot.id,
          version_number: newVersionNumber,
          motion_prompt: targetShot.motion_prompt || 'Cinematic Motion Sequence',
          start_frame_url: targetShot.keyframe_url,
          model: job.model || 'Veo 3.1',
          duration_seconds: job.duration || 5,
          aspect_ratio: targetProj.aspect_ratio,
          status: 'completed',
          video_url: videoUrl,
          is_approved: false,
          created_at: new Date().toISOString(),
          is_demo: isDemo
        };

        const updatedShot: Shot = {
          ...targetShot,
          video_url: videoUrl,
          status: 'VIDEO_READY',
          selected_video_version_id: newVideoGen.id,
          video_generations: [...existingVideoGens, newVideoGen]
        };

        ProjectService.updateShot(targetProj.id, updatedShot);

        return prevProjects.map((p) =>
          p.id === targetProj.id
            ? {
                ...p,
                shots: p.shots.map((s) => (s.id === targetShot.id ? updatedShot : s))
              }
            : p
        );
      });

      showToast(`Motion shot generated for ${job.shotNumber || 'shot'}`, 'success');
    };

    processJob();

    return () => {
      isCancelled = true;
    };
  }, [queue, showToast]);

  const getCreativeContext = useCallback((): CreativeContext | null => {
    if (!activeProject) return null;
    const brief = activeProject.creative_brief;
    const concept = activeProject.creative_concept;

    return {
      product: brief.product_name,
      objective: brief.objective || 'Product Launch',
      mood: brief.visual_moods || [brief.mood || 'Cinematic'],
      environment: brief.environment || 'Dark Studio',
      cameraLanguage: brief.camera_language || 'Slow Push',
      references: brief.visual_references || [],
      concept: concept.concept,
      visualLanguage: concept.visual_language_attributes || {
        environment: 'Minimal architectural spaces',
        lighting: 'Controlled directional light',
        materials: 'Matte surfaces, brushed metal, glass',
        color: 'Deep charcoal with restrained warm highlights',
        camera: 'Slow cinematic movement',
        composition: 'Centered product compositions with generous negative space'
      },
      cinematicRules: concept.cinematic_rules || [
        'Preserve product geometry.',
        'Maintain consistent product proportions.',
        'Keep branding readable.',
        'Avoid unnecessary visual clutter.',
        'Use controlled camera movement.',
        'Maintain continuity between shots.',
        'Treat the product as the hero.',
        'Avoid generic stock-photo aesthetics.'
      ],
      shots: activeProject.shots
    };
  }, [activeProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        createProject,
        updateActiveProject,
        updateShot,
        addShot,
        duplicateShot,
        deleteShot,
        reorderShots,
        getCreativeContext,
        selectedShotId,
        setSelectedShotId,
        isSaving,
        lastSavedAt,
        toasts,
        showToast,
        removeToast,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        queue,
        addToQueue,
        cancelQueueJob,
        retryQueueJob,
        clearCompletedQueue,
        isQueueOpen,
        setIsQueueOpen,
        isCloudConnected,
        supabaseStatus
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
