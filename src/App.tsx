import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AccessDeniedScreen } from './components/common/AccessDeniedScreen';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ChatContainer } from './components/chat/ChatContainer';
import { MemoriesView } from './components/memories/MemoriesView';
import { NotesView } from './components/notes/NotesView';
import { ActivitiesView } from './components/activities/ActivitiesView';
import { SettingsModal } from './components/settings/SettingsModal';
import { WallpaperBackground } from './components/common/WallpaperBackground';
import { Sparkles, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isApproved, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 1. Loading state with gentle aesthetic animation
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 dark:bg-cozydark-950 text-cream-900 dark:text-cream-100">
        <div className="w-16 h-16 rounded-3xl bg-blush-100 dark:bg-blush-950/60 border border-blush-200 dark:border-blush-800 flex items-center justify-center shadow-sm animate-pulse-subtle mb-4">
          <span className="text-2xl animate-float-slow">🌸</span>
        </div>
        <p className="font-serif text-lg font-medium text-cream-800 dark:text-cream-200">
          Entering our cozy sanctuary...
        </p>
        <p className="text-xs text-cream-500 dark:text-cream-400 mt-1">
          Checking two-person security clearance
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: Render Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. Authenticated but NOT an approved member: Render strict access restriction
  if (!isApproved) {
    return <AccessDeniedScreen />;
  }

  // 4. Authenticated & Approved: Render Sanctuary
  return (
    <div className="min-h-screen text-cream-900 dark:text-cream-100 transition-colors flex flex-col pb-20 md:pb-6 relative bg-cream-100/90 dark:bg-cozydark-950/90">
      {/* Dynamic Atmospheric Wallpaper Backdrop */}
      <WallpaperBackground />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
            onSendToChat={(text) => {
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'chat' && <ChatContainer />}

        {activeTab === 'memories' && <MemoriesView />}

        {activeTab === 'notes' && <NotesView />}

        {activeTab === 'activities' && (
          <ActivitiesView
            onSendToChat={(text) => {
              setActiveTab('chat');
            }}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
