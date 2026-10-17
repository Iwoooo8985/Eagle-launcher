import React, { useState } from 'react';
import { Filter, X, Play, FileText, BookMarked, Sparkles, ExternalLink, Clock, Edit3, Trash2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { ShelfStatus } from '../types/game';
import { GameGrid } from '../components/cards/GameGrid';
import { SpotlightBar } from '../components/layout/SpotlightBar';
import { GameCoverImage } from '../components/cards/GameCoverImage';

interface LibraryViewProps {
  onOpenAddModal: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

const SHELVES: { id: 'all' | ShelfStatus; label: string }[] = [
  { id: 'all', label: 'All Titles' },
  { id: 'playing', label: 'Playing Now' },
  { id: 'on-deck', label: 'On Deck' },
  { id: 'to-download', label: 'To Download' },
  { id: 'savoring', label: 'Savoring' },
  { id: 'completed', label: 'Completed' },
  { id: 'abandoned', label: 'Dropped' },
];

export function LibraryView({ onOpenAddModal, searchInputRef }: LibraryViewProps) {
  const {
    games,
    searchQuery,
    selectedPlatform,
    selectedGame,
    setSelectedGame,
    updateGameShelf,
    updateGamePlaytime,
    updateGameNotes,
    addJournalEntry,
    removeGame,
    launchGame,
  } = useGameStore();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customHours, setCustomHours] = useState('');

  const [activeShelf, setActiveShelf] = useState<'all' | ShelfStatus>('all');
  const [journalNote, setJournalNote] = useState('');
  const [journalRating, setJournalRating] = useState(5);

  const filteredGames = games.filter((g) => {
    const matchesQuery = g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isRetro = ['snes', 'ps2', 'gba', 'switch'].includes(g.platform);
    const isStandalone = g.platform === 'standalone' || g.id.startsWith('custom-');
    const matchesPlatform =
      selectedPlatform === 'all' ||
      (selectedPlatform === 'retro' && isRetro) ||
      (selectedPlatform === 'standalone' && isStandalone) ||
      g.platform === selectedPlatform;
    const matchesShelf = activeShelf === 'all' || g.shelf === activeShelf;
    return matchesQuery && matchesPlatform && matchesShelf;
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0f0f11]">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Antigravity Spotlight / Central Search Card */}
        <SpotlightBar
          onOpenAddModal={onOpenAddModal}
          searchInputRef={searchInputRef}
        />

        {/* Shelf Tabs Filter Bar */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1f1f23]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {SHELVES.map((shelf) => (
              <button
                key={shelf.id}
                onClick={() => setActiveShelf(shelf.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeShelf === shelf.id
                    ? 'bg-[#222226] text-[#f4f4f5] border border-[#2e2e34] shadow-sm'
                    : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#18181b] border border-transparent'
                }`}
              >
                {shelf.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#71717a] flex items-center gap-1.5">
            <Filter size={12} />
            <span className="font-medium text-[#a1a1aa]">{filteredGames.length}</span> titles
          </span>
        </div>

        {/* Game Grid */}
        <GameGrid games={filteredGames} />
      </main>

      {/* Antigravity Inspector Slide-over Drawer */}
      {selectedGame && (
        <aside className="w-80 border-l border-[#222226] bg-[#141416] p-5 overflow-y-auto flex flex-col justify-between shrink-0 animate-slideInRight">
          <div className="space-y-5">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#222226]">
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0a84ff] bg-[#0a84ff]/10 px-2 py-0.5 rounded-full border border-[#0a84ff]/20">
                  {selectedGame.platform}
                </span>
                <h2 className="text-sm font-semibold text-[#f4f4f5] mt-2">
                  {selectedGame.title}
                </h2>

                {/* Editable Playtime & Last Played */}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#71717a]">
                  {isEditingTime ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseFloat(customHours);
                        if (!isNaN(val)) {
                          updateGamePlaytime(selectedGame.id, val);
                        }
                        setIsEditingTime(false);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        placeholder={String(selectedGame.playtimeHours)}
                        autoFocus
                        className="w-16 bg-[#18181b] border border-[#0a84ff] rounded px-1.5 py-0.5 text-xs text-[#f4f4f5] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#9ca3af]">hrs</span>
                      <button
                        type="submit"
                        className="px-2 py-0.5 rounded bg-[#0a84ff] text-white text-[10px] font-medium"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingTime(false)}
                        className="px-1.5 py-0.5 text-[10px] text-[#71717a] hover:text-[#f4f4f5]"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <Clock size={11} className="text-[#6b7280]" />
                      <span>{selectedGame.playtimeHours}h played</span>
                      <button
                        onClick={() => {
                          setCustomHours(String(selectedGame.playtimeHours));
                          setIsEditingTime(true);
                        }}
                        title="Edit playtime"
                        className="opacity-60 hover:opacity-100 text-[#0a84ff] p-0.5 rounded hover:bg-white/5 transition-opacity"
                      >
                        <Edit3 size={11} />
                      </button>
                      <span>• {selectedGame.lastPlayed}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setIsEditingTime(false);
                }}
                className="text-[#82828e] hover:text-[#f4f4f5] p-1 rounded-md hover:bg-[#202024] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Poster Thumbnail */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#27272a] shadow-md bg-[#141416]">
              <GameCoverImage
                coverUrl={selectedGame.coverUrl}
                title={selectedGame.title}
                platform={selectedGame.platform}
                gameId={selectedGame.id}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-70 pointer-events-none" />
            </div>

            {/* Vibrant Launch / Download Action Button */}
            <button
              onClick={() => launchGame(selectedGame)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0a84ff] hover:bg-[#0070e0] active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0a84ff]/25"
            >
              {selectedGame.shelf === 'to-download' || selectedGame.installed === false ? (
                <>
                  <ExternalLink size={14} />
                  Install & Download ({selectedGame.platform.toUpperCase()})
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Launch Game
                </>
              )}
            </button>

            {/* Backlog Shelf Selector */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1.5">
                Backlog Shelf
              </label>
              <select
                value={selectedGame.shelf}
                onChange={(e) => updateGameShelf(selectedGame.id, e.target.value as ShelfStatus)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
              >
                <option value="playing">Playing Now</option>
                <option value="on-deck">On Deck</option>
                <option value="to-download">To Download</option>
                <option value="savoring">Savoring</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned / Dropped</option>
              </select>
            </div>

            {/* Notes & Config Scratchpad */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-1.5">
                <FileText size={12} className="text-[#82828e]" />
                Tweaks & Notes
              </label>
              <textarea
                rows={3}
                value={selectedGame.notes || ''}
                onChange={(e) => updateGameNotes(selectedGame.id, e.target.value)}
                placeholder="FOV tweaks, launch args, mod order..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#d1d5db] placeholder-[#6b7280] focus:outline-none focus:border-[#0a84ff] transition-colors"
              />
            </div>

            {/* Session Gaming Diary */}
            <div className="border-t border-[#222226] pt-4">
              <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] mb-2">
                <BookMarked size={12} className="text-[#82828e]" />
                Session Micro-Journal
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9ca3af]">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setJournalRating(num)}
                        className={`w-5 h-5 rounded text-[11px] border transition-colors ${
                          journalRating >= num
                            ? 'border-[#0a84ff] text-white bg-[#0a84ff]/20'
                            : 'border-[#27272a] text-[#71717a] hover:border-[#383840]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="Memory or progress note..."
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-[#f4f4f5] placeholder-[#6b7280] focus:outline-none focus:border-[#0a84ff]"
                />
                <button
                  onClick={() => {
                    if (!journalNote.trim()) return;
                    addJournalEntry(selectedGame.id, journalRating, journalNote);
                    setJournalNote('');
                  }}
                  className="w-full py-1.5 rounded-lg border border-[#2b2b31] bg-[#1a1a1d] hover:bg-[#222226] text-xs text-[#f4f4f5] transition-colors"
                >
                  Log Session Note
                </button>
              </div>

              {selectedGame.journal && selectedGame.journal.length > 0 && (
                <div className="mt-3 space-y-2 max-h-36 overflow-y-auto">
                  {selectedGame.journal.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-lg bg-[#18181b] border border-[#242429] text-[11px]"
                    >
                      <div className="flex justify-between text-[#82828e] mb-1">
                        <span>{entry.date}</span>
                        <span className="text-amber-400">★ {entry.rating}/5</span>
                      </div>
                      <p className="text-[#d1d5db]">{entry.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remove from Library Button (for custom / to-download games) */}
            {(selectedGame.shelf === 'to-download' || selectedGame.id.startsWith('custom-')) && (
              <div className="pt-3 border-t border-[#222226]">
                <button
                  onClick={() => removeGame(selectedGame.id)}
                  className="w-full py-1.5 px-3 rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={12} /> Remove from Library
                </button>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}