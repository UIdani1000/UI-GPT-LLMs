import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProject();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#A855F7] shrink-0" />;
        let borderColor = 'border-[#A855F7]/30';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />;
          borderColor = 'border-[#22C55E]/30';
        } else if (toast.type === 'warning' || toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />;
          borderColor = 'border-[#EF4444]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#15151B] border ${borderColor} rounded-[14px] shadow-[0_12px_28px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <p className="text-xs text-[#FAFAFA] font-medium tracking-tight truncate">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
