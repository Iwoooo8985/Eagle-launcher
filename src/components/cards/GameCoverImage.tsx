import React, { useState, useEffect } from 'react';
import { Gamepad2, Disc3, Sparkles } from 'lucide-react';
import { extractSteamAppId } from '../../utils/metadata';

interface GameCoverImageProps {
  coverUrl?: string;
  title: string;
  platform?: string;
  gameId?: string;
  className?: string;
  aspect?: 'poster' | 'horizontal';
}

// Deterministic aesthetic gradient palettes for games without box art
const GRADIENT_PALETTES = [
  'from-[#1e1b4b] via-[#171438] to-[#0a0918]', // Deep indigo nebula
  'from-[#062c20] via-[#091e17] to-[#060e0a]', // Tactical emerald
  'from-[#3b071e] via-[#240a16] to-[#0d0408]', // Crimson twilight
  'from-[#162a45] via-[#101b2c] to-[#080d14]', // Polar sapphire
  'from-[#2e1065] via-[#1e0a42] to-[#0c041c]', // Royal amethyst
  'from-[#2d1b06] via-[#1c1206] to-[#0d0803]', // Amber bronze
  'from-[#1f242d] via-[#14171d] to-[#0b0d10]', // Carbon graphite
];

function getPaletteForTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export function GameCoverImage({
  coverUrl,
  title,
  platform = 'steam',
  gameId,
  className = '',
  aspect = 'horizontal',
}: GameCoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(coverUrl);
  const [attempt, setAttempt] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);

  const getSteamAppId = (): string | null => {
    return (
      extractSteamAppId(gameId || '') ||
      extractSteamAppId(coverUrl || '') ||
      null
    );
  };

  useEffect(() => {
    const appId = getSteamAppId();
    if (appId) {
      // Prioritize Steam's universal 460x215 header that exists for 100% of Steam titles
      setCurrentSrc(
        `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`
      );
    } else if (coverUrl && !coverUrl.includes('unsplash.com')) {
      setCurrentSrc(coverUrl);
    } else {
      // Attempt to query native Steam artwork
      if ('__TAURI_INTERNALS__' in window) {
        import('@tauri-apps/api/core')
          .then(({ invoke }) => {
            invoke<string | null>('query_steam_artwork', { title }).then((found) => {
              if (found) {
                setCurrentSrc(found);
              } else if (coverUrl) {
                setCurrentSrc(coverUrl);
              } else {
                setFailed(true);
              }
            });
          })
          .catch(() => {
            if (coverUrl) setCurrentSrc(coverUrl);
            else setFailed(true);
          });
      } else if (coverUrl) {
        setCurrentSrc(coverUrl);
      } else {
        setFailed(true);
      }
    }
    setAttempt(0);
    setFailed(false);
  }, [coverUrl, gameId, title]);

  const handleError = () => {
    const appId = getSteamAppId();

    if (appId) {
      if (attempt === 0) {
        setAttempt(1);
        setCurrentSrc(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`);
      } else if (attempt === 1) {
        setAttempt(2);
        setCurrentSrc(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`);
      } else if (attempt === 2) {
        setAttempt(3);
        setCurrentSrc(
          `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`
        );
      } else if (attempt === 3) {
        setAttempt(4);
        setCurrentSrc(
          `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`
        );
      } else {
        setFailed(true);
      }
    } else {
      setFailed(true);
    }
  };

  const paletteGradient = getPaletteForTitle(title);

  if (failed || !currentSrc) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-br ${paletteGradient} border border-white/10 select-none ${className}`}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

        {/* Ambient subtle backlight glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="w-full flex items-center justify-between z-10">
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
            {platform}
          </span>
          <Disc3 size={14} className="text-white/40" />
        </div>

        {/* Center Title and Controller for Horizontal Layout */}
        <div className="flex items-center gap-3 my-auto z-10 px-1">
          <div className="w-11 h-11 rounded-xl bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
            <Gamepad2 className="w-6 h-6 text-white/90" strokeWidth={1.8} />
          </div>
          <div className="truncate flex-1">
            <h4
              className="text-xs font-bold text-white leading-snug truncate drop-shadow-md"
              title={title}
            >
              {title}
            </h4>
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
              Verified Title
            </span>
          </div>
        </div>

        {/* Bottom accent glow strip */}
        <div className="w-full h-0.5 bg-gradient-to-r from-white/30 via-white/10 to-transparent rounded-full z-10" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={title}
      loading="lazy"
      onError={handleError}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
