/**
 * High-speed title-to-SteamAppId / Artwork mapping for popular PC games, Epic, GOG, ROMs & Indies.
 */
const GAME_TITLE_MAP: Record<string, string> = {
  // AAA & Popular PC Games
  'grand theft auto v': '271590',
  'gta v': '271590',
  'gta 5': '271590',
  'grand theft auto iv': '12210',
  'gta iv': '12210',
  'grand theft auto san andreas': '12120',
  'cyberpunk 2077': '1091500',
  'cyberpunk': '1091500',
  'the witcher 3': '292030',
  'the witcher 3 wild hunt': '292030',
  'witcher 3': '292030',
  'witcher 2': '20920',
  'red dead redemption 2': '1174180',
  'rdr2': '1174180',
  'hades': '1145360',
  'hades ii': '1145350',
  'hades 2': '1145350',
  'terraria': '105600',
  'subnautica': '264710',
  'subnautica 2': '4001890',
  'subnautica below zero': '848450',
  'the forest': '242760',
  'sons of the forest': '1078730',
  'dying light': '239140',
  'dying light 2': '534380',
  'dying light the beast': '3008130',
  'detroit become human': '1222140',
  'mafia definitive edition': '1030840',
  'mafia ii': '50130',
  'euro truck simulator 2': '227300',
  'portal 2': '620',
  'portal': '400',
  'slime rancher 2': '1657630',
  'slime rancher': '433340',
  'raft': '648800',
  'hitman': '1659040',
  'hitman world of assassination': '1659040',
  'geometry dash': '322170',
  'astroneer': '361420',
  'thief simulator': '704850',
  'thief simulator 2': '1332720',
  'green hell': '815370',
  'hello neighbor': '521890',
  'hello neighbor 2': '1321630',
  'house flipper': '613100',
  'house flipper 2': '1190970',
  'the binding of isaac': '113200',
  'the binding of isaac rebirth': '250900',
  'aimlabs': '714010',
  'one armed robber': '2551020',
  'scrap mechanic': '387990',
  'timberman': '398710',
  'wallpaper engine': '431960',
  'baldur s gate 3': '1086940',
  'baldurs gate 3': '1086940',
  'elden ring': '1245620',
  'palworld': '1623730',
  'lethal company': '1966720',
  'helldivers 2': '553850',
  'apex legends': '1172470',
  'counter strike 2': '730',
  'cs2': '730',
  'dota 2': '570',
  'team fortress 2': '440',
  'rust': '252490',
  'dead by daylight': '381210',
  'rainbow six siege': '359550',
  'ark survival evolved': '346110',
  'ark survival ascended': '2399830',
  'stardew valley': '413150',
  'hollow knight': '367520',
  'hollow knight silksong': '1030300',
  'silksong': '1030300',
  'celeste': '504230',
  'sea of thieves': '1172620',
  'forza horizon 5': '1551360',
  'forza horizon 4': '1293830',
  'warframe': '230410',
  'destiny 2': '1085660',
  'war thunder': '236390',
  'the sims 4': '1222670',
  'overwatch 2': '2357570',
  'fall guys': '1097150',
  'rocket league': '252950',
  'payday 2': '218620',
  'payday 3': '1272080',
  'left 4 dead 2': '550',
  'cuphead': '268910',
  'unturned': '304930',
  'among us': '945360',
  'roblox': 'roblox',
  'openttd': '1536610',
  'cataclysm dark days ahead': '2330750',
  'endless sky': '404410',
  'buckshot roulette': '2835570',
  'iron lung': '1846170',
  'otxo': '1608640',
  'chrono trigger': '613830',
  'final fantasy vii': '39140',
  'death stranding': '1190460',
  'control': '870780',
  'alan wake': '108710',
  'bioshock infinite': '8870',
  'bioshock remastered': '409710',
  'bioshock': '7670',
  'tomb raider': '203160',
  'rise of the tomb raider': '391220',
  'shadow of the tomb raider': '750920',
  'borderlands 2': '49520',
  'borderlands 3': '397540',
  'fallout 4': '377160',
  'fallout new vegas': '22380',
  'fallout 3': '22300',
  'skyrim': '489830',
  'the elder scrolls v skyrim': '489830',
  'dishonored': '205100',
  'dishonored 2': '403640',
  'prey': '480490',
  'doom': '379720',
  'doom eternal': '782330',
  'metro 2033': '286690',
  'metro last light': '287390',
  'metro exodus': '412020',
  'ghostrunner': '1139900',
  'ghostrunner 2': '2144740',
  'batman arkham knight': '208650',
  'batman arkham city': '200260',
  'batman arkham asylum': '35140',
  'assassins creed': '15100',
  'far cry 3': '220240',
  'far cry 4': '298110',
  'far cry 5': '552520',
  'far cry 6': '2369390',
  'watch dogs': '243470',
  'watch dogs 2': '447040',
  'frostpunk': '323190',
  'civilization vi': '289070',
  'civilization v': '8930',
  'cities skylines': '255710',
  'cities skylines ii': '949230',
  'remnant from the ashes': '617290',
  'remnant 2': '1282100',
  'star wars jedi fallen order': '1172380',
  'star wars jedi survivor': '1774580',
  'dark souls remastered': '570940',
  'dark souls iii': '374320',
  'sekiro': '814380',
  'monster hunter world': '582010',
  'monster hunter rise': '1446780',
  'god of war': '1593500',
  'marvels spider man remastered': '1817070',
  'marvels spider man miles morales': '1817190',
  'horizon zero dawn': '1151640',
  'days gone': '1259420',
  'ghost of tsushima': '2215430',
  'the last of us': '1888930',
  'uncharted legacy of thieves': '1659420',
  'returnal': '1649240',
  'it takes two': '1426210',
  'a way out': '1222700',
  'deep rock galactic': '548430',
  'valheim': '892970',
  'enshrouded': '1203620',
  'manor lords': '1363080',
  'bodycam': '2406770',
  'content warning': '2881650',
  'phasmophobia': '739630',
  'undertale': '391540',
  'deltarune': '1671210',
  'omori': '1150690',
  'slay the spire': '646570',
  'balatro': '2379720',
  'vampire survivors': '1794680',
  'risk of rain 2': '632360',
  'dead cells': '588650',
  'no mans sky': '275850',
  'stray': '1332010',
  'factorio': '427520',
  'firewatch': '383870',
  'minecraft story mode': '376870',
  'minecraft legacy edition': 'minecraft',
  'minecraft for windows': 'minecraft',
  'osu': 'osu',
};

