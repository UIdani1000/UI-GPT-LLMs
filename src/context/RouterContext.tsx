import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface RouteMatch {
  path: string;
  projectId?: string;
  subPage?: 'overview' | 'brainstorm' | 'storyboard' | 'keyframes' | 'video' | 'final';
  isAssets?: boolean;
  isSettings?: boolean;
  isDashboard?: boolean;
}

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
  route: RouteMatch;
}

const RouterContext = createContext<RouterContextType | null>(null);

function parsePath(path: string): RouteMatch {
  const clean = path.replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '/projects') {
    return { path: clean, isDashboard: true };
  }
  if (clean === '/assets') {
    return { path: clean, isAssets: true };
  }
  if (clean === '/settings') {
    return { path: clean, isSettings: true };
  }

  // Check /projects/:projectId/...
  const projectMatch = clean.match(/^\/projects\/([^\/]+)(?:\/([^\/]+))?$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    let sub = (projectMatch[2] || 'overview').toLowerCase();
    if (sub === 'keyframe') sub = 'keyframes';

    const validSubPages: RouteMatch['subPage'][] = ['overview', 'brainstorm', 'storyboard', 'keyframes', 'video', 'final'];
    const matchedSub = validSubPages.includes(sub as RouteMatch['subPage']) ? (sub as RouteMatch['subPage']) : 'overview';

    return {
      path: clean,
      projectId,
      subPage: matchedSub
    };
  }

  return { path: clean, isDashboard: true };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // If hash routing is used (e.g. #/projects/...) support it, otherwise window.location.pathname
    if (window.location.hash.startsWith('#/')) {
      return window.location.hash.slice(1);
    }
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash.startsWith('#/')) {
        setCurrentPath(window.location.hash.slice(1));
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    if (window.location.hash.startsWith('#/')) {
      window.location.hash = `#${target}`;
    } else {
      window.history.pushState({}, '', target);
    }
    setCurrentPath(target);
    window.scrollTo(0, 0);
  };

  const route = useMemo(() => parsePath(currentPath), [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, route }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
