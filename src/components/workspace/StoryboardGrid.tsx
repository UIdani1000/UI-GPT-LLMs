import React, { useState } from 'react';
import { Shot } from '../../types';
import { ShotCard } from './ShotCard';
import { ShotDetailPanel } from './ShotDetailPanel';
import { DeleteShotModal } from './DeleteShotModal';
import { useRouter } from '../../context/RouterContext';
import { useProject } from '../../context/ProjectContext';
import {
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List
} from 'lucide-react';

interface StoryboardGridProps {
  projectId: string;
  shots: Shot[];
  selectedShotId?: string | null;
  onSelectShot?: (shot: Shot) => void;
  showAddButton?: boolean;
}

export const StoryboardGrid: React.FC<StoryboardGridProps> = ({
  projectId,
  shots,
  selectedShotId,
  onSelectShot,
  showAddButton = true
}) => {
  const { navigate } = useRouter();
  const {
    addShot,
    duplicateShot,
    deleteShot,
    reorderShots,
    setSelectedShotId
  } = useProject();

  const [filter, setFilter] = useState<'all' | 'KEYFRAME_READY' | 'VIDEO_READY' | 'PLANNED'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'sequence'>('grid');
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [deletingShot, setDeletingShot] = useState<Shot | null>(null);

  const filteredShots = shots.filter((shot) => {
    if (filter === 'all') return true;
    return (
      shot.status === filter ||
      (filter === 'KEYFRAME_READY' && shot.status === 'completed') ||
      (filter === 'PLANNED' && (shot.status === 'draft' || shot.status === 'ready'))
    );
  });

  const handleAddNewShot = () => {
    const newShot = addShot({
      title: 'Untitled Shot',
      purpose: 'Establish physical presence and engineering precision.'
    });
    setEditingShot(newShot);
  };

  const handleMoveShot = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= shots.length) return;

    const newIds = shots.map((s) => s.id);
    const temp = newIds[index];
    newIds[index] = newIds[targetIdx];
    newIds[targetIdx] = temp;

    reorderShots(newIds);
  };

  const handleOpenKeyframeLab = (shotId: string) => {
    setSelectedShotId(shotId);
    navigate(`/projects/${projectId}/keyframes`);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter & Toolbar Controls (Section 17) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101014] border border-white/[0.06] rounded-[10px]">
          {(['all', 'KEYFRAME_READY', 'VIDEO_READY', 'PLANNED'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-[6px] text-xs font-mono-code transition-colors uppercase cursor-pointer ${
                filter === mode
                  ? 'bg-[#1E1D27] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#FAFAFA]'
              }`}
            >
              {mode === 'all' ? 'All Shots' : mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* View Toggle & Add Shot */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#101014] border border-white/[0.06] rounded-[8px]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#1E1D27] text-white' : 'text-[#71717A] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sequence')}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                viewMode === 'sequence' ? 'bg-[#1E1D27] text-white' : 'text-[#71717A] hover:text-white'
              }`}
              title="Sequence Timeline View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {showAddButton && (
            <button
              type="button"
              onClick={handleAddNewShot}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#15151B] hover:bg-[#1E1D27] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-[#FAFAFA] rounded-[10px] transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>+ Add Shot</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid or Sequence View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredShots.map((shot, idx) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              index={idx}
              totalShots={shots.length}
              selected={selectedShotId === shot.id}
              onSelect={() => {
                setSelectedShotId(shot.id);
                setEditingShot(shot);
                onSelectShot?.(shot);
              }}
              onMoveUp={() => handleMoveShot(idx, 'up')}
              onMoveDown={() => handleMoveShot(idx, 'down')}
              onDuplicate={() => duplicateShot(shot.id)}
              onDelete={() => setDeletingShot(shot)}
              onOpenKeyframeLab={() => handleOpenKeyframeLab(shot.id)}
            />
          ))}

          {/* Add Shot Card Slot */}
          {showAddButton && (
            <div
              onClick={handleAddNewShot}
              className="rounded-[20px] border border-dashed border-white/[0.12] hover:border-[#A855F7]/50 bg-[#101014]/40 hover:bg-[#15151B]/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[260px] group"
            >
              <div className="w-12 h-12 rounded-full bg-[#15151B] group-hover:bg-[#8B5CF6]/20 border border-white/[0.08] group-hover:border-[#A855F7]/40 flex items-center justify-center text-[#71717A] group-hover:text-[#C084FC] mb-3 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-display text-sm font-semibold text-[#FAFAFA] tracking-tight">
                + Add Shot
              </span>
              <span className="text-xs text-[#71717A] mt-1 max-w-[180px]">
                Create new beat indexed as K{shots.length + 1 < 10 ? '0' : ''}{shots.length + 1}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Sequence Row List View */
        <div className="space-y-2">
          {filteredShots.map((shot, idx) => (
            <div
              key={shot.id}
              onClick={() => {
                setSelectedShotId(shot.id);
                setEditingShot(shot);
              }}
              className="p-3 rounded-[14px] bg-[#101014] hover:bg-[#15151B] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-4 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="font-mono-code text-xs font-bold text-[#C084FC] w-8">
                  {shot.shot_number}
                </span>

                <div className="w-16 h-10 rounded-[8px] overflow-hidden bg-black shrink-0 border border-white/[0.06]">
                  {shot.keyframe_url ? (
                    <img
                      src={shot.keyframe_url}
                      alt={shot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#71717A]">
                      EMPTY
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-display text-xs font-semibold text-[#FAFAFA] truncate">
                    {shot.title}
                  </h4>
                  <p className="text-[11px] text-[#71717A] truncate">
                    {shot.camera_movement || shot.camera_type} · {shot.lens || shot.focal_length} · {shot.duration_seconds}s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenKeyframeLab(shot.id);
                  }}
                  className="px-3 py-1 bg-[#1E1D27] hover:bg-[#272635] text-xs text-[#C084FC] rounded-[8px] border border-white/[0.08]"
                >
                  Keyframe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Focused Shot Detail Panel (Section 11, 14, 18, 23) */}
      {editingShot && (
        <ShotDetailPanel
          shot={shots.find((s) => s.id === editingShot.id) || editingShot}
          onClose={() => setEditingShot(null)}
          onDeleteRequest={(targetShot) => {
            setDeletingShot(targetShot);
            setEditingShot(null);
          }}
          projectId={projectId}
        />
      )}

      {/* Delete Confirmation Modal (Section 15) */}
      <DeleteShotModal
        shot={deletingShot}
        isOpen={!!deletingShot}
        onClose={() => setDeletingShot(null)}
        onConfirm={() => {
          if (deletingShot) {
            deleteShot(deletingShot.id);
            setDeletingShot(null);
          }
        }}
      />
    </div>
  );
};
