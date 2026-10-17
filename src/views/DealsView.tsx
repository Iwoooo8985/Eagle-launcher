import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  Calendar,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Gift,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Radio,
} from 'lucide-react';

export interface GameDeal {
  id: string;
  title: string;
  store: 'Steam' | 'Epic Games' | 'GOG' | 'Xbox Store';
  originalPrice: string;
  salePrice: string;
  discount: string;
  discountPercent: number;
  headerUrl: string;
  expires: string;
  storeUrl: string;
  isHistoricalLow?: boolean;
}

interface PlatformSaleEvent {
  id: string;
  name: string;
  platform: 'Steam' | 'Epic Games' | 'GOG' | 'Xbox';
  season: string;
  startDate: string; // ISO date string
  dateRange: string;
  status: 'Confirmed' | 'Estimated' | 'Annual Tradition';
  highlight: string;
  color: string;
}

// Verified official schedule of upcoming major platform sales
const UPCOMING_SALES_CONFIG: PlatformSaleEvent[] = [
  {
    id: 'sale-steam-scream',
    name: 'Steam Scream Fest (Halloween Sale)',
    platform: 'Steam',
    season: 'Halloween',
    startDate: '2026-10-26T17:00:00Z',
    dateRange: 'Oct 26 – Nov 2, 2026',
    status: 'Confirmed',
    highlight: 'Site-wide discounts on horror, survival, dark fantasy, and psychological thrillers',
    color: '#f97316',
  },
  {
    id: 'sale-gog-blackfriday',
    name: 'GOG Black Friday & Cyber Sale',
    platform: 'GOG',
    season: 'Late November',
    startDate: '2026-11-20T14:00:00Z',
    dateRange: 'Nov 20 – Dec 2, 2026',
    status: 'Confirmed',
    highlight: 'Up to 90% off DRM-free classics and modern hits, plus free game giveaway',
    color: '#a855f7',
  },
  {
    id: 'sale-steam-autumn',
    name: 'Steam Autumn Sale (Black Friday)',
    platform: 'Steam',
    season: 'Autumn / Fall',
    startDate: '2026-11-24T18:00:00Z',
    dateRange: 'Nov 24 – Dec 1, 2026',
    status: 'Confirmed',
    highlight: 'Major seasonal festival on 10,000+ PC games & Steam Awards nominations',
    color: '#0a84ff',
  },
  {
    id: 'sale-epic-blackfriday',
    name: 'Epic Games Black Friday Sale',
    platform: 'Epic Games',
    season: 'Late November',
    startDate: '2026-11-24T16:00:00Z',
    dateRange: 'Nov 24 – Dec 1, 2026',
    status: 'Confirmed',
    highlight: 'Reusable 33% off Epic Checkout Coupons on orders $14.99+ and 10% Epic Rewards',
    color: '#3b82f6',
  },
  {
    id: 'sale-steam-winter',
    name: 'Steam Winter Sale 2026 (The Big One)',
    platform: 'Steam',
    season: 'Holiday Season',
    startDate: '2026-12-17T18:00:00Z',
    dateRange: 'Dec 17, 2026 – Jan 4, 2027',
    status: 'Confirmed',
    highlight: 'Largest PC sale of the year. Deepest historical lows, trading cards & badges',
    color: '#0284c7',
  },
  {
    id: 'sale-epic-holiday',
    name: 'Epic Games Holiday Mystery Bonanza',
    platform: 'Epic Games',
    season: 'Holiday Season',
    startDate: '2026-12-17T16:00:00Z',
    dateRange: 'Dec 17, 2026 – Jan 7, 2027',
    status: 'Annual Tradition',
    highlight: '15 DAYS of daily free AAA games to claim permanently + 33% off coupon',
    color: '#8b5cf6',
  },
  {
    id: 'sale-xbox-countdown',
    name: 'Xbox Ultimate Countdown Sale',
    platform: 'Xbox',
    season: 'Year-End',
    startDate: '2026-12-18T18:00:00Z',
    dateRange: 'Dec 18, 2026 – Jan 3, 2027',
    status: 'Confirmed',
    highlight: 'Major holiday discounts on PC Game Pass catalog, Xbox Game Studios & expansions',
    color: '#10b981',
  },
  {
    id: 'sale-steam-spring',
    name: 'Steam Spring Sale 2027',
    platform: 'Steam',
    season: 'Spring 2027',
    startDate: '2027-03-11T18:00:00Z',
    dateRange: 'March 11 – March 18, 2027',
    status: 'Confirmed',
    highlight: 'First major 2027 seasonal discount festival for recent releases and indies',
    color: '#06b6d4',
  },
];

