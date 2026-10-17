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
  {
    id: 'liquid-glass',
    name: 'Liquid Glass (Aero Frost)',
    description: 'Translucent frosted acrylic with deep specular refraction and cyan highlights.',
    colors: {
      bg: '#070b14',
      sidebar: '#0c1220',
      cardBg: '#11192e',
      accent: '#38bdf8',
      accentHover: '#0284c7',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#1e293b',
    },
    customCss: `
      .aspect-video, .group {
        backdrop-filter: blur(12px);
      }
    `,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Vibrant Night City aesthetic with electric magenta accents and deep violet surfaces.',
    colors: {
      bg: '#0a0817',
      sidebar: '#0f0b24',
      cardBg: '#171133',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      text: '#fff1f2',
      textMuted: '#fda4af',
      border: '#351f54',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Tactical deep forest green with cybernetic emerald neon glow.',
    colors: {
      bg: '#06100a',
      sidebar: '#0a170f',
      cardBg: '#0f2418',
      accent: '#10b981',
      accentHover: '#059669',
      text: '#ecfdf5',
      textMuted: '#6ee7b7',
      border: '#1a3e29',
    },
  },
  {
    id: 'amethyst',
    name: 'Midnight Amethyst',
    description: 'Nebula violet gradients with radiant purple luminescence.',
    colors: {
      bg: '#0c0717',
      sidebar: '#130c24',
      cardBg: '#1c1236',
      accent: '#a855f7',
      accentHover: '#9333ea',
      text: '#faf5ff',
      textMuted: '#c084fc',
      border: '#2e1d52',
    },
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    description: 'Cool polar arctic slate inspired by Arctic ice and aurora borealis.',
    colors: {
      bg: '#12161f',
      sidebar: '#181e2b',
      cardBg: '#1f2737',
      accent: '#88c0d0',
      accentHover: '#81a1c1',
      text: '#eceff4',
      textMuted: '#d8dee9',
      border: '#2e384d',
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
  loadThemeFromFile: (fileContent: string, fileName: string) => { success: boolean; error?: string };
  resetTheme: () => void;
  initTheme: () => void;
}

function applyThemeDom(theme: ThemeDefinition) {
  const root = document.documentElement;
  root.style.setProperty('--app-bg', theme.colors.bg);
  root.style.setProperty('--app-sidebar', theme.colors.sidebar || theme.colors.bg);
  root.style.setProperty('--app-card', theme.colors.cardBg);
  root.style.setProperty('--app-card-alt', theme.colors.cardBg);
  root.style.setProperty('--app-card-hover', theme.colors.cardBg);
  root.style.setProperty('--app-border', theme.colors.border);
  root.style.setProperty('--app-accent', theme.colors.accent);
  root.style.setProperty('--app-accent-hover', theme.colors.accentHover);
  root.style.setProperty('--app-text', theme.colors.text);
  root.style.setProperty('--app-text-muted', theme.colors.textMuted);

  // Apply or update custom CSS tag if present
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

  loadThemeFromFile: (fileContent: string, fileName: string) => {
    try {
      const trimmed = fileContent.trim();
      let newTheme: ThemeDefinition;

      if (trimmed.startsWith('{')) {
        // Parse JSON format theme
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
        // Plain CSS stylesheet
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
