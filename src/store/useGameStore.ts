import { create } from 'zustand';
import { GameItem, ShelfStatus, VibeTag } from '../types/game';
import { resolveGameArtwork } from '../utils/metadata';

interface GameState {
  games: GameItem[];
  searchQuery: string;
  selectedPlatform: string;
  selectedGame: GameItem | null;
  romPath: string;
  steamGridApiKey: string;
  optimizePowerOnLaunch: boolean;
  muteNotificationsOnLaunch: boolean;
  autoBackupSaves: boolean;
  isScanning: boolean;
  firstRunCompleted: boolean;
  googleDriveSyncEnabled: boolean;
  googleDriveSyncPath: string;
  allowGameScan: boolean;
  setSearchQuery: (q: string) => void;
  setSelectedPlatform: (p: string) => void;
  setSelectedGame: (game: GameItem | null) => void;
  setRomPath: (path: string) => void;
  setSteamGridApiKey: (key: string) => void;
  setGoogleDriveSyncEnabled: (enabled: boolean) => void;
  setGoogleDriveSyncPath: (path: string) => void;
  setAllowGameScan: (allow: boolean) => void;
  completeFirstRun: (options?: {
    allowScan: boolean;
    enableGoogleDrive: boolean;
    googleDrivePath: string;
    optimizePower?: boolean;
    muteNotifications?: boolean;
  }) => Promise<void>;
  resetFirstRun: () => void;
  backupGameSave: (gameId: string) => Promise<{ success: boolean; message: string }>;
  backupAllSaves: () => Promise<{ total: number; succeeded: number; results: any[] }>;
  setGameCustomSavePath: (gameId: string, path: string | null) => void;
  detectGameSave: (game: GameItem) => Promise<string | null>;
  openCloudFolder: (pathOverride?: string) => Promise<void>;
  validateCloudSyncPath: () => Promise<{ exists: boolean; writable: boolean; message: string; suggested_paths: string[] }>;
  toggleSetting: (key: 'optimizePowerOnLaunch' | 'muteNotificationsOnLaunch' | 'autoBackupSaves') => void;
  updateGameShelf: (id: string, shelf: ShelfStatus) => void;
  updateGamePlaytime: (id: string, playtimeHours: number) => void;
  updateGameNotes: (id: string, notes: string) => void;
  addJournalEntry: (id: string, rating: number, note: string) => void;
  addGame: (game: Partial<GameItem> & { title: string; platform: any; launchUri: string }) => void;
  removeGame: (id: string) => void;
  scanLocalDisks: () => Promise<void>;
  launchGame: (game: GameItem) => Promise<void>;
}

const STORAGE_CACHE_KEY = 'eagle_launcher_library_cache_v2';
const STORAGE_OVERRIDES_KEY = 'eagle_launcher_user_overrides_v2';
const STORAGE_FIRST_RUN_KEY = 'eagle_launcher_first_run_completed_v2';
const STORAGE_CLOUD_SETTINGS_KEY = 'eagle_launcher_cloud_settings_v2';

interface CloudSettings {
  googleDriveSyncEnabled: boolean;
  googleDriveSyncPath: string;
  allowGameScan: boolean;
}

