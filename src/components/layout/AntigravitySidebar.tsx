import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Coins,
  Users,
  MessageSquare,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  SlidersHorizontal,
  FolderPlus,
  Search,
  ArrowLeft,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { EagleLogo } from '../common/EagleLogo';

export type NavTab = 'library' | 'pulse' | 'deals' | 'settings';

interface AntigravitySidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onFocusSearch: () => void;
}

export function AntigravitySidebar({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onFocusSearch,
}: AntigravitySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [libraryFolderOpen, setLibraryFolderOpen] = useState(true);

  const { games, selectedPlatform, setSelectedPlatform } = useGameStore();

  const steamCount = games.filter((g) => g.platform === 'steam').length;
  const xboxCount = games.filter((g) => g.platform === 'xbox').length;
  const standaloneCount = games.filter((g) => g.platform === 'standalone' || g.id.startsWith('custom-')).length;
  const epicCount = games.filter((g) => g.platform === 'epic').length;
  const gogCount = games.filter((g) => g.platform === 'gog').length;
  const retroCount = games.filter((g) => ['snes', 'ps2', 'gba', 'switch'].includes(g.platform)).length;
  const itchCount = games.filter((g) => g.platform === 'itch').length;

  const navItems = [
    { id: 'library' as NavTab, label: 'Conversation History', displayLabel: 'Library & Titles', icon: BookOpen },
    { id: 'pulse' as NavTab, label: 'Automations', displayLabel: 'Pulse Zero Fatigue', icon: Sparkles },
    { id: 'deals' as NavTab, label: 'Customizations', displayLabel: 'Deals & Sales', icon: Coins },
  ];

  if (collapsed) {
    return (
      <aside className="w-14 h-full bg-[#141416] border-r border-[#222226] flex flex-col justify-between items-center py-3 select-none shrink-0 z-20">
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={() => setCollapsed(false)}
            title="Expand Sidebar"
            className="p-2 text-[#9ca3af] hover:text-white hover:bg-[#222226] rounded-lg transition-colors"
          >
            <PanelLeft size={16} />
          </button>

          <button
            onClick={onOpenAddModal}
            title="Add Game / ROM"
            className="w-9 h-9 rounded-lg bg-[#25252a] hover:bg-[#2d2d33] text-[#f4f4f5] flex items-center justify-center border border-[#2f2f35] transition-colors"
          >
            <Plus size={16} />
          </button>

          <div className="w-6 h-[1px] bg-[#222226]" />

          <nav className="flex flex-col gap-2 w-full items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.displayLabel}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative ${
                    isActive
                      ? 'bg-[#222226] text-white'
                      : 'text-[#9ca3af] hover:text-[#e4e4e7] hover:bg-[#1c1c1f]'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.6} />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#0a84ff] rounded-r" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => onSelectTab('settings')}
            title="Settings"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#222226] text-white'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1c1c1f]'
            }`}
          >
            <Settings size={16} />
          </button>
          <div
            title="Status: Ready & Synced"
            className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 h-full bg-[#141416] border-r border-[#222226] flex flex-col justify-between py-3.5 px-3 select-none shrink-0 z-20">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Logo & Sidebar Nav Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {/* Eagle White Logo on Gray Background */}
            <EagleLogo badgeSize="md" size={15} />
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse Sidebar"
              className="p-1 text-[#82828e] hover:text-[#f4f4f5] hover:bg-[#202024] rounded transition-colors"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {}}
              title="Back"
              className="p-1 text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#202024] rounded transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => {}}
              title="Forward"
              className="p-1 text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#202024] rounded transition-colors"
            >
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onFocusSearch}
              title="Search (Ctrl + K)"
              className="p-1 text-[#82828e] hover:text-[#f4f4f5] hover:bg-[#202024] rounded transition-colors ml-1"
            >
              <Search size={14} />
            </button>
          </div>
        </div>

        {/* Primary Action Button (+ New Conversation / + Add Game) */}
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#222226] hover:bg-[#2a2a30] border border-[#2b2b31] hover:border-[#383840] text-xs font-medium text-[#f4f4f5] transition-all shadow-sm active:scale-[0.99]"
        >
          <Plus size={15} className="text-[#a1a1aa]" />
          <span>Add Game / ROM</span>
        </button>

        {/* Main Tab Links */}
        <nav className="flex flex-col gap-0.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#222226] text-[#f4f4f5]'
                    : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1a1a1d]'
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2 : 1.6}
                  className={isActive ? 'text-[#0a84ff]' : 'text-[#82828e]'}
                />
                <span className="truncate">{item.displayLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Section: Projects / Platforms */}
        <div className="mt-3">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium tracking-wider uppercase text-[#6b7280]">
            <span>Platforms</span>
            <div className="flex items-center gap-1 text-[#82828e]">
              <button
                onClick={() => setSelectedPlatform('all')}
                title="Filter / Reset"
                className="hover:text-white p-0.5"
              >
                <SlidersHorizontal size={12} />
              </button>
              <button
                onClick={onOpenAddModal}
                title="Add Platform / Category"
                className="hover:text-white p-0.5"
              >
                <FolderPlus size={12} />
              </button>
            </div>
          </div>

          {/* Tree-style items */}
          <div className="flex flex-col gap-0.5 mt-1">
            {/* Eagle Launcher Root Folder */}
            <div>
              <button
                onClick={() => setLibraryFolderOpen(!libraryFolderOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-[#d1d5db] hover:bg-[#1a1a1d] transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {libraryFolderOpen ? (
                    <ChevronDown size={13} className="text-[#82828e]" />
                  ) : (
                    <ChevronRight size={13} className="text-[#82828e]" />
                  )}
                  <Folder size={14} className="text-[#0a84ff]" />
                  <span className="truncate font-medium">Eagle launcher</span>
                </div>
                <span className="text-[10px] text-[#6b7280]">{games.length}</span>
              </button>

              {/* Nested Platform Sub-items */}
              {libraryFolderOpen && (
                <div className="pl-6 pr-1 flex flex-col gap-0.5 mt-0.5">
                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('all');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'all' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>All Titles</span>
                    <span className="text-[10px] text-[#6b7280]">{games.length}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('steam');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'steam' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>Steam Games</span>
                    <span className="text-[10px] text-[#6b7280]">{steamCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('xbox');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'xbox' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>Xbox & Game Pass</span>
                    <span className="text-[10px] text-[#6b7280]">{xboxCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('standalone');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'standalone' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>No Launcher (Standalone)</span>
                    <span className="text-[10px] text-[#6b7280]">{standaloneCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('epic');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'epic' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>Epic Games</span>
                    <span className="text-[10px] text-[#6b7280]">{epicCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('gog');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'gog' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>GOG Galaxy</span>
                    <span className="text-[10px] text-[#6b7280]">{gogCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('library');
                      setSelectedPlatform('retro');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                      selectedPlatform === 'retro' && activeTab === 'library'
                        ? 'text-[#f4f4f5] bg-[#222226]'
                        : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    <span>Retro ROMs</span>
                    <span className="text-[10px] text-[#6b7280]">{retroCount}</span>
                  </button>

                  {itchCount > 0 && (
                    <button
                      onClick={() => {
                        onSelectTab('library');
                        setSelectedPlatform('itch');
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                        selectedPlatform === 'itch' && activeTab === 'library'
                          ? 'text-[#f4f4f5] bg-[#222226]'
                          : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1c1c1f]'
                      }`}
                    >
                      <span>itch.io Indie</span>
                      <span className="text-[10px] text-[#6b7280]">{itchCount}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pinned: Settings & Status */}
      <div className="flex flex-col gap-1 border-t border-[#222226] pt-3 px-1">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#222226] text-[#f4f4f5]'
              : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#1a1a1d]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-[#82828e]" />
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-[#6b7280]">v0.1</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