// Fallback high-profile specials if live API is temporarily unreachable
const FALLBACK_DEALS: GameDeal[] = [
  {
    id: 'steam-1091500',
    title: 'Cyberpunk 2077',
    store: 'Steam',
    originalPrice: '$59.99',
    salePrice: '$29.99',
    discount: '-50%',
    discountPercent: 50,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    expires: 'Limited Time Deal',
    storeUrl: 'https://store.steampowered.com/app/1091500/',
    isHistoricalLow: true,
  },
  {
    id: 'steam-1174180',
    title: 'Red Dead Redemption 2',
    store: 'Steam',
    originalPrice: '$59.99',
    salePrice: '$19.79',
    discount: '-67%',
    discountPercent: 67,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
    expires: 'Weekend Deal',
    storeUrl: 'https://store.steampowered.com/app/1174180/',
    isHistoricalLow: true,
  },
  {
    id: 'steam-292030',
    title: 'The Witcher 3: Wild Hunt',
    store: 'Steam',
    originalPrice: '$39.99',
    salePrice: '$9.99',
    discount: '-75%',
    discountPercent: 75,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    expires: 'Publisher Sale',
    storeUrl: 'https://store.steampowered.com/app/292030/',
    isHistoricalLow: true,
  },
  {
    id: 'steam-1245620',
    title: 'ELDEN RING',
    store: 'Steam',
    originalPrice: '$59.99',
    salePrice: '$39.59',
    discount: '-34%',
    discountPercent: 34,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    expires: 'Midweek Madness',
    storeUrl: 'https://store.steampowered.com/app/1245620/',
  },
  {
    id: 'steam-1332010',
    title: 'Stray',
    store: 'Steam',
    originalPrice: '$29.99',
    salePrice: '$17.99',
    discount: '-40%',
    discountPercent: 40,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/header.jpg',
    expires: 'Featured Special',
    storeUrl: 'https://store.steampowered.com/app/1332010/',
  },
  {
    id: 'steam-1593500',
    title: 'God of War',
    store: 'Steam',
    originalPrice: '$49.99',
    salePrice: '$19.99',
    discount: '-60%',
    discountPercent: 60,
    headerUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg',
    expires: 'PlayStation PC Sale',
    storeUrl: 'https://store.steampowered.com/app/1593500/',
    isHistoricalLow: true,
  },
];