function loadCloudSettings(): CloudSettings {
  try {
    const raw = localStorage.getItem(STORAGE_CLOUD_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    googleDriveSyncEnabled: false,
    googleDriveSyncPath: 'G:\\My Drive\\EagleSaves',
    allowGameScan: true,
  };
}

function saveCloudSettings(settings: CloudSettings) {
  try {
    localStorage.setItem(STORAGE_CLOUD_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

interface UserOverrides {
  shelf?: ShelfStatus;
  playtimeHours?: number;
  lastPlayed?: string;
  notes?: string;
  journal?: any[];
  coverUrl?: string;
  vibes?: VibeTag[];
  customSavePath?: string;
  detectedSavePath?: string;
  lastBackupTime?: string;
  lastBackupSize?: string;
  lastBackupZip?: string;
}

function cleanBogusSavePath(path?: string): string | undefined {
  if (!path) return undefined;
  const lower = path.toLowerCase();
  if (
    lower.includes('\\userdata\\') ||
    lower.includes('/userdata/') ||
    lower.includes('redlauncher') ||
    lower.includes('\\assets\\') ||
    lower.includes('/assets/')
  ) {
    return undefined;
  }
  return path;
}

function loadLibraryCache(): GameItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((g: GameItem) => {
          if (
            g.coverUrl &&
            (g.coverUrl.includes('unsplash.com') ||
              g.coverUrl.includes('capsule_616x353') ||
              (g.coverUrl.includes('/apps/1091500/') &&
                !g.title?.toLowerCase().includes('cyberpunk')))
          ) {
            g = { ...g, coverUrl: undefined };
          }
          if (g.customSavePath) {
            g = { ...g, customSavePath: cleanBogusSavePath(g.customSavePath) };
          }
          return g;
        });
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLibraryCache(games: GameItem[]) {
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(games));
  } catch {
    // ignore
  }
}

function loadUserOverrides(): Record<string, UserOverrides> {
  try {
    const raw = localStorage.getItem(STORAGE_OVERRIDES_KEY);
    if (raw) {
      const overrides: Record<string, UserOverrides> = JSON.parse(raw);
      for (const key of Object.keys(overrides)) {
        if (overrides[key].customSavePath) {
          overrides[key].customSavePath = cleanBogusSavePath(overrides[key].customSavePath);
        }
      }
      return overrides;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveUserOverride(gameId: string, updates: Partial<UserOverrides>) {
  try {
    const existing = loadUserOverrides();
    existing[gameId] = { ...existing[gameId], ...updates };
    localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

function detectVibesForTitle(title: string): VibeTag[] {
  const lower = title.toLowerCase();
  const vibes: VibeTag[] = [];

  if (
    lower.includes('aim') ||
    lower.includes('cs') ||
    lower.includes('counter') ||
    lower.includes('apex') ||
    lower.includes('valorant') ||
    lower.includes('rocket') ||
    lower.includes('rainbow') ||
    lower.includes('dead by') ||
    lower.includes('timberman') ||
    lower.includes('robber') ||
    lower.includes('ghostrunner') ||
    lower.includes('doom') ||
    lower.includes('geometry') ||
    lower.includes('osu') ||
    lower.includes('dark souls') ||
    lower.includes('sekiro') ||
    lower.includes('elden') ||
    lower.includes('cuphead') ||
    lower.includes('helldivers')
  ) {
    vibes.push('competitive');
  }

  if (
    lower.includes('craft') ||
    lower.includes('terra') ||
    lower.includes('slime') ||
    lower.includes('valley') ||
    lower.includes('astro') ||
    lower.includes('flipper') ||
    lower.includes('firewatch') ||
    lower.includes('stray') ||
    lower.includes('factorio') ||
    lower.includes('subnautica') ||
    lower.includes('sim') ||
    lower.includes('raft') ||
    lower.includes('sky') ||
    lower.includes('truck') ||
    lower.includes('scrap')
  ) {
    vibes.push('cozy');
  }

  if (
    lower.includes('cyber') ||
    lower.includes('witcher') ||
    lower.includes('detroit') ||
    lower.includes('red dead') ||
    lower.includes('rdr') ||
    lower.includes('baldur') ||
    lower.includes('fallout') ||
    lower.includes('mafia') ||
    lower.includes('forest') ||
    lower.includes('dying') ||
    lower.includes('god of') ||
    lower.includes('spider') ||
    lower.includes('horizon') ||
    lower.includes('days gone') ||
    lower.includes('last of us') ||
    lower.includes('dishonored') ||
    lower.includes('metro') ||
    lower.includes('alan wake') ||
    lower.includes('hades') ||
    lower.includes('hollow') ||
    lower.includes('story') ||
    lower.includes('bio') ||
    lower.includes('prey')
  ) {
    vibes.push('narrative');
  }

  if (
    lower.includes('survivor') ||
    lower.includes('balatro') ||
    lower.includes('buckshot') ||
    lower.includes('among') ||
    lower.includes('lethal') ||
    lower.includes('warning') ||
    lower.includes('phasmo') ||
    lower.includes('portal') ||
    lower.includes('thief') ||
    lower.includes('isaac') ||
    lower.includes('iron') ||
    lower.includes('otxo') ||
    lower.includes('celeste')
  ) {
    vibes.push('low-energy');
  }

  if (vibes.length === 0) {
    vibes.push('low-energy', 'cozy');
  }

  return vibes;
}

export const useGameStore = create<GameState>((set, get) => {
  const initialCloud = loadCloudSettings();
  const initialFirstRun =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_FIRST_RUN_KEY) === 'true'
      : false;

  return {
    games: loadLibraryCache(),
    searchQuery: '',
    selectedPlatform: 'all',
    selectedGame: null,
    romPath: 'D:/ROMs',
    steamGridApiKey: '',
    optimizePowerOnLaunch: true,
    muteNotificationsOnLaunch: true,
    autoBackupSaves: initialCloud.googleDriveSyncEnabled,
    isScanning: false,
    firstRunCompleted: initialFirstRun,
    googleDriveSyncEnabled: initialCloud.googleDriveSyncEnabled,
    googleDriveSyncPath: initialCloud.googleDriveSyncPath,
    allowGameScan: initialCloud.allowGameScan,

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedPlatform: (selectedPlatform) => set({ selectedPlatform }),
    setSelectedGame: (selectedGame) => set({ selectedGame }),
    setRomPath: (romPath) => set({ romPath }),
    setSteamGridApiKey: (steamGridApiKey) => set({ steamGridApiKey }),

    setGoogleDriveSyncEnabled: (enabled) =>
      set((state) => {
        const updated = {
          googleDriveSyncEnabled: enabled,
          googleDriveSyncPath: state.googleDriveSyncPath,
          allowGameScan: state.allowGameScan,
        };
        saveCloudSettings(updated);
        return { googleDriveSyncEnabled: enabled, autoBackupSaves: enabled };
      }),

    setGoogleDriveSyncPath: (path) =>
      set((state) => {
        const updated = {
          googleDriveSyncEnabled: state.googleDriveSyncEnabled,
          googleDriveSyncPath: path,
          allowGameScan: state.allowGameScan,
        };
        saveCloudSettings(updated);
        return { googleDriveSyncPath: path };
      }),

    setAllowGameScan: (allow) =>
      set((state) => {
        const updated = {
          googleDriveSyncEnabled: state.googleDriveSyncEnabled,
          googleDriveSyncPath: state.googleDriveSyncPath,
          allowGameScan: allow,
        };
        saveCloudSettings(updated);
        return { allowGameScan: allow };
      }),

    completeFirstRun: async (options) => {
      try {
        localStorage.setItem(STORAGE_FIRST_RUN_KEY, 'true');
      } catch {}

      if (options) {
        const cloudSettings: CloudSettings = {
          googleDriveSyncEnabled: options.enableGoogleDrive,
          googleDriveSyncPath: options.googleDrivePath,
          allowGameScan: options.allowScan,
        };
        saveCloudSettings(cloudSettings);

        set({
          firstRunCompleted: true,
          googleDriveSyncEnabled: options.enableGoogleDrive,
          googleDriveSyncPath: options.googleDrivePath,
          allowGameScan: options.allowScan,
          autoBackupSaves: options.enableGoogleDrive,
          optimizePowerOnLaunch:
            options.optimizePower !== undefined
              ? options.optimizePower
              : get().optimizePowerOnLaunch,
          muteNotificationsOnLaunch:
            options.muteNotifications !== undefined
              ? options.muteNotifications
              : get().muteNotificationsOnLaunch,
        });

        if (options.allowScan) {
          await get().scanLocalDisks();
        }
      } else {
        set({ firstRunCompleted: true });
        if (get().allowGameScan) {
          await get().scanLocalDisks();
        }
      }
    },

    resetFirstRun: () => {
      try {
        localStorage.removeItem(STORAGE_FIRST_RUN_KEY);
      } catch {}
      set({ firstRunCompleted: false });
    },

    toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),

  updateGameShelf: (id, shelf) => {
    saveUserOverride(id, { shelf });
    set((state) => {
      const updated = state.games.map((g) => (g.id === id ? { ...g, shelf } : g));
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame:
          state.selectedGame?.id === id ? { ...state.selectedGame, shelf } : state.selectedGame,
      };
    });
  },

  updateGamePlaytime: (id, playtimeHours) => {
    const cleanHours = Math.max(0, Math.round(playtimeHours * 10) / 10);
    saveUserOverride(id, { playtimeHours: cleanHours });
    set((state) => {
      const updated = state.games.map((g) =>
        g.id === id ? { ...g, playtimeHours: cleanHours } : g
      );
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame:
          state.selectedGame?.id === id
            ? { ...state.selectedGame, playtimeHours: cleanHours }
            : state.selectedGame,
      };
    });
  },

  updateGameNotes: (id, notes) => {
    saveUserOverride(id, { notes });
    set((state) => {
      const updated = state.games.map((g) => (g.id === id ? { ...g, notes } : g));
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame:
          state.selectedGame?.id === id ? { ...state.selectedGame, notes } : state.selectedGame,
      };
    });
  },

  addJournalEntry: (id, rating, note) =>
    set((state) => {
      const entry = {
        id: String(Date.now()),
        date: new Date().toLocaleDateString(),
        rating,
        note,
      };
      const updated = state.games.map((g) => {
        if (g.id === id) {
          const newJournal = [entry, ...(g.journal || [])];
          saveUserOverride(id, { journal: newJournal });
          return { ...g, journal: newJournal };
        }
        return g;
      });
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame:
          state.selectedGame?.id === id
            ? { ...state.selectedGame, journal: [entry, ...(state.selectedGame.journal || [])] }
            : state.selectedGame,
      };
    }),

  addGame: (newGame) =>
    set((state) => {
      const item: GameItem = {
        id: `custom-${Date.now()}`,
        title: newGame.title,
        platform: newGame.platform || 'steam',
        coverUrl:
          newGame.coverUrl ||
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        launchUri: newGame.launchUri,
        playtimeHours: newGame.playtimeHours || 0,
        lastPlayed: 'Just added',
        shelf: newGame.shelf || 'on-deck',
        vibes: newGame.vibes || ['low-energy'],
        hltbMainHours: newGame.hltbMainHours,
        notes: newGame.notes || '',
        installed: newGame.installed !== undefined ? newGame.installed : true,
        downloadSize: newGame.downloadSize,
      };
      const updated = [item, ...state.games];
      saveLibraryCache(updated);
      return { games: updated };
    }),

  removeGame: (id) =>
    set((state) => {
      const updated = state.games.filter((g) => g.id !== id);
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame: state.selectedGame?.id === id ? null : state.selectedGame,
      };
    }),

  scanLocalDisks: async () => {
    set({ isScanning: true });
    try {
      let scannedFromRust: any[] = [];

      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        scannedFromRust = await invoke('scan_all_games', { romDir: get().romPath });
      }

      if (scannedFromRust.length > 0) {
        const overrides = loadUserOverrides();
        const currentGames = get().games;

        const mappedRustGames: GameItem[] = await Promise.all(
          scannedFromRust.map(async (raw) => {
            const existing = currentGames.find((g) => g.id === raw.id);
            const userOverride = overrides[raw.id];

            const playtime =
              userOverride?.playtimeHours !== undefined
                ? userOverride.playtimeHours
                : (raw.playtimeHours ?? existing?.playtimeHours ?? 0);

            const lastPlayed =
              raw.lastPlayed || userOverride?.lastPlayed || existing?.lastPlayed || 'Installed';

            const shelf =
              userOverride?.shelf || existing?.shelf || ('on-deck' as ShelfStatus);

            const notes = userOverride?.notes ?? existing?.notes ?? '';
            const journal = userOverride?.journal ?? existing?.journal ?? [];

            return {
              id: raw.id,
              title: raw.title,
              platform: raw.platform,
              coverUrl: (() => {
                const isLegacyCover =
                  existing?.coverUrl &&
                  (existing.coverUrl.includes('unsplash.com') ||
                    existing.coverUrl.includes('capsule_616x353') ||
                    (existing.coverUrl.includes('/apps/1091500/') &&
                      !raw.title.toLowerCase().includes('cyberpunk')));
                if (!isLegacyCover && (userOverride?.coverUrl || existing?.coverUrl)) {
                  return userOverride?.coverUrl || existing?.coverUrl;
                }
                return undefined;
              })() || (await resolveGameArtwork(raw.title, raw.platform, raw.id, get().steamGridApiKey)) || undefined,
              launchUri: raw.launchUri,
              playtimeHours: playtime,
              lastPlayed: lastPlayed,
              shelf: shelf,
              vibes:
                userOverride?.vibes ||
                (existing?.vibes && existing.vibes.length > 0
                  ? existing.vibes
                  : detectVibesForTitle(raw.title)),
              notes,
              journal,
              installed: true,
              customSavePath: userOverride?.customSavePath ?? existing?.customSavePath,
              lastBackupTime: userOverride?.lastBackupTime ?? existing?.lastBackupTime,
              lastBackupSize: userOverride?.lastBackupSize ?? existing?.lastBackupSize,
              lastBackupZip: userOverride?.lastBackupZip ?? existing?.lastBackupZip,
            };
          })
        );

        // Keep user-added custom games
        const customItems = currentGames.filter(
          (g) => !mappedRustGames.some((m) => m.id === g.id) && g.id.startsWith('custom-')
        );

        const allUpdatedGames = [...mappedRustGames, ...customItems];
        saveLibraryCache(allUpdatedGames);
        set({ games: allUpdatedGames, isScanning: false });
      } else {
        set({ isScanning: false });
      }
    } catch {
      set({ isScanning: false });
    }
  },

  backupGameSave: async (gameId: string) => {
    const game = get().games.find((g) => g.id === gameId);
    if (!game) return { success: false, message: 'Game not found.' };

    const cloudDir = get().googleDriveSyncPath.trim();
    if (!cloudDir) {
      return {
        success: false,
        message: 'No Google Drive backup path configured. Please choose a folder in Settings.',
      };
    }

    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');

        // Verify/Create cloud directory first
        const dirInfo = await invoke<any>('validate_or_create_cloud_dir', { targetDir: cloudDir });
        if (!dirInfo.writable) {
          return {
            success: false,
            message: dirInfo.message || 'Backup folder is not writable or Google Drive is disconnected.',
          };
        }

        // Perform backup
        const result = await invoke<any>('backup_single_game_save', {
          title: game.title,
          platform: game.platform,
          gameId: game.id,
          customSavePath: game.customSavePath || null,
          targetCloudDir: cloudDir,
        });

        if (result.success) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          saveUserOverride(gameId, {
            detectedSavePath: result.source_save_path,
            lastBackupTime: nowStr,
            lastBackupSize: result.file_size_human,
            lastBackupZip: result.zip_path,
          });

          set((state) => {
            const updated = state.games.map((g) =>
              g.id === gameId
                ? {
                    ...g,
                    detectedSavePath: result.source_save_path,
                    lastBackupTime: nowStr,
                    lastBackupSize: result.file_size_human,
                    lastBackupZip: result.zip_path,
                  }
                : g
            );
            saveLibraryCache(updated);
            return {
              games: updated,
              selectedGame:
                state.selectedGame?.id === gameId
                  ? {
                      ...state.selectedGame,
                      detectedSavePath: result.source_save_path,
                      lastBackupTime: nowStr,
                      lastBackupSize: result.file_size_human,
                      lastBackupZip: result.zip_path,
                    }
                  : state.selectedGame,
            };
          });

          return { success: true, message: `Backed up to Google Drive (${result.file_size_human})` };
        } else {
          return { success: false, message: result.message || 'Save backup failed.' };
        }
      } else {
        return { success: false, message: 'Cloud backup requires desktop application mode.' };
      }
    } catch (e: any) {
      return { success: false, message: e?.toString() || 'Save backup failed.' };
    }
  },

  backupAllSaves: async () => {
    const cloudDir = get().googleDriveSyncPath.trim();
    if (!cloudDir) return { total: 0, succeeded: 0, results: [] };

    const games = get().games;
    let succeeded = 0;
    const results: any[] = [];

    for (const g of games) {
      const res = await get().backupGameSave(g.id);
      results.push({ id: g.id, title: g.title, ...res });
      if (res.success) succeeded++;
    }

    return { total: games.length, succeeded, results };
  },

  setGameCustomSavePath: (gameId: string, path: string | null) => {
    saveUserOverride(gameId, { customSavePath: path || undefined });
    set((state) => {
      const updated = state.games.map((g) =>
        g.id === gameId ? { ...g, customSavePath: path || undefined } : g
      );
      saveLibraryCache(updated);
      return {
        games: updated,
        selectedGame:
          state.selectedGame?.id === gameId
            ? { ...state.selectedGame, customSavePath: path || undefined }
            : state.selectedGame,
      };
    });
  },

  detectGameSave: async (game: GameItem) => {
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const detected = await invoke<string | null>('detect_game_save_path', {
          title: game.title,
          platform: game.platform,
          gameId: game.id,
        });
        if (detected) {
          saveUserOverride(game.id, { detectedSavePath: detected });
          set((state) => {
            const updated = state.games.map((g) =>
              g.id === game.id ? { ...g, detectedSavePath: detected } : g
            );
            saveLibraryCache(updated);
            return {
              games: updated,
              selectedGame:
                state.selectedGame?.id === game.id
                  ? { ...state.selectedGame, detectedSavePath: detected }
                  : state.selectedGame,
            };
          });
        }
        return detected;
      }
    } catch (e) {
      console.error('Failed to detect save path:', e);
    }
    return null;
  },

  openCloudFolder: async (pathOverride?: string) => {
    const target = pathOverride || get().googleDriveSyncPath;
    if (!target) return;
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_folder_in_explorer', { path: target });
      }
    } catch (e) {
      console.error('Failed to open folder in explorer:', e);
    }
  },

  validateCloudSyncPath: async () => {
    const target = get().googleDriveSyncPath;
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<any>('validate_or_create_cloud_dir', { targetDir: target });
      }
    } catch (e: any) {
      return {
        exists: false,
        writable: false,
        message: e?.toString() || 'Validation error',
        suggested_paths: [],
      };
    }
    return { exists: false, writable: false, message: 'Web preview mode', suggested_paths: [] };
  },

  launchGame: async (game) => {
    try {
      saveUserOverride(game.id, { lastPlayed: 'Just now' });
      set((state) => {
        const updated = state.games.map((g) =>
          g.id === game.id ? { ...g, lastPlayed: 'Just now' } : g
        );
        saveLibraryCache(updated);
        return {
          games: updated,
          selectedGame:
            state.selectedGame?.id === game.id
              ? { ...state.selectedGame, lastPlayed: 'Just now' }
              : state.selectedGame,
        };
      });

      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('launch_game_uri', {
          uri: game.launchUri,
          platform: game.platform,
          optimizePower: get().optimizePowerOnLaunch,
        });

        // Background auto-backup trigger on game exit
        if (get().googleDriveSyncEnabled && get().googleDriveSyncPath.trim()) {
          const gameId = game.id;
          const gameTitle = game.title;
          const searchKeyword = gameTitle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);

          setTimeout(() => {
            let hasBeenDetected = false;
            let checkCount = 0;
            const watcherInterval = setInterval(async () => {
              checkCount++;
              try {
                const running = await invoke<boolean>('is_process_running', {
                  processKeyword: searchKeyword,
                });
                if (running) {
                  hasBeenDetected = true;
                } else if (hasBeenDetected || checkCount >= 100) {
                  clearInterval(watcherInterval);
                  // Game exited: allow 3s for final save writes and backup
                  setTimeout(() => {
                    get().backupGameSave(gameId);
                  }, 3000);
                }
              } catch {
                clearInterval(watcherInterval);
              }
            }, 6000);
          }, 3000);
        }
      } else if (game.launchUri.startsWith('http') || game.launchUri.includes('://')) {
        window.open(game.launchUri, '_blank');
      }
    } catch (e) {
      console.error('Launch error:', e);
    }
  },
};
});