import React from 'react';
import { Play, Clock, Hourglass, MoreVertical, Download, ArrowDownToLine } from 'lucide-react';
import { GameItem, ShelfStatus } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { GameCoverImage } from './GameCoverImage';

interface GameCardProps {
  game: GameItem;
}

const SHELF_COLORS: Record<ShelfStatus, string> = {
  playing: 'bg-emerald-400',
  'on-deck': 'bg-amber-400',
  savoring: 'bg-purple-400',
  completed: 'bg-blue-400',
  'to-download': 'bg-sky-400',
  abandoned: 'bg-neutral-500',
};

export function GameCard({ game }: GameCardProps) {
  const { launchGame, setSelectedGame } = useGameStore();

  const isDownload = game.shelf === 'to-download' || game.installed === false;
  const shelfDotColor = SHELF_COLORS[game.shelf] || 'bg-neutral-400';

  return (
    <div
      onClick={() => setSelectedGame(game)}
      className="group relative bg-[#18181b] hover:bg-[#1e1e22] border border-[#27272a] hover:border-[#3c3c44] rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
    >
      {/* Horizontal Game Image Container (16:9 Widescreen) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141416]">
        <GameCoverImage
          coverUrl={game.coverUrl}
          title={game.title}
          platform={game.platform}
          gameId={game.id}
          aspect="horizontal"
          className="group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity pointer-events-none" />

        {/* Platform Badge */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-medium tracking-wider uppercase text-[#f4f4f5]">
          {game.platform}
        </div>

        {/* To Download / HLTB Duration Badge */}
        {isDownload ? (
          <div className="absolute top-2.5 right-2.5 bg-[#0a84ff]/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#0a84ff]/50 text-[10px] text-white flex items-center gap-1 font-medium">
            <ArrowDownToLine size={10} className="text-[#38bdf8]" />
            {game.downloadSize || 'Ready'}
          </div>
        ) : game.hltbMainHours ? (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-[#d1d5db] flex items-center gap-1 font-medium">
            <Hourglass size={10} className="text-[#9ca3af]" />
            {game.hltbMainHours}h
          </div>
        ) : null}

        {/* Hover Launch/Download Trigger Overlay with Liquid Glass Play Button */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              launchGame(game);
            }}
            title={isDownload ? 'Download & Install Game' : 'Launch Game'}
            className="group/btn relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/35 via-white/15 to-white/5 border border-white/40 border-t-white/80 border-l-white/70 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_36px_rgba(255,255,255,0.3),0_0_24px_rgba(10,132,255,0.5),inset_0_2px_5px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.3)]"
          >
            {/* Liquid specular dome highlight */}
            <div className="absolute top-1 left-2.5 right-2.5 h-3.5 rounded-full bg-gradient-to-b from-white/70 to-transparent pointer-events-none opacity-85" />

            {/* Liquid fluid shimmer sweep animation */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Glowing Icon */}
            {isDownload ? (
              <Download
                size={20}
                strokeWidth={2.4}
                className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] relative z-10"
              />
            ) : (
              <Play
                size={20}
                fill="white"
                className="text-white ml-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] relative z-10"
              />
            )}
          </button>
        </div>
      </div>

      {/* Card Info Footer Underneath */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-[#18181b]">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <span
              title={`Shelf: ${game.shelf}`}
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${shelfDotColor}`}
            />
            <h3
              className="text-xs font-semibold text-[#f4f4f5] truncate group-hover:text-[#0a84ff] transition-colors"
              title={game.title}
            >
              {game.title}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGame(game);
            }}
            className="text-[#71717a] hover:text-[#f4f4f5] transition-colors p-0.5 rounded hover:bg-[#25252a] shrink-0"
          >
            <MoreVertical size={13} />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#82828e]">
          {isDownload ? (
            <span className="flex items-center gap-1 text-[#38bdf8] font-medium">
              <Download size={11} />
              To Download
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-[#6b7280]" />
              {game.playtimeHours}h
            </span>
          )}
          <span className="text-[10px] text-[#71717a]">
            {isDownload ? game.downloadSize || 'Uninstalled' : game.lastPlayed}
          </span>
        </div>
      </div>
    </div>
  );
}