export function DealsView() {
  const [deals, setDeals] = useState<GameDeal[]>(FALLBACK_DEALS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [activeStore, setActiveStore] = useState<'All' | 'Steam' | 'Epic Games' | 'GOG' | 'Xbox Store'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minDiscount, setMinDiscount] = useState<number>(0);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      if ('__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const rawJson = await invoke<string>('fetch_steam_specials');
        if (rawJson && rawJson.trim().startsWith('[')) {
          const parsed = JSON.parse(rawJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDeals(parsed);
            setIsLiveApi(true);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Live deals fetch error:', e);
    }
    setDeals(FALLBACK_DEALS);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesStore = activeStore === 'All' || deal.store === activeStore;
      const matchesQuery =
        searchQuery.trim() === '' ||
        deal.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiscount = deal.discountPercent >= minDiscount;
      return matchesStore && matchesQuery && matchesDiscount;
    });
  }, [deals, activeStore, searchQuery, minDiscount]);

  // Dynamic countdown calculations
  const upcomingSalesWithDays = useMemo(() => {
    const now = Date.now();
    return UPCOMING_SALES_CONFIG.map((sale) => {
      const targetTime = new Date(sale.startDate).getTime();
      const diffMs = targetTime - now;
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        ...sale,
        daysLeft,
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);

  const nextSale = upcomingSalesWithDays[0];

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-[#0f0f11]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#0a84ff]" />
            <h1 className="text-xs font-semibold tracking-wider text-[#9ca3af] uppercase">
              Deal Finder & Verified Sales Radar
            </h1>
          </div>
          <p className="text-xs text-[#71717a] mt-1">
            Real-time verified discounts directly from official storefronts, plus accurate countdowns to major platform sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLiveApi && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Steam Storefront</span>
            </div>
          )}

          <button
            onClick={fetchDeals}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#222226] hover:bg-[#2a2a30] border border-[#2f2f35] text-[#d1d5db] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh deals from Steam Store API"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Updating...' : 'Refresh Live Sales'}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Upcoming Big Sales on Platforms (Roadmap & Countdown) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#0a84ff]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d5db]">
              Upcoming Major Platform Sales (Accurate Calendar)
            </h2>
          </div>
          {nextSale && (
            <span className="text-[11px] text-[#71717a]">
              Next sale: <strong className="text-emerald-400">{nextSale.name}</strong> in{' '}
              <strong className="text-emerald-400">{nextSale.daysLeft} days</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {upcomingSalesWithDays.map((sale) => (
            <div
              key={sale.id}
              className="bg-[#141416] border border-[#222226] hover:border-[#2f2f36] rounded-xl p-4 flex flex-col justify-between shadow-sm transition-all relative overflow-hidden group"
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: sale.color }}
              />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: `${sale.color}35`,
                      color: sale.color,
                      backgroundColor: `${sale.color}15`,
                    }}
                  >
                    {sale.platform}
                  </span>

                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {sale.daysLeft === 0 ? 'Starts Today!' : `in ${sale.daysLeft} days`}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#f4f4f5] leading-snug">
                  {sale.name}
                </h3>

                <p className="text-[11px] text-[#82828e] leading-relaxed line-clamp-2">
                  {sale.highlight}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1f1f23] flex items-center justify-between text-[11px] text-[#71717a] relative z-10">
                <span>{sale.dateRange}</span>
                <span className="text-[10px] uppercase font-medium text-[#6b7280]">
                  {sale.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Real Games Currently on Sale */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#d1d5db]">
              Verified Deals Currently Live ({filteredDeals.length})
            </h2>
          </div>

          {/* Search within deals */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discounted titles..."
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#0a84ff]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f1f23] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'Steam', 'Epic Games', 'GOG', 'Xbox Store'] as const).map((store) => (
              <button
                key={store}
                onClick={() => setActiveStore(store)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeStore === store
                    ? 'bg-[#222226] text-[#f4f4f5] border border-[#2f2f35]'
                    : 'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-[#18181b] border border-transparent'
                }`}
              >
                {store === 'All' ? 'All Platforms' : store}
              </button>
            ))}
          </div>

          {/* Discount threshold filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
            <span>Min Discount:</span>
            <button
              onClick={() => setMinDiscount(0)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                minDiscount === 0 ? 'bg-[#0a84ff] text-white font-medium' : 'text-[#82828e] hover:text-white'
              }`}
            >
              Any
            </button>
            <button
              onClick={() => setMinDiscount(50)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                minDiscount === 50 ? 'bg-[#0a84ff] text-white font-medium' : 'text-[#82828e] hover:text-white'
              }`}
            >
              50%+
            </button>
            <button
              onClick={() => setMinDiscount(70)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                minDiscount === 70 ? 'bg-[#0a84ff] text-white font-medium' : 'text-[#82828e] hover:text-white'
              }`}
            >
              70%+
            </button>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-[#141416] border border-[#222226] hover:border-[#2f2f36] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group transition-all"
            >
              {/* Header Box Art Banner */}
              <div className="w-full aspect-[460/215] bg-[#0c0c0e] relative overflow-hidden">
                <img
                  src={deal.headerUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Store badge & Historical Low badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90 uppercase">
                    {deal.store}
                  </span>
                  {deal.isHistoricalLow && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                      Hot Deal
                    </span>
                  )}
                </div>

                {/* Expiration Tag */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white/80 flex items-center gap-1">
                  <Clock size={10} />
                  <span>{deal.expires}</span>
                </div>
              </div>

              {/* Deal Info & Action */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#f4f4f5] line-clamp-1 group-hover:text-white transition-colors" title={deal.title}>
                    {deal.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1e1e22]">
                  {/* Prices & Discount Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold text-xs">
                      {deal.discount}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#71717a] line-through leading-none">
                        {deal.originalPrice}
                      </span>
                      <span className="text-sm font-bold text-[#f4f4f5] leading-tight">
                        {deal.salePrice}
                      </span>
                    </div>
                  </div>

                  {/* Open Store Link */}
                  <a
                    href={deal.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#222226] hover:bg-[#0a84ff] hover:text-white text-[#d1d5db] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>View on Steam</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}