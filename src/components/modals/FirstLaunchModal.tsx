import React, { useState } from 'react';
import {
  Cloud,
  HardDrive,
  FolderOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BellOff,
  HelpCircle,
  Sparkles,
  Gamepad2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { EagleLogo } from '../common/EagleLogo';
import { GoogleDriveTutorialModal } from './GoogleDriveTutorialModal';

interface FirstLaunchModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export function FirstLaunchModal({ isOpen, onFinish }: FirstLaunchModalProps) {
  const {
    completeFirstRun,
    googleDriveSyncEnabled,
    googleDriveSyncPath,
    allowGameScan,
    optimizePowerOnLaunch,
    muteNotificationsOnLaunch,
  } = useGameStore();

  const [allowScan, setAllowScan] = useState(allowGameScan);
  const [enableGoogleDrive, setEnableGoogleDrive] = useState(true);
  const [googleDrivePath, setGoogleDrivePath] = useState(
    googleDriveSyncPath || 'G:\\My Drive\\EagleSaves'
  );
  const [optimizePower, setOptimizePower] = useState(optimizePowerOnLaunch);
  const [muteNotifications, setMuteNotifications] = useState(muteNotificationsOnLaunch);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isBrowsingFolder, setIsBrowsingFolder] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  if (!isOpen) return null;

  const handleBrowseFolder = async () => {
    setIsBrowsingFolder(true);
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const picked = await invoke<string | null>('pick_folder');
        if (picked) {
          setGoogleDrivePath(picked);
        }
      }
    } catch (e) {
      console.error('Failed to pick folder:', e);
    } finally {
      setIsBrowsingFolder(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    await completeFirstRun({
      allowScan,
      enableGoogleDrive,
      googleDrivePath: googleDrivePath.trim(),
      optimizePower,
      muteNotifications,
    });
    setIsFinishing(false);
    onFinish();
  };

  const handleSkip = async () => {
    setIsFinishing(true);
    await completeFirstRun({
      allowScan: true,
      enableGoogleDrive: false,
      googleDrivePath: googleDrivePath.trim(),
      optimizePower: true,
      muteNotifications: true,
    });
    setIsFinishing(false);
    onFinish();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-2xl bg-[#141417] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#232328] bg-gradient-to-r from-[#18181c] via-[#161619] to-[#18181c] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <EagleLogo size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-[#f4f4f5]">
                    Welcome to Eagle Launcher
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#0a84ff]/15 text-[#38bdf8] border border-[#0a84ff]/30">
                    First-Time Setup
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Configure your game library permissions and Google Drive cloud saves.
                </p>
              </div>
            </div>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-[#d1d5db]">
            {/* Step 1: Library Scanning Permissions */}
            <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Gamepad2 size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#f4f4f5] text-xs">
                      1. Scan Computer for Installed Games
                    </h3>
                    <p className="text-[#9ca3af] text-[11px] mt-0.5">
                      Allow Eagle Launcher to discover games installed on your local drives.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={allowScan}
                    onChange={(e) => setAllowScan(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0a84ff]"></div>
                </label>
              </div>

              {/* Supported Platforms tags */}
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                {['Steam', 'Xbox / PC Game Pass', 'Epic Games', 'GOG Galaxy', 'Standalone PC Games', 'Retro ROMs'].map(
                  (platform) => (
                    <span
                      key={platform}
                      className="px-2 py-0.5 rounded bg-[#1f1f24] border border-[#27272a] text-[#a1a1aa] flex items-center gap-1"
                    >
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      {platform}
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#71717a] pt-1">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span>
                  100% Local & Private. Eagle Launcher never accesses personal files or sends telemetry.
                </span>
              </div>
            </div>

            {/* Step 2: Google Drive Cloud Game Saves */}
            <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#f4f4f5] text-xs">
                      2. Cloud Game Save on Google Drive
                    </h3>
                    <p className="text-[#9ca3af] text-[11px] mt-0.5">
                      Automatically snapshot and sync your game progress to your Google Drive account on exit.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={enableGoogleDrive}
                    onChange={(e) => setEnableGoogleDrive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0a84ff]"></div>
                </label>
              </div>

              {/* Explain How Button Callout */}
              <div className="bg-[#161619] border border-[#27272a] rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                  <HelpCircle size={14} className="text-blue-400 shrink-0" />
                  <span>Not sure how it works or how to set up Google Drive for Desktop?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTutorialOpen(true)}
                  className="px-2.5 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={12} />
                  Explain How
                </button>
              </div>

              {/* Folder Selector (shown when enabled) */}
              {enableGoogleDrive && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                  <label className="block text-[11px] text-[#9ca3af]">
                    Google Drive Game Saves Folder:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={googleDrivePath}
                      onChange={(e) => setGoogleDrivePath(e.target.value)}
                      placeholder="e.g. G:\My Drive\EagleSaves"
                      className="flex-1 bg-[#111114] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
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
                    Works with any game (Steam, standalone PC games, emulators) with automatic ZIP compression.
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Performance & Power */}
            <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[#0a84ff]" />
                <h3 className="font-semibold text-[#f4f4f5] text-xs">
                  3. Gaming Experience & System Hooks
                </h3>
              </div>

              <div className="space-y-2 text-[11px]">
                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-[#f4f4f5]">
                  <span className="text-[#a1a1aa]">
                    Switch Windows Power Plan to Ultimate Performance during gameplay
                  </span>
                  <input
                    type="checkbox"
                    checked={optimizePower}
                    onChange={(e) => setOptimizePower(e.target.checked)}
                    className="w-4 h-4 accent-[#0a84ff] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-[#f4f4f5]">
                  <span className="text-[#a1a1aa]">
                    Mute Windows & Discord notifications while playing games
                  </span>
                  <input
                    type="checkbox"
                    checked={muteNotifications}
                    onChange={(e) => setMuteNotifications(e.target.checked)}
                    className="w-4 h-4 accent-[#0a84ff] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#232328] bg-[#18181c]/90 flex items-center justify-between shrink-0">
            <button
              onClick={handleSkip}
              disabled={isFinishing}
              className="px-4 py-2 rounded-lg text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#27272a] text-xs font-medium transition-colors"
            >
              Skip for Now
            </button>

            <button
              onClick={handleFinish}
              disabled={isFinishing}
              className="px-6 py-2 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isFinishing ? (
                <span>Setting up...</span>
              ) : (
                <>
                  <span>Finish Setup & Launch</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Little Window / Tutorial Modal */}
      <GoogleDriveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </>
  );
}