const NON_STEAM_DIRECT_ART: Record<string, string> = {
  fortnite: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
  minecraft: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1672970/header.jpg',
  osu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Osu%21Logo_%282019%29.svg/800px-Osu%21Logo_%282019%29.svg.png',
  genshin: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  supertuxkart: 'https://supertuxkart.net/images/b/b3/Stk_logo_large.png',
  voices_of_the_void: 'https://img.itch.zone/aW1nLzExMTY4NzY1LnBuZw==/315x250%23c/4TjEAE.png',
};

// Sort mapped titles by length descending so longer phrases match first
const SORTED_MAP_KEYS = Object.keys(GAME_TITLE_MAP).sort((a, b) => b.length - a.length);

const artworkCache = new Map<string, string>();

/**
 * Resolves crisp horizontal box art for games across Steam, Epic, GOG, ROMs, and Indies.
 */
export async function resolveGameArtwork(
  title: string,
  platform?: string,
  gameId?: string,
  apiKey?: string
): Promise<string> {
  const cacheKey = `${gameId || ''}-${title}`;
  if (artworkCache.has(cacheKey)) {
    return artworkCache.get(cacheKey)!;
  }

  // 1. If Steam game with numeric app ID, use official horizontal header
  const steamAppId = extractSteamAppId(gameId || '');
  if (steamAppId) {
    const url = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/header.jpg`;
    artworkCache.set(cacheKey, url);
    return url;
  }

  // 2. Check dictionary of popular titles (exact or substring)
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const key of SORTED_MAP_KEYS) {
    if (
      cleanTitle === key ||
      cleanTitle.startsWith(key + ' ') ||
      cleanTitle.endsWith(' ' + key) ||
      cleanTitle.includes(' ' + key + ' ')
    ) {
      const idOrKey = GAME_TITLE_MAP[key];
      if (/^\d+$/.test(idOrKey)) {
        const url = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${idOrKey}/header.jpg`;
        artworkCache.set(cacheKey, url);
        return url;
      } else if (NON_STEAM_DIRECT_ART[idOrKey]) {
        const url = NON_STEAM_DIRECT_ART[idOrKey];
        artworkCache.set(cacheKey, url);
        return url;
      }
    }
  }

  // 3. If SteamGridDB API key is provided, query it
  if (apiKey) {
    try {
      const res = await fetch(
        `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(title)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const firstId = data?.data?.[0]?.id;
        if (firstId) {
          const gridRes = await fetch(
            `https://www.steamgriddb.com/api/v2/heroes/game/${firstId}`,
            { headers: { Authorization: `Bearer ${apiKey}` } }
          );
          const gridData = await gridRes.json();
          if (gridData?.data?.[0]?.url) {
            artworkCache.set(cacheKey, gridData.data[0].url);
            return gridData.data[0].url;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. Query native Rust backend to search Steam Store without CORS limitations
  if ('__TAURI_INTERNALS__' in window) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const foundUrl = await invoke<string | null>('query_steam_artwork', { title });
      if (foundUrl) {
        artworkCache.set(cacheKey, foundUrl);
        return foundUrl;
      }
    } catch {
      // ignore
    }
  }

  // Return empty string if no valid remote box art found (lets GameCoverImage show custom procedural tile)
  return '';
}

export function extractSteamAppId(idOrUri: string): string | null {
  if (!idOrUri) return null;
  const match = idOrUri.match(/(?:steam-|^steam:\/\/rungameid\/|\/apps\/)(\d+)/i);
  if (match) return match[1];
  if (/^\d{3,8}$/.test(idOrUri)) return idOrUri;
  return null;
}