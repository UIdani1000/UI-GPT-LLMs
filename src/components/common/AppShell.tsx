import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from './ToastContainer';
import { NewProjectModal } from '../workspace/NewProjectModal';
import { GenerationQueueDrawer } from '../workspace/GenerationQueueDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col antialiased">
      {/* Glow highlight under header */}
      <div className="fixed top-0 left-0 right-0 h-40 pointer-events-none z-0 glow-ambient opacity-60" />

      <div className="flex flex-1 relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 w-64 bg-[#09090B]">
              <Sidebar onToggleCollapse={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onToggleMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <NewProjectModal />
      <GenerationQueueDrawer />
      <ToastContainer />
    </div>
  );
};
