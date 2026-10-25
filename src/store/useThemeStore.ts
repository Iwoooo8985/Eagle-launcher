import { create } from 'zustand';

export interface ThemeColors {
  bg: string;
  sidebar?: string;
  cardBg: string;
  accent: string;
  accentHover: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  customCss?: string;
}

export const PRESET_THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Obsidian Dark (Default)',
    description: 'Minimalist high-contrast obsidian dark palette with cobalt blue accents.',
    colors: {
      bg: '#0f0f11',
      sidebar: '#121214',
      cardBg: '#18181b',
      accent: '#0a84ff',
      accentHover: '#0070e0',
      text: '#f4f4f5',
      textMuted: '#9ca3af',
      border: '#27272a',
    },
  },
  {
    id: 'oled',
    name: 'OLED Abyss',
    description: 'Pure #000000 pitch-black canvas with high-contrast borders and zero emission.',
    colors: {
      bg: '#000000',
      sidebar: '#050505',
      cardBg: '#09090b',
      accent: '#ffffff',
      accentHover: '#e4e4e7',
      text: '#ffffff',
      textMuted: '#71717a',
      border: '#18181b',
    },
  },
];

const STORAGE_THEME_KEY = 'eagle_launcher_active_theme_v2';
const STORAGE_CUSTOM_THEME_KEY = 'eagle_launcher_uploaded_theme_v2';

interface ThemeState {
  currentThemeId: string;
  customTheme: ThemeDefinition | null;
  activeColors: ThemeColors;
  setThemeById: (id: string) => void;
  setCustomColors: (updates: Partial<ThemeColors>) => void;
  loadThemeFromFile: (fileContent: string, fileName: string) => { success: boolean; error?: string };
  resetTheme: () => void;
  initTheme: () => void;
}

function getHexLuminance(hex: string): number {
  const clean = (hex || '').replace('#', '').trim();
  if (clean.length !== 6) return 0;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function applyThemeDom(theme: ThemeDefinition) {
  const root = document.documentElement;
  const accentLum = getHexLuminance(theme.colors.accent);
  const bgLum = Math.max(getHexLuminance(theme.colors.bg), getHexLuminance(theme.colors.cardBg));

  const accentFg = accentLum > 0.42 ? '#09090b' : '#ffffff';
  const textMain = bgLum > 0.5 ? '#0f0f11' : theme.colors.text;
  const textMuted = bgLum > 0.5 ? '#4b5563' : theme.colors.textMuted;

  root.style.setProperty('--app-bg', theme.colors.bg);
  root.style.setProperty('--app-sidebar', theme.colors.sidebar || theme.colors.bg);
  root.style.setProperty('--app-card', theme.colors.cardBg);
  root.style.setProperty('--app-card-alt', theme.colors.cardBg);
  root.style.setProperty('--app-card-hover', theme.colors.cardBg);
  root.style.setProperty('--app-border', theme.colors.border);
  root.style.setProperty('--app-accent', theme.colors.accent);
  root.style.setProperty('--app-accent-hover', theme.colors.accentHover);
  root.style.setProperty('--app-accent-fg', accentFg);
  root.style.setProperty('--app-text', textMain);
  root.style.setProperty('--app-text-muted', textMuted);

  let styleEl = document.getElementById('eagle-theme-custom-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'eagle-theme-custom-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = theme.customCss || '';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentThemeId: 'default',
  customTheme: null,
  activeColors: PRESET_THEMES[0].colors,

  initTheme: () => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_THEME_KEY);
      let customParsed: ThemeDefinition | null = null;
      if (savedCustom) {
        customParsed = JSON.parse(savedCustom);
        set({ customTheme: customParsed });
      }

      const savedId = localStorage.getItem(STORAGE_THEME_KEY) || 'default';
      if (savedId === 'custom' && customParsed) {
        applyThemeDom(customParsed);
        set({ currentThemeId: 'custom', activeColors: customParsed.colors });
        return;
      }

      const found = PRESET_THEMES.find((t) => t.id === savedId) || PRESET_THEMES[0];
      applyThemeDom(found);
      set({ currentThemeId: found.id, activeColors: found.colors });
    } catch {
      applyThemeDom(PRESET_THEMES[0]);
    }
  },

  setThemeById: (id: string) => {
    let target: ThemeDefinition | undefined;
    if (id === 'custom' && get().customTheme) {
      target = get().customTheme!;
    } else {
      target = PRESET_THEMES.find((t) => t.id === id);
    }

    if (target) {
      applyThemeDom(target);
      localStorage.setItem(STORAGE_THEME_KEY, id);
      set({ currentThemeId: id, activeColors: target.colors });
    }
  },

  setCustomColors: (updates: Partial<ThemeColors>) => {
    const current = get().activeColors;
    const mergedColors: ThemeColors = {
      ...current,
      ...updates,
      sidebar: updates.sidebar ?? (updates.bg ? updates.bg : current.sidebar || current.bg),
      accentHover: updates.accentHover ?? (updates.accent ? updates.accent : current.accentHover),
    };

    const customThemeObj: ThemeDefinition = {
      id: 'custom',
      name: 'Custom Colors',
      description: 'User-selected custom theme palette',
      colors: mergedColors,
      customCss: get().customTheme?.customCss || '',
    };

    localStorage.setItem(STORAGE_CUSTOM_THEME_KEY, JSON.stringify(customThemeObj));
    localStorage.setItem(STORAGE_THEME_KEY, 'custom');
    applyThemeDom(customThemeObj);

    set({
      currentThemeId: 'custom',
      customTheme: customThemeObj,
      activeColors: mergedColors,
    });
  },

  loadThemeFromFile: (fileContent: string, fileName: string) => {
    try {
      const trimmed = fileContent.trim();
      let newTheme: ThemeDefinition;

      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        newTheme = {
          id: 'custom',
          name: parsed.name || fileName.replace(/\.[^/.]+$/, ''),
          description: parsed.description || `Loaded from ${fileName}`,
          colors: {
            bg: parsed.colors?.bg || parsed.bg || '#0f0f11',
            cardBg: parsed.colors?.cardBg || parsed.cardBg || '#18181b',
            accent: parsed.colors?.accent || parsed.accent || '#0a84ff',
            accentHover: parsed.colors?.accentHover || parsed.accentHover || '#0070e0',
            text: parsed.colors?.text || parsed.text || '#f4f4f5',
            textMuted: parsed.colors?.textMuted || parsed.textMuted || '#9ca3af',
            border: parsed.colors?.border || parsed.border || '#27272a',
          },
          customCss: parsed.customCss || parsed.css || '',
        };
      } else {
        newTheme = {
          id: 'custom',
          name: fileName.replace(/\.[^/.]+$/, '') || 'Custom CSS Theme',
          description: `Custom CSS stylesheet imported from ${fileName}`,
          colors: {
            bg: '#0c0d12',
            cardBg: '#151722',
            accent: '#0a84ff',
            accentHover: '#0070e0',
            text: '#f4f4f5',
            textMuted: '#9ca3af',
            border: '#242838',
          },
          customCss: trimmed,
        };
      }

      localStorage.setItem(STORAGE_CUSTOM_THEME_KEY, JSON.stringify(newTheme));
      localStorage.setItem(STORAGE_THEME_KEY, 'custom');
      applyThemeDom(newTheme);

      set({
        currentThemeId: 'custom',
        customTheme: newTheme,
        activeColors: newTheme.colors,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid theme file format' };
    }
  },

  resetTheme: () => {
    const defaultTheme = PRESET_THEMES[0];
    applyThemeDom(defaultTheme);
    localStorage.setItem(STORAGE_THEME_KEY, 'default');
    set({ currentThemeId: 'default', activeColors: defaultTheme.colors });
  },
}));
