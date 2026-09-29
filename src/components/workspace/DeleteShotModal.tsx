import React from 'react';
import { Modal } from '../common/Modal';
import { Shot } from '../../types';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteShotModalProps {
  shot: Shot | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteShotModal: React.FC<DeleteShotModalProps> = ({
  shot,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!shot) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete Shot ${shot.shot_number}?`}
      subtitle="This shot will be removed and the remaining sequence will be renumbered automatically."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-[#1A1115] border border-[#EF4444]/30 rounded-[12px] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A1A1AA] leading-relaxed">
            Removing <span className="font-semibold text-white">{shot.shot_number} — {shot.title}</span> will preserve stable identifiers for other shots while updating the production timeline.
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white rounded-[8px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[10px] text-xs font-semibold shadow-[0_0_16px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};
