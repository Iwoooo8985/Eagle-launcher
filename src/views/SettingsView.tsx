import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { HardDrive, Zap, RefreshCw, CheckCircle2, Cloud, FolderOpen, Sparkles } from 'lucide-react';
import { GoogleDriveTutorialModal } from '../components/modals/GoogleDriveTutorialModal';

interface SettingsViewProps {
  onOpenFirstLaunch?: () => void;
}

export function SettingsView({ onOpenFirstLaunch }: SettingsViewProps) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isBrowsingFolder, setIsBrowsingFolder] = useState(false);

  const {
    games,
    romPath,
    setRomPath,
    steamGridApiKey,
    setSteamGridApiKey,
    optimizePowerOnLaunch,
    muteNotificationsOnLaunch,
    googleDriveSyncEnabled,
    googleDriveSyncPath,
    setGoogleDriveSyncEnabled,
    setGoogleDriveSyncPath,
    resetFirstRun,
    toggleSetting,
    scanLocalDisks,
    isScanning,
  } = useGameStore();

  const handleBrowseFolder = async () => {
    setIsBrowsingFolder(true);
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const picked = await invoke<string | null>('pick_folder');
        if (picked) {
          setGoogleDriveSyncPath(picked);
        }
      }
    } catch (e) {
      console.error('Failed to pick folder:', e);
    } finally {
      setIsBrowsingFolder(false);
    }
  };

  const steamCount = games.filter((g) => g.platform === 'steam').length;
  const xboxCount = games.filter((g) => g.platform === 'xbox').length;
  const standaloneCount = games.filter((g) => g.platform === 'standalone' || g.id.startsWith('custom-')).length;
  const epicCount = games.filter((g) => g.platform === 'epic').length;
  const gogCount = games.filter((g) => g.platform === 'gog').length;
  const retroCount = games.filter((g) => ['snes', 'ps2', 'gba', 'switch'].includes(g.platform)).length;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-2xl bg-[#0f0f11]">
      <div>
        <h1 className="text-xs font-semibold tracking-wider text-[#9ca3af] uppercase">
          Settings & System Hooks
        </h1>
        <p className="text-xs text-[#71717a] mt-1">
          Configure automated platform scanners, directories, and hardware optimization hooks.
        </p>
      </div>

      {/* Automated Game Scanners Status */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
            <HardDrive size={14} className="text-[#0a84ff]" />
            <span>Platform Scanners & Library Status</span>
          </div>
          <button
            onClick={scanLocalDisks}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning Drives...' : 'Rescan All Drives'}
          </button>
        </div>

        <p className="text-xs text-[#71717a]">
          Eagle Launcher automatically discovers installed games across major platforms, Xbox / Game Pass, and standalone executables.
        </p>

        {/* Platform Scan Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">Steam</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{steamCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">Xbox & Game Pass</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{xboxCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">No Launcher (Direct)</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{standaloneCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">Epic Games</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{epicCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">GOG Galaxy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{gogCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#9ca3af] font-medium">Retro ROMs</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-[#f4f4f5]">{retroCount}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Directories Configuration */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs text-[#9ca3af] mb-1.5 font-medium">
              Retro ROMs Directory (Subfolders: snes/, ps2/, gba/, switch/)
            </label>
            <input
              type="text"
              value={romPath}
              onChange={(e) => setRomPath(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#9ca3af] mb-1.5 font-medium">
              SteamGridDB API Key (Optional — High-res custom poster provider)
            </label>
            <input
              type="password"
              value={steamGridApiKey}
              onChange={(e) => setSteamGridApiKey(e.target.value)}
              placeholder="Paste SteamGridDB Bearer token..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
            />
          </div>
        </div>
      </div>

      {/* Pre-Launch Hardware & Cloud Hooks */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
          <Zap size={14} className="text-[#0a84ff]" />
          <span>Pre-Launch Optimization & System Hooks</span>
        </div>

        <label className="flex items-center justify-between text-xs py-1.5 cursor-pointer hover:text-[#f4f4f5]">
          <span className="text-[#d1d5db]">
            Switch Windows Power Plan to Ultimate Performance on Game Launch
          </span>
          <input
            type="checkbox"
            checked={optimizePowerOnLaunch}
            onChange={() => toggleSetting('optimizePowerOnLaunch')}
            className="w-4 h-4 accent-[#0a84ff] rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-xs py-1.5 cursor-pointer hover:text-[#f4f4f5]">
          <span className="text-[#d1d5db]">
            Mute Windows & Discord Notifications During Active Gameplay
          </span>
          <input
            type="checkbox"
            checked={muteNotificationsOnLaunch}
            onChange={() => toggleSetting('muteNotificationsOnLaunch')}
            className="w-4 h-4 accent-[#0a84ff] rounded cursor-pointer"
          />
        </label>

        </div>

      {/* Google Drive Cloud Game Saves */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5] uppercase tracking-wider">
            <Cloud size={14} className="text-[#38bdf8]" />
            <span>Google Drive Cloud Game Saves</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="px-2.5 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            Explain How
          </button>
        </div>

        <p className="text-xs text-[#9ca3af]">
          Automatically snapshot and sync your game save files to your Google Drive account whenever you close a game.
        </p>

        <label className="flex items-center justify-between text-xs py-1 cursor-pointer hover:text-[#f4f4f5]">
          <span className="text-[#d1d5db]">
            Enable Google Drive Cloud Save Sync
          </span>
          <input
            type="checkbox"
            checked={googleDriveSyncEnabled}
            onChange={(e) => setGoogleDriveSyncEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0a84ff] rounded cursor-pointer"
          />
        </label>

        {googleDriveSyncEnabled && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] text-[#9ca3af]">
              Google Drive Save Backup Directory
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={googleDriveSyncPath}
                onChange={(e) => setGoogleDriveSyncPath(e.target.value)}
                placeholder="G:\My Drive\EagleSaves"
                className="flex-1 bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
              />
              <button
                type="button"
                onClick={handleBrowseFolder}
                disabled={isBrowsingFolder}
                className="px-3 py-2 rounded-lg bg-[#27272a] hover:bg-[#323238] text-[#f4f4f5] text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen size={13} />
                Browse...
              </button>
            </div>
            <p className="text-[10px] text-[#71717a]">
              Saves are compressed into versioned ZIP files for instant upload by Google Drive for Desktop.
            </p>
          </div>
        )}
      </div>

      {/* First-Run Setup Reset */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#71717a] border-t border-[#232328]">
        <span>First-Launch Experience:</span>
        <button
          type="button"
          onClick={() => {
            resetFirstRun();
            if (onOpenFirstLaunch) onOpenFirstLaunch();
          }}
          className="text-xs text-[#9ca3af] hover:text-[#f4f4f5] underline transition-colors"
        >
          Re-open First-Time Setup Wizard
        </button>
      </div>

      {/* Google Drive Tutorial Modal */}
      <GoogleDriveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </main>
  );
}