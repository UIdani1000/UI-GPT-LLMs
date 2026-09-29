import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { AppShell } from './components/common/AppShell';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { WorkspaceOverviewPage } from './pages/WorkspaceOverviewPage';
import { BrainstormPage } from './pages/BrainstormPage';
import { StoryboardPage } from './pages/StoryboardPage';
import { KeyframePage } from './pages/KeyframePage';
import { VideoPage } from './pages/VideoPage';
import { FinalPage } from './pages/FinalPage';
import { AssetsPage } from './pages/AssetsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProjectNotFound } from './components/common/ProjectNotFound';

const AppContent: React.FC = () => {
  const { route } = useRouter();
  const { activeProjectId, setActiveProjectId, projects } = useProject();

  const projectExists = route.projectId ? projects.some((p) => p.id === route.projectId) : false;

  // Keep active project in sync with URL
  useEffect(() => {
    if (route.projectId && route.projectId !== activeProjectId) {
      if (projectExists) {
        setActiveProjectId(route.projectId);
      }
    }
  }, [route.projectId, activeProjectId, projectExists, setActiveProjectId]);

  // Route Dispatcher
  const renderActivePage = () => {
    if (route.isAssets) {
      return <AssetsPage />;
    }
    if (route.isSettings) {
      return <SettingsPage />;
    }
    if (route.projectId) {
      if (!projectExists) {
        return <ProjectNotFound requestedId={route.projectId} />;
      }
      switch (route.subPage) {
        case 'brainstorm':
          return <BrainstormPage />;
        case 'storyboard':
          return <StoryboardPage />;
        case 'keyframes':
          return <KeyframePage />;
        case 'video':
          return <VideoPage />;
        case 'final':
          return <FinalPage />;
        case 'overview':
        default:
          return <WorkspaceOverviewPage />;
      }
    }

    // Default to Dashboard
    return <DashboardPage />;
  };

  return <AppShell>{renderActivePage()}</AppShell>;
};

export default function App() {
  return (
    <RouterProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </RouterProvider>
  );
}
