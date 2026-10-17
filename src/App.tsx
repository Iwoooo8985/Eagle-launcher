import React, { useEffect, useState, useRef } from 'react';
import { AntigravitySidebar, NavTab } from './components/layout/AntigravitySidebar';
import { TitleBar } from './components/layout/TitleBar';
import { LibraryView } from './views/LibraryView';
import { PulseView } from './views/PulseView';
import { DealsView } from './views/DealsView';
import { SettingsView } from './views/SettingsView';
import { AddGameModal } from './components/modals/AddGameModal';
import { FirstLaunchModal } from './components/modals/FirstLaunchModal';
import { useGameStore } from './store/useGameStore';
import { useThemeStore } from './store/useThemeStore';
import { GamePlatform } from './types/game';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('library');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialGameData, setInitialGameData] = useState<{
    path: string;
    title: string;
    platform: GamePlatform;
  } | null>(null);

  const firstRunCompleted = useGameStore((s) => s.firstRunCompleted);
  const allowGameScan = useGameStore((s) => s.allowGameScan);
  const [isFirstLaunchOpen, setIsFirstLaunchOpen] = useState(!firstRunCompleted);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanLocalDisks = useGameStore((s) => s.scanLocalDisks);

  useEffect(() => {
    useThemeStore.getState().initTheme();
    if (firstRunCompleted && allowGameScan) {
      scanLocalDisks();
    }
  }, [scanLocalDisks, firstRunCompleted, allowGameScan]);

  const handleOpenAddGame = async () => {
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const picked = await invoke<string | null>('pick_game_file');
        if (picked) {
          const fileName = picked.split(/[\/\\]/).pop() || '';
          const baseName = fileName.replace(/\.[^/.]+$/, '');
          const cleanTitle = baseName
            .replace(/[-_.]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();

          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          let detectedPlatform: GamePlatform = 'steam';
          if (['sfc', 'smc'].includes(ext)) detectedPlatform = 'snes';
          else if (['gba'].includes(ext)) detectedPlatform = 'gba';
          else if (['iso', 'bin', 'chd'].includes(ext)) detectedPlatform = 'ps2';
          else if (['nsp', 'xci'].includes(ext)) detectedPlatform = 'switch';

          setInitialGameData({
            path: picked,
            title: cleanTitle,
            platform: detectedPlatform,
          });
          setIsAddModalOpen(true);
          return;
        }
      }
    } catch (e) {
      console.error('File pick error:', e);
    }

    setInitialGameData(null);
    setIsAddModalOpen(true);
  };

  // Global Keyboard shortcuts: Ctrl+K to search, Ctrl+N to add game via File Explorer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('library');
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenAddGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFocusSearch = () => {
    setActiveTab('library');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11] text-[#d1d5db] overflow-hidden select-none font-sans">
      {/* Antigravity Top Titlebar */}
      <TitleBar onOpenAddModal={handleOpenAddGame} />

      {/* Main Layout Area */}
      <div className="flex flex-1 h-[calc(100vh-2.25rem)] overflow-hidden">
        {/* Antigravity Left Sidebar */}
        <AntigravitySidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={handleOpenAddGame}
          onFocusSearch={handleFocusSearch}
        />

        {/* Content Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0f0f11]">
          {activeTab === 'library' && (
            <LibraryView
              onOpenAddModal={handleOpenAddGame}
              searchInputRef={searchInputRef}
            />
          )}
          {activeTab === 'pulse' && <PulseView />}
          {activeTab === 'deals' && <DealsView />}
          {activeTab === 'settings' && (
            <SettingsView onOpenFirstLaunch={() => setIsFirstLaunchOpen(true)} />
          )}
        </div>
      </div>

      {/* Add Game / ROM Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setInitialGameData(null);
        }}
        initialPath={initialGameData?.path}
        initialTitle={initialGameData?.title}
        initialPlatform={initialGameData?.platform}
      />

      {/* First-Launch Onboarding & Permissions Wizard */}
      <FirstLaunchModal
        isOpen={isFirstLaunchOpen}
        onFinish={() => setIsFirstLaunchOpen(false)}
      />
    </div>
  );
}

export default App;