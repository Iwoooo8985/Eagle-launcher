import React, { useState } from 'react';
import { Minus, Square, X, RefreshCw, Plus, Moon, Volume2, Shield, Palette } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';
import { ThemeModal } from '../modals/ThemeModal';
import { EagleLogo } from '../common/EagleLogo';

interface TitleBarProps {
  onOpenAddModal: () => void;
}

export function TitleBar({ onOpenAddModal }: TitleBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { scanLocalDisks, isScanning, setSelectedPlatform } = useGameStore();
  const { currentThemeId, setThemeById } = useThemeStore();

  const handleMinimize = async () => {
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('minimize_window');
      }
    } catch (e) {
      console.log('Minimize window', e);
    }
  };

  const handleMaximize = async () => {
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('toggle_maximize_window');
      }
    } catch (e) {
      console.log('Maximize window', e);
    }
  };

  const handleClose = async () => {
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_window');
      }
    } catch (e) {
      console.log('Close window', e);
    }
  };

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={handleMaximize}
      className="h-9 w-full bg-[#121214] border-b border-[#222226] flex items-center justify-between px-3 select-none text-xs text-[#9ca3af] z-50 shrink-0 cursor-default"
    >
      {/* Left Menu Items */}
      <div className="flex items-center gap-1">
        {/* Antigravity / Eagle App Title */}
        <span className="font-semibold text-[#f4f4f5] mr-2 tracking-tight text-xs flex items-center gap-1.5">
          <EagleLogo badgeSize="sm" size={12} />
          Eagle
        </span>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2 py-0.5 rounded text-[11px] hover:text-[#f4f4f5] transition-colors ${
              activeMenu === 'file' ? 'bg-[#222226] text-[#f4f4f5]' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActiveMenu(null)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#18181b] border border-[#2b2b30] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onOpenAddModal();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7] flex items-center gap-2"
                >
                  <Plus size={13} /> Add Game / ROM...
                </button>
                <button
                  onClick={() => {
                    scanLocalDisks();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7] flex items-center gap-2"
                >
                  <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} /> Rescan Disks
                </button>
                <div className="my-1 border-t border-[#26262b]" />
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    handleClose();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Exit
                </button>
              </div>
            </>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
            className={`px-2 py-0.5 rounded text-[11px] hover:text-[#f4f4f5] transition-colors ${
              activeMenu === 'view' ? 'bg-[#222226] text-[#f4f4f5]' : ''
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActiveMenu(null)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#18181b] border border-[#2b2b30] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setSelectedPlatform('all');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  All Platforms
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatform('steam');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Steam Games
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatform('epic');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Epic Games
                </button>
                <button
                  onClick={() => {
                    setSelectedPlatform('retro');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Retro ROMs
                </button>
                <div className="my-1 border-t border-[#26262b]" />
                <button
                  onClick={() => {
                    setThemeById(currentThemeId === 'oled' ? 'default' : 'oled');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7] flex items-center gap-2"
                >
                  <Moon size={13} /> Toggle OLED Theme
                </button>
              </div>
            </>
          )}
        </div>

        {/* Window Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
            className={`px-2 py-0.5 rounded text-[11px] hover:text-[#f4f4f5] transition-colors ${
              activeMenu === 'window' ? 'bg-[#222226] text-[#f4f4f5]' : ''
            }`}
          >
            Window
          </button>
          {activeMenu === 'window' && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActiveMenu(null)}
              />
              <div className="absolute left-0 top-full mt-1 w-44 bg-[#18181b] border border-[#2b2b30] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    handleMinimize();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Minimize
                </button>
                <button
                  onClick={() => {
                    handleMaximize();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#25252a] text-[#e4e4e7]"
                >
                  Maximize
                </button>
              </div>
            </>
          )}
        </div>

        {/* Themes Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="px-2 py-0.5 rounded text-[11px] hover:text-[#f4f4f5] transition-colors flex items-center gap-1 hover:bg-[#222226]"
        >
          <Palette size={11} className="text-[#0a84ff]" />
          Themes
        </button>
      </div>

      {/* Center Drag Region / Workspace Title */}
      <div
        data-tauri-drag-region
        className="flex-1 text-center font-medium text-[11px] text-[#6b7280] pointer-events-none"
      >
        Eagle Launcher
      </div>

      {/* Right Window Controls */}
      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          title="Minimize"
          className="w-9 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] rounded transition-colors"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={handleMaximize}
          title="Maximize"
          className="w-9 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] rounded transition-colors"
        >
          <Square size={11} />
        </button>
        <button
          onClick={handleClose}
          title="Close"
          className="w-9 h-7 flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-[#e81123] rounded transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Theme Selection Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}
