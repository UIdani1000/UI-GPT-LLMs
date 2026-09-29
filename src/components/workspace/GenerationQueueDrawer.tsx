import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Trash2,
  Video
} from 'lucide-react';

export const GenerationQueueDrawer: React.FC = () => {
  const {
    queue,
    isQueueOpen,
    setIsQueueOpen,
    cancelQueueJob,
    retryQueueJob,
    clearCompletedQueue,
    activeProject
  } = useProject();

  if (!isQueueOpen) return null;

  const activeJobs = queue.filter(
    (j) => j.status === 'GENERATING' || j.status === 'PROCESSING' || j.status === 'QUEUED'
  );
  const completedJobs = queue.filter((j) => j.status === 'COMPLETED');
  const failedJobs = queue.filter((j) => j.status === 'FAILED');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#101014] border-l border-white/[0.08] shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#1E1D27] flex items-center justify-center text-[#A855F7]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#FAFAFA]">
                Production Generation Queue
              </h3>
              <p className="text-[11px] font-mono-code text-[#71717A]">
                {activeJobs.length} in progress · {completedJobs.length} completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {completedJobs.length > 0 && (
              <button
                type="button"
                onClick={clearCompletedQueue}
                className="px-2.5 py-1 text-[11px] font-mono-code text-[#71717A] hover:text-[#FAFAFA] bg-[#15151B] hover:bg-[#1E1D27] rounded-[6px] transition-colors cursor-pointer"
              >
                Clear Done
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsQueueOpen(false)}
              className="p-1 text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {queue.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <Layers className="w-8 h-8 text-[#71717A]/40 mb-2" />
              <p className="font-display text-sm text-[#A1A1AA]">Generation queue is clear</p>
              <p className="text-xs text-[#71717A] max-w-xs mt-1">
                Queue shots from the Video Lab to synthesize continuous motion in the background.
              </p>
            </div>
          ) : (
            queue.map((job) => {
              const isRunning = job.status === 'GENERATING' || job.status === 'PROCESSING';
              const isQueued = job.status === 'QUEUED';
              const isDone = job.status === 'COMPLETED';
              const isFailed = job.status === 'FAILED';
              const isInterrupted = job.status === 'INTERRUPTED';

              return (
                <div
                  key={job.id}
                  className={`p-3.5 rounded-[14px] border transition-all ${
                    isRunning
                      ? 'bg-[#15151B] border-[#A855F7]/40 shadow-sm'
                      : isDone
                      ? 'bg-[#101014] border-[#22C55E]/20'
                      : isInterrupted
                      ? 'bg-[#17140E] border-[#F59E0B]/30'
                      : isFailed
                      ? 'bg-[#151214] border-[#EF4444]/30'
                      : 'bg-[#121216] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {job.thumbnailUrl ? (
                        <div className="w-12 aspect-video rounded-[6px] overflow-hidden bg-black flex-shrink-0 border border-white/[0.08]">
                          <img
                            src={job.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-8 rounded-[6px] bg-[#1E1D27] flex items-center justify-center text-[#C084FC] font-mono-code text-xs font-bold">
                          {job.shotNumber || 'K01'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-code text-xs font-bold text-[#C084FC]">
                            {job.shotNumber}
                          </span>
                          <span className="text-xs text-[#FAFAFA] font-medium truncate">
                            {job.shotTitle || 'Motion Shot'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono-code text-[#71717A] mt-0.5">
                          {job.model} · {job.duration || 5}s
                          {job.isDemo && ' · Studio Preview'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isDone && (
                        <span className="flex items-center gap-1 text-[10px] font-mono-code text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-[4px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>READY</span>
                        </span>
                      )}
                      {isRunning && (
                        <span className="flex items-center gap-1 text-[10px] font-mono-code text-[#C084FC] bg-[#A855F7]/10 px-2 py-0.5 rounded-[4px] animate-pulse">
                          <span>{job.status}</span>
                        </span>
                      )}
                      {isQueued && (
                        <span className="text-[10px] font-mono-code text-[#A1A1AA] bg-white/[0.04] px-2 py-0.5 rounded-[4px]">
                          QUEUED
                        </span>
                      )}
                      {isFailed && (
                        <span className="flex items-center gap-1 text-[10px] font-mono-code text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-[4px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>FAILED</span>
                        </span>
                      )}
                      {isInterrupted && (
                        <span className="flex items-center gap-1 text-[10px] font-mono-code text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-[4px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>INTERRUPTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isRunning && (
                    <div className="space-y-1 mt-2">
                      <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono-code text-[#71717A]">
                        <span>Synthesizing motion vectors...</span>
                        <span>{job.progress}%</span>
                      </div>
                    </div>
                  )}

                  {/* Failure / Interrupted message & retry button */}
                  {(isFailed || isInterrupted) && (
                    <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <p className={`text-[11px] truncate max-w-[280px] ${isInterrupted ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                        {job.error || (isInterrupted ? 'Interrupted during generation session' : 'Generation failed')}
                      </p>
                      <button
                        type="button"
                        onClick={() => retryQueueJob(job.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono-code text-[#FAFAFA] bg-[#1E1D27] hover:bg-[#282635] border border-white/[0.08] rounded-[6px] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-[#C084FC]" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  {/* Queued Action */}
                  {isQueued && (
                    <div className="mt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => cancelQueueJob(job.id)}
                        className="text-[10px] font-mono-code text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0A0A0D] flex items-center justify-between text-xs font-mono-code text-[#71717A]">
          <span>GOOGLE VEO 3.1 GENERATION PIPELINE</span>
          <span>AUTONOMOUS WORKER</span>
        </div>
      </div>
    </div>
  );
};
