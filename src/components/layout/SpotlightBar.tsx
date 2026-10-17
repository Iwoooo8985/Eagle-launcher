import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  ChevronDown,
  Plus,
  Shield,
  Mic,
  ArrowRight,
  HardDrive,
  RefreshCw,
  Search,
  Check,
  Play,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ShelfStatus } from '../../types/game';

interface SpotlightBarProps {
  onOpenAddModal: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SpotlightBar({ onOpenAddModal, searchInputRef }: SpotlightBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform,
    games,
    isScanning,
    scanLocalDisks,
    launchGame,
  } = useGameStore();

  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [launchMode, setLaunchMode] = useState<'Default' | 'High Performance' | 'Safe Mode'>('Default');

  const platforms = [
    { id: 'all', label: 'All Platforms' },
    { id: 'steam', label: 'Steam' },
    { id: 'epic', label: 'Epic Games' },
    { id: 'gog', label: 'GOG Galaxy' },
    { id: 'retro', label: 'Retro ROMs' },
    { id: 'itch', label: 'itch.io Indie' },
  ];

  // Quick launch first match when pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const match = games.find((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        launchGame(match);
      }
    }
  };

  const currentPlatformLabel =
    platforms.find((p) => p.id === selectedPlatform)?.label || 'All Platforms';

  const handleActionClick = () => {
    // If search matches a game, launch it! Otherwise open add modal or search
    const match = games.find((g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match && searchQuery.trim()) {
      launchGame(match);
    } else if (!searchQuery.trim()) {
      onOpenAddModal();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-start gap-2 mb-8">
      {/* Breadcrumb / Workspace Header Dropdown */}
      <div className="relative">
        <button
          onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
          className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#f4f4f5] px-1 py-1 rounded transition-colors group"
        >
          <Folder size={14} className="text-[#82828e] group-hover:text-[#0a84ff] transition-colors" />
          <span className="font-medium text-[#d1d5db]">Eagle launcher</span>
          <ChevronDown size={13} className="text-[#6b7280]" />
        </button>

        {workspaceDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setWorkspaceDropdownOpen(false)}
            />
            <div className="absolute left-0 top-full mt-1 w-52 bg-[#18181b] border border-[#2b2b30] rounded-xl shadow-2xl py-1.5 z-40 text-xs">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#71717a] font-semibold">
                Library Contexts
              </div>
              <button
                onClick={() => {
                  setSelectedPlatform('all');
                  setWorkspaceDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7] flex items-center justify-between"
              >
                <span>Eagle launcher (Default)</span>
                <Check size={12} className="text-[#0a84ff]" />
              </button>
              <button
                onClick={() => {
                  setSelectedPlatform('retro');
                  setWorkspaceDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#a1a1aa] flex items-center justify-between"
              >
                <span>Retro Emulation Workspace</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Antigravity-Style Input Card */}
      <div className="w-full bg-[#18181b] border border-[#27272a] hover:border-[#383840] focus-within:border-[#3f3f46] rounded-2xl p-3.5 shadow-xl transition-all">
        {/* Large Text Input */}
        <div className="w-full mb-3">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search games, filter titles, or press Enter to launch..."
            className="w-full bg-transparent text-sm text-[#f4f4f5] placeholder-[#71717a] focus:outline-none"
          />
        </div>

        {/* Bottom Control Bar inside the card */}
        <div className="flex items-center justify-between pt-1 border-t border-[#222226]">
          {/* Left Controls */}
          <div className="flex items-center gap-1.5">
            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              title="Add Custom Game / ROM"
              className="p-1 rounded-md text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
            >
              <Plus size={14} />
            </button>

            {/* Platform Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#222226] hover:bg-[#2a2a30] text-[11px] text-[#d1d5db] font-medium border border-[#2b2b31] transition-colors"
              >
                <span>{currentPlatformLabel}</span>
                <ChevronDown size={12} className="text-[#82828e]" />
              </button>

              {platformDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setPlatformDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#18181b] border border-[#2b2b30] rounded-xl shadow-2xl py-1 z-40 text-xs">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPlatform(p.id);
                          setPlatformDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#25252a] flex items-center justify-between text-[11px] ${
                          selectedPlatform === p.id
                            ? 'text-[#f4f4f5] font-medium'
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        <span>{p.label}</span>
                        {selectedPlatform === p.id && (
                          <Check size={12} className="text-[#0a84ff]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Launch Mode Badge Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              >
                <Shield size={12} className="text-[#82828e]" />
                <span>{launchMode}</span>
                <ChevronDown size={11} className="text-[#6b7280]" />
              </button>

              {modeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setModeDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-[#18181b] border border-[#2b2b30] rounded-xl shadow-2xl py-1 z-40 text-xs">
                    {(['Default', 'High Performance', 'Safe Mode'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setLaunchMode(mode);
                          setModeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[11px] flex items-center justify-between ${
                          launchMode === mode ? 'text-[#f4f4f5] font-medium' : 'text-[#9ca3af]'
                        }`}
                      >
                        <span>{mode}</span>
                        {launchMode === mode && <Check size={12} className="text-[#0a84ff]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mic / Audio Trigger */}
            <button
              onClick={() => {}}
              title="Voice Input / Audio Cue"
              className="p-1 rounded-md text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
            >
              <Mic size={14} />
            </button>

            {/* Signature Antigravity Blue Action Circle Button */}
            <button
              onClick={handleActionClick}
              title={searchQuery.trim() ? 'Launch / Filter' : 'Quick Action'}
              className="w-7 h-7 rounded-full bg-[#0a84ff] hover:bg-[#0070e0] active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-[#0a84ff]/25"
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Pill below Card: Local / Drive Status */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={scanLocalDisks}
          title="Click to Rescan Disks"
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-[11px] text-[#9ca3af] hover:text-[#f4f4f5] transition-colors"
        >
          <HardDrive size={11} className="text-[#82828e]" />
          <span>Local ({games.length} titles)</span>
          <RefreshCw size={10} className={`text-[#6b7280] ml-0.5 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
