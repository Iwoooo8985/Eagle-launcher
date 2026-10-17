import React from 'react';
import { GameItem } from '../../types/game';
import { GameCard } from './GameCard';
import { Sparkles, Gamepad2 } from 'lucide-react';

interface GameGridProps {
  games: GameItem[];
  emptyMessage?: string;
}

export function GameGrid({ games, emptyMessage = 'No matching titles found.' }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center text-xs text-[#71717a] border border-dashed border-[#26262a] rounded-2xl bg-[#141417]/50 p-8">
        <Gamepad2 size={28} className="text-[#3f3f46] mb-3 stroke-[1.3]" />
        <p className="text-sm font-medium text-[#a1a1aa] mb-1">{emptyMessage}</p>
        <p className="text-xs text-[#71717a]">Try adjusting your search terms or platform filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}