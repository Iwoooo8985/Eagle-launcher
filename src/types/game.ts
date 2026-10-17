export type GamePlatform = 'steam' | 'epic' | 'gog' | 'xbox' | 'standalone' | 'snes' | 'ps2' | 'gba' | 'switch' | 'itch';

export type ShelfStatus = 'playing' | 'on-deck' | 'savoring' | 'completed' | 'abandoned' | 'to-download';

export type VibeTag = 'low-energy' | 'competitive' | 'cozy' | 'narrative';

export interface JournalEntry {
  id: string;
  date: string;
  rating: number;
  note: string;
}

export interface GameItem {
  id: string;
  title: string;
  platform: GamePlatform;
  coverUrl?: string;
  launchUri: string;
  playtimeHours: number;
  lastPlayed: string;
  hltbMainHours?: number;
  shelf: ShelfStatus;
  vibes: VibeTag[];
  notes?: string;
  journal?: JournalEntry[];
  isCommunityFeed?: boolean;
  fileSize?: string;
  installed?: boolean;
  downloadSize?: string;
}