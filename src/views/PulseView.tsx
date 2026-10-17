import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Coffee,
  CloudRain,
  Hourglass,
  Dices,
  Play,
  RotateCcw,
  CheckCircle,
  Gamepad2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { VibeTag, GameItem } from '../types/game';
import { GameCoverImage } from '../components/cards/GameCoverImage';
import { GameGrid } from '../components/cards/GameGrid';

const VIBE_PRESETS: {
  id: VibeTag;
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ComponentType<any>;
}[] = [
  {
    id: 'low-energy',
    title: '20 Min & Low Energy',
    subtitle: 'Zero mental friction, instant pick-up sessions',
    accent: '#f59e0b',
    icon: Coffee,
  },
  {
    id: 'competitive',
    title: 'High-Focus & Mechanical',
    subtitle: 'Fast reflex loops, shooters & precision action',
    accent: '#ef4444',
    icon: Zap,
  },
  {
    id: 'cozy',
    title: 'Rainy Sunday Cozy',
    subtitle: 'Relaxed pacing, building & chill exploration',
    accent: '#10b981',
    icon: CloudRain,
  },
  {
    id: 'narrative',
    title: 'Deep Story Immersion',
    subtitle: 'Rich worldbuilding & cinematic playthroughs',
    accent: '#8b5cf6',
    icon: Sparkles,
  },
];

export function PulseView() {
  const { games, launchGame, setSelectedGame } = useGameStore();
  const [selectedVibe, setSelectedVibe] = useState<VibeTag>('low-energy');
  const [maxHours, setMaxHours] = useState<number>(100);
  const [installedOnly, setInstalledOnly] = useState(true);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Filter games matching current mood
  const matchingGames = useMemo(() => {
    return games.filter((g) => {
      const hasVibe = g.vibes && g.vibes.includes(selectedVibe);
      const isInstalled = !installedOnly || g.installed !== false;
      const withinTime = !g.hltbMainHours || g.hltbMainHours <= maxHours;
      return hasVibe && isInstalled && withinTime;
    });
  }, [games, selectedVibe, installedOnly, maxHours]);

  // Current featured recommendation
  const spotlightGame: GameItem | undefined =
    matchingGames.length > 0 ? matchingGames[spotlightIndex % matchingGames.length] : undefined;

  const handleRollAnother = () => {
    if (matchingGames.length <= 1) return;
    setIsRolling(true);
    setTimeout(() => {
      setSpotlightIndex((prev) => (prev + 1) % matchingGames.length);
      setIsRolling(false);
    }, 200);
  };

  const handleLaunch = (game: GameItem) => {
    launchGame(game);
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#0f0f11]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#0a84ff]" />
          <h1 className="text-xs font-semibold tracking-wider text-[#9ca3af] uppercase">
            Pulse — Zero Decision Fatigue
          </h1>
        </div>
        <p className="text-xs text-[#71717a] mt-1">
          Tired of staring at your library? Choose your current mental bandwidth, and let Eagle decide what you play right now.
        </p>
      </div>

      {/* Vibe / Bandwidth Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {VIBE_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedVibe === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedVibe(preset.id);
                setSpotlightIndex(0);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#18181f] border-[#0a84ff] text-[#f4f4f5] shadow-lg shadow-[#0a84ff]/10 scale-[1.01]'
                  : 'bg-[#141416] border-[#222226] text-[#d1d5db] hover:border-[#323238] hover:bg-[#18181b]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: isSelected ? `${preset.accent}15` : '#1f1f23',
                    borderColor: isSelected ? `${preset.accent}40` : '#2d2d34',
                    color: preset.accent,
                  }}
                >
                  <Icon size={16} />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#0a84ff] animate-pulse" />
                )}
              </div>
              <div className="text-xs font-semibold text-[#f4f4f5]">{preset.title}</div>
              <div className="text-[11px] text-[#71717a] mt-1 line-clamp-1">{preset.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* The Zero Decision Decider Hero Card */}
      {spotlightGame ? (
        <section className="bg-gradient-to-br from-[#18181e] via-[#141417] to-[#101012] border border-[#27272f] rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0a84ff]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Box Art Preview (16:9 Banner) */}
            <div className="w-full lg:w-96 aspect-video rounded-xl overflow-hidden border border-[#2a2a32] shadow-xl shrink-0 group relative">
              <GameCoverImage
                coverUrl={spotlightGame.coverUrl}
                title={spotlightGame.title}
                platform={spotlightGame.platform}
                gameId={spotlightGame.id}
                aspect="horizontal"
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  isRolling ? 'opacity-50 scale-95' : 'opacity-100'
                }`}
              />

              {/* Platform badge overlay */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold uppercase text-white/90">
                {spotlightGame.platform}
              </div>
            </div>

            {/* Decision Details & Actions */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] text-[10px] font-semibold uppercase tracking-wider">
                    Eagle Decision Pick
                  </span>
                  <span className="text-[11px] text-[#71717a]">
                    Matches {VIBE_PRESETS.find((v) => v.id === selectedVibe)?.title}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#f4f4f5] tracking-tight">
                  {spotlightGame.title}
                </h2>
              </div>

              {/* Quick Game Stats */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#a1a1aa]">
                <div className="flex items-center gap-1.5 bg-[#1a1a20] px-3 py-1.5 rounded-lg border border-[#27272f]">
                  <Clock size={13} className="text-[#0a84ff]" />
                  <span>
                    Played: <strong>{spotlightGame.playtimeHours}h</strong>
                  </span>
                </div>

                {spotlightGame.hltbMainHours && (
                  <div className="flex items-center gap-1.5 bg-[#1a1a20] px-3 py-1.5 rounded-lg border border-[#27272f]">
                    <Hourglass size={13} className="text-emerald-400" />
                    <span>
                      Est. Duration: <strong>{spotlightGame.hltbMainHours}h</strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-[#1a1a20] px-3 py-1.5 rounded-lg border border-[#27272f]">
                  <CheckCircle size={13} className="text-blue-400" />
                  <span>Installed & Ready to Launch</span>
                </div>
              </div>

              {/* Instant Action Liquid Glass Play Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleLaunch(spotlightGame)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a84ff] to-[#0060df] hover:from-[#1a8eff] hover:to-[#0070f0] text-white font-semibold text-xs tracking-wide flex items-center gap-2.5 shadow-lg shadow-[#0a84ff]/25 active:scale-95 transition-all"
                >
                  <Play size={15} fill="white" />
                  <span>Launch Now (Zero Friction)</span>
                </button>

                <button
                  onClick={handleRollAnother}
                  disabled={matchingGames.length <= 1}
                  className="px-4 py-3 rounded-xl bg-[#222228] hover:bg-[#2a2a32] border border-[#32323c] text-[#f4f4f5] font-medium text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                  title="Spin for another title matching this mood"
                >
                  <Dices size={15} className={isRolling ? 'animate-spin' : ''} />
                  <span>Roll Another ({matchingGames.length})</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-[#141416] border border-[#222226] rounded-2xl p-8 text-center space-y-3">
          <Gamepad2 size={32} className="mx-auto text-[#6b7280]" />
          <h3 className="text-sm font-semibold text-[#f4f4f5]">
            No games found for this exact duration
          </h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            Try adjusting the duration cap slider below or disabling the "Installed Only" toggle.
          </p>
        </div>
      )}

      {/* Filter & Fine-Tuning Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141416] border border-[#222226] rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Hourglass size={14} className="text-[#0a84ff] shrink-0" />
          <span className="text-xs text-[#d1d5db]">Duration Limit:</span>
          <strong className="text-xs text-[#f4f4f5] font-semibold min-w-24">
            {maxHours >= 100 ? 'Any Duration' : `< ${maxHours} Hours`}
          </strong>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={maxHours}
            onChange={(e) => setMaxHours(Number(e.target.value))}
            className="w-36 accent-[#0a84ff] cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#9ca3af] self-end sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={installedOnly}
              onChange={(e) => setInstalledOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0a84ff] rounded cursor-pointer"
            />
            <span>Installed Only</span>
          </label>

          <span className="text-[#6b7280]">•</span>
          <span>
            <strong className="text-[#f4f4f5]">{matchingGames.length}</strong> matching games
          </span>
        </div>
      </div>

      {/* Secondary Grid of all mood-matched titles */}
      {matchingGames.length > 1 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              All Titles For This Mood ({matchingGames.length})
            </h3>
            <span className="text-[11px] text-[#71717a]">
              Click any game card to inspect or play
            </span>
          </div>

          <GameGrid games={matchingGames} emptyMessage="No other titles found." />
        </div>
      )}
    </main>
  );
}