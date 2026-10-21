import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

// Bolt Optimization: Lazy-load route page components to enable automatic Vite code splitting.
// Heavy dependencies like CodeMirror, Mermaid, and React Markdown in PaperViewerPage are split
// into separate dynamic chunks, dramatically reducing the initial index JS bundle size.
const LoginPage = lazy(() => import('@/pages/login'));
const LibraryPage = lazy(() => import('@/pages/library'));
const IngestPage = lazy(() => import('@/pages/ingest'));
const PaperViewerPage = lazy(() => import('@/pages/paper-viewer'));
const ExplorePage = lazy(() => import('@/pages/explore'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<DashboardLayout />}>
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/ingest" element={<IngestPage />} />
                <Route path="/papers/:id" element={<PaperViewerPage />} />
                <Route path="/" element={<Navigate to="/library" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/library" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
