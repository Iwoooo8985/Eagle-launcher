import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Gamepad2,
  Link,
  Image as ImageIcon,
  Sparkles,
  FolderSearch,
  FileCheck,
  FolderOpen,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { GamePlatform, ShelfStatus } from '../../types/game';
import { resolveGameArtwork } from '../../utils/metadata';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPath?: string;
  initialTitle?: string;
  initialPlatform?: GamePlatform;
}

export function AddGameModal({
  isOpen,
  onClose,
  initialPath = '',
  initialTitle = '',
  initialPlatform = 'steam',
}: AddGameModalProps) {
  const { addGame, steamGridApiKey } = useGameStore();

  const [title, setTitle] = useState(initialTitle);
  const [platform, setPlatform] = useState<GamePlatform>(initialPlatform);
  const [launchUri, setLaunchUri] = useState(initialPath);
  const [coverUrl, setCoverUrl] = useState('');
  const [shelf, setShelf] = useState<ShelfStatus>('on-deck');
  const [notes, setNotes] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    if (initialPath) setLaunchUri(initialPath);
    if (initialTitle) setTitle(initialTitle);
    if (initialPlatform) setPlatform(initialPlatform);
  }, [initialPath, initialTitle, initialPlatform, isOpen]);

  if (!isOpen) return null;

  const handlePickFile = async () => {
    setIsPicking(true);
    try {
      let picked: string | null = null;
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        picked = await invoke<string | null>('pick_game_file');
      }

      if (picked) {
        setLaunchUri(picked);

        // Extract clean title from filename
        const fileName = picked.split(/[\/\\]/).pop() || '';
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        const cleanTitle = baseName
          .replace(/[-_.]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .trim();

        setTitle(cleanTitle);

        // Auto-detect platform from file extension
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        let detectedPlatform: GamePlatform = 'steam';
        if (['sfc', 'smc'].includes(ext)) detectedPlatform = 'snes';
        else if (['gba'].includes(ext)) detectedPlatform = 'gba';
        else if (['iso', 'bin', 'chd'].includes(ext)) detectedPlatform = 'ps2';
        else if (['nsp', 'xci'].includes(ext)) detectedPlatform = 'switch';
        setPlatform(detectedPlatform);

        // Auto-resolve artwork
        resolveGameArtwork(cleanTitle, detectedPlatform, undefined, steamGridApiKey).then(
          (artUrl) => {
            if (artUrl) setCoverUrl(artUrl);
          }
        );
      }
    } catch (e) {
      console.error('File pick error:', e);
    } finally {
      setIsPicking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !launchUri.trim()) return;

    addGame({
      title: title.trim(),
      platform,
      launchUri: launchUri.trim(),
      coverUrl: coverUrl.trim() || undefined,
      shelf,
      notes: notes.trim(),
      installed: true,
    });

    setTitle('');
    setLaunchUri('');
    setCoverUrl('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#161618] border border-[#2e2e34] rounded-2xl shadow-2xl p-6 text-xs text-[#d1d5db] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#232328] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0a84ff]/15 border border-[#0a84ff]/30 flex items-center justify-center text-[#0a84ff]">
              <Gamepad2 size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f4f4f5]">Add Game to Library</h2>
              <p className="text-[11px] text-[#71717a]">
                Search for an executable, shortcut, or ROM in File Explorer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#82828e] hover:text-[#f4f4f5] p-1 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Primary Action: Search in File Explorer */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handlePickFile}
            className="w-full py-3 px-4 rounded-xl border border-[#0a84ff]/40 hover:border-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 text-[#38bdf8] hover:text-white transition-all flex items-center justify-center gap-2.5 font-medium shadow-md shadow-[#0a84ff]/10 group"
          >
            <FolderSearch
              size={18}
              className={`text-[#0a84ff] group-hover:scale-110 transition-transform ${
                isPicking ? 'animate-bounce' : ''
              }`}
            />
            <span className="text-xs font-semibold">
              {isPicking
                ? 'Opening File Explorer...'
                : 'Search for Game in File Explorer (.exe, .lnk, ROM)'}
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hades II, Chrono Trigger"
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as GamePlatform)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-2.5 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
              >
                <option value="standalone">Standalone (No Dedicated Launcher)</option>
                <option value="steam">Steam</option>
                <option value="xbox">Xbox & PC Game Pass</option>
                <option value="epic">Epic Games</option>
                <option value="gog">GOG Galaxy</option>
                <option value="snes">SNES ROM (.sfc, .smc)</option>
                <option value="ps2">PS2 ROM (.iso, .bin)</option>
                <option value="gba">GBA ROM (.gba)</option>
                <option value="switch">Switch ROM (.nsp, .xci)</option>
                <option value="itch">itch.io Indie</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1">
                Backlog Shelf
              </label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value as ShelfStatus)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-2.5 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
              >
                <option value="playing">Playing Now</option>
                <option value="on-deck">On Deck</option>
                <option value="to-download">To Download</option>
                <option value="savoring">Savoring</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]">
                Executable Path or Launch URI *
              </label>
              <button
                type="button"
                onClick={handlePickFile}
                className="text-[11px] text-[#0a84ff] hover:underline flex items-center gap-1 font-medium"
              >
                <FolderOpen size={11} /> Browse Explorer...
              </button>
            </div>
            <div className="relative flex items-center">
              <Link size={13} className="absolute left-2.5 text-[#6b7280]" />
              <input
                type="text"
                required
                value={launchUri}
                onChange={(e) => setLaunchUri(e.target.value)}
                placeholder="D:\Games\MyGame\game.exe or steam://rungameid/..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg pl-8 pr-20 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff] transition-colors"
              />
              <button
                type="button"
                onClick={handlePickFile}
                className="absolute right-1 px-2.5 py-1 rounded bg-[#202026] hover:bg-[#282830] text-[#9ca3af] hover:text-[#f4f4f5] border border-[#2e2e36] text-[11px] transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1">
              Cover Artwork URL (Optional — Auto-detected)
            </label>
            <div className="relative">
              <ImageIcon size={13} className="absolute left-2.5 top-2.5 text-[#6b7280]" />
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... cover image"
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg pl-8 pr-3 py-2 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1">
              Notes & Config Tweaks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Launch arguments, resolution, mod load order..."
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232328]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#2b2b30] text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] text-white font-medium transition-colors text-xs flex items-center gap-1.5 shadow-md shadow-[#0a84ff]/20"
            >
              <Plus size={13} /> Add Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
