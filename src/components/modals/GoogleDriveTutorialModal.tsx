import React, { useState } from 'react';
import {
  X,
  Cloud,
  FolderSync,
  ShieldCheck,
  HardDrive,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface GoogleDriveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleDriveTutorialModal({ isOpen, onClose }: GoogleDriveTutorialModalProps) {
  const [copiedPath, setCopiedPath] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutorial' | 'faq'>('tutorial');

  if (!isOpen) return null;

  const examplePath = 'G:\\My Drive\\EagleSaves';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(examplePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const handleOpenGoogleDriveDownload = () => {
    window.open('https://www.google.com/drive/download/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#141417] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#232328] flex items-center justify-between bg-[#18181c]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#f4f4f5]">
                  Google Drive Cloud Game Saves
                </h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Step-by-Step Guide
                </span>
              </div>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Learn how automatic cloud backup preserves your save files across PC upgrades and crashes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#232328] px-6 bg-[#161619] gap-4 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`py-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'tutorial'
                ? 'border-blue-500 text-[#f4f4f5]'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            Setup Walkthrough (3 Steps)
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-blue-500 text-[#f4f4f5]'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            How It Works & FAQ
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-[#d1d5db]">
          {activeTab === 'tutorial' ? (
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 transition-colors hover:border-[#38383e]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#f4f4f5] text-xs flex items-center justify-between">
                      <span>Install Google Drive for Desktop</span>
                      <button
                        onClick={handleOpenGoogleDriveDownload}
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-normal text-[11px]"
                      >
                        Download Page <ExternalLink size={11} />
                      </button>
                    </h3>
                    <p className="text-[#9ca3af] mt-1 text-[11px] leading-relaxed">
                      Google Drive for Desktop synchronizes your cloud storage directly with Windows.
                      Once installed, Google Drive assigns a local virtual drive letter (usually{' '}
                      <span className="text-[#f4f4f5] font-mono bg-[#232328] px-1 py-0.5 rounded">G:\</span>)
                      or creates a synced folder in your Windows user directory.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 transition-colors hover:border-[#38383e]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#f4f4f5] text-xs">
                      Choose or Create Your Backup Folder
                    </h3>
                    <p className="text-[#9ca3af] mt-1 text-[11px] leading-relaxed">
                      In Eagle Launcher, set your sync folder path to a folder located inside your Google Drive.
                      You can click <strong className="text-[#f4f4f5]">"Browse..."</strong> to pick any folder using Windows Explorer.
                    </p>

                    <div className="mt-2.5 flex items-center justify-between bg-[#111114] border border-[#27272a] rounded-lg px-3 py-1.5 font-mono text-[11px]">
                      <span className="text-[#9ca3af] truncate">{examplePath}</span>
                      <button
                        onClick={handleCopyPath}
                        className="text-blue-400 hover:text-blue-300 ml-2 inline-flex items-center gap-1 text-[11px]"
                      >
                        {copiedPath ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Suggestion
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-4 transition-colors hover:border-[#38383e]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#f4f4f5] text-xs">
                      Automatic Save Snapshots on Game Exit
                    </h3>
                    <p className="text-[#9ca3af] mt-1 text-[11px] leading-relaxed">
                      Whenever you launch and finish playing a game through Eagle Launcher, the launcher automatically:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-[#9ca3af]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Detects when your game process terminates.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Creates a compressed timestamped ZIP snapshot of the game save data.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Google Drive desktop app immediately uploads it to your private cloud storage.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-3.5">
                <h4 className="font-semibold text-[#f4f4f5] text-xs flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Why Google Drive instead of proprietary sync?
                </h4>
                <p className="text-[#9ca3af] mt-1.5 text-[11px] leading-relaxed">
                  Most launchers either charge monthly fees or lock your saves to their own platform. With Google Drive,
                  you get 15 GB of free storage, complete file ownership, and cross-device access with no lock-in.
                </p>
              </div>

              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-3.5">
                <h4 className="font-semibold text-[#f4f4f5] text-xs flex items-center gap-2">
                  <FolderSync size={14} className="text-emerald-400" />
                  Does this work with standalone games and emulators?
                </h4>
                <p className="text-[#9ca3af] mt-1.5 text-[11px] leading-relaxed">
                  Yes! Unlike Steam Cloud which only works for official Steam games, Eagle Launcher's backup engine hooks
                  into standalone PC games, itch.io indies, and retro ROM emulators (SNES, PS2, GBA, Switch).
                </p>
              </div>

              <div className="bg-[#18181c] border border-[#27272a] rounded-xl p-3.5">
                <h4 className="font-semibold text-[#f4f4f5] text-xs flex items-center gap-2">
                  <HardDrive size={14} className="text-amber-400" />
                  What if I don't have Google Drive for Desktop yet?
                </h4>
                <p className="text-[#9ca3af] mt-1.5 text-[11px] leading-relaxed">
                  You can still select any local folder or USB drive! Eagle Launcher will save your snapshots there.
                  Whenever you install Google Drive later, you can point Google Drive to sync that folder.
                </p>
              </div>
            </div>
          )}

          {/* Quick Value Callout */}
          <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-500/20 rounded-xl p-3.5 flex items-center gap-3">
            <Sparkles size={16} className="text-blue-400 shrink-0" />
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              <strong>Tip:</strong> You can re-read this guide anytime in <strong>Settings → Cloud Game Saves</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#232328] bg-[#18181c]/80 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] text-white text-xs font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Got It, Return to Setup
          </button>
        </div>
      </div>
    </div>
  );
}
