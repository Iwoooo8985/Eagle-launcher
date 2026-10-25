import { create } from 'zustand';
import liquidGlassCss from '../ui-styles/liquid-glass.css?raw';

/**
 * UI Styles change how the interface LOOKS (layout / shape of the sidebar buttons etc.)
 * without touching any behaviour. They are plain CSS files that target the
 * `data-ui="..."` hooks placed on the sidebar elements.
 *
 * - "classic"      : the original look (no extra CSS)
 * - "liquid-glass" : premade style (src/ui-styles/liquid-glass.css)
 * - "custom"       : a .css / .json file the user loaded from disk
 */

export interface UiStyleDefinition {
  id: string;
  name: string;
  description: string;
  css: string;
}

export const PRESET_UI_STYLES: UiStyleDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original compact sidebar.',
    css: '',
  },
  {
    id: 'liquid-glass',
    name: 'Minimal Dark',
    description:
      'Compact black & charcoal-grey gradient icon buttons with quick-access library game pills.',
    css: liquidGlassCss,
  },
];

const STORAGE_STYLE_KEY = 'eagle_launcher_ui_style_v1';
const STORAGE_CUSTOM_STYLE_KEY = 'eagle_launcher_ui_style_custom_v1';

interface UiStyleState {
  currentStyleId: string;
  customStyle: UiStyleDefinition | null;
  setStyleById: (id: string) => void;
  loadStyleFromFile: (fileContent: string, fileName: string) => { success: boolean; error?: string };
  resetStyle: () => void;
  initStyle: () => void;
}

function applyStyleDom(style: UiStyleDefinition) {
  const root = document.documentElement;
  if (style.id === 'classic') {
    root.removeAttribute('data-ui-style');
  } else {
    root.setAttribute('data-ui-style', style.id);
  }

  let styleEl = document.getElementById('eagle-ui-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'eagle-ui-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = style.css || '';
}

export const useUiStyleStore = create<UiStyleState>((set, get) => ({
  currentStyleId: 'classic',
  customStyle: null,

  initStyle: () => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_CUSTOM_STYLE_KEY);
      let customParsed: UiStyleDefinition | null = null;
      if (savedCustom) {
        customParsed = JSON.parse(savedCustom);
        set({ customStyle: customParsed });
      }

      const savedId = localStorage.getItem(STORAGE_STYLE_KEY) || 'classic';
      if (savedId === 'custom' && customParsed) {
        applyStyleDom(customParsed);
        set({ currentStyleId: 'custom' });
        return;
      }

      const found = PRESET_UI_STYLES.find((s) => s.id === savedId) || PRESET_UI_STYLES[0];
      applyStyleDom(found);
      set({ currentStyleId: found.id });
    } catch {
      applyStyleDom(PRESET_UI_STYLES[0]);
    }
  },

  setStyleById: (id: string) => {
    const target =
      id === 'custom' ? get().customStyle : PRESET_UI_STYLES.find((s) => s.id === id);
    if (!target) return;
    applyStyleDom(target);
    localStorage.setItem(STORAGE_STYLE_KEY, id);
    set({ currentStyleId: id });
  },

  loadStyleFromFile: (fileContent: string, fileName: string) => {
    try {
      const trimmed = fileContent.trim();
      if (!trimmed) return { success: false, error: 'The file is empty' };

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      let newStyle: UiStyleDefinition;

      if (trimmed.startsWith('{')) {
        // JSON format: { "name": "...", "description": "...", "css": "..." }
        const parsed = JSON.parse(trimmed);
        const css = parsed.css ?? parsed.customCss;
        if (typeof css !== 'string') {
          return { success: false, error: 'JSON style files need a "css" text field' };
        }
        newStyle = {
          id: 'custom',
          name: parsed.name || baseName,
          description: parsed.description || `Loaded from ${fileName}`,
          css,
        };
      } else {
        // Plain CSS file
        newStyle = {
          id: 'custom',
          name: baseName || 'Custom UI Style',
          description: `Custom UI style imported from ${fileName}`,
          css: trimmed,
        };
      }

      localStorage.setItem(STORAGE_CUSTOM_STYLE_KEY, JSON.stringify(newStyle));
      localStorage.setItem(STORAGE_STYLE_KEY, 'custom');
      applyStyleDom(newStyle);
      set({ currentStyleId: 'custom', customStyle: newStyle });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid UI style file' };
    }
  },

  resetStyle: () => {
    applyStyleDom(PRESET_UI_STYLES[0]);
    localStorage.setItem(STORAGE_STYLE_KEY, 'classic');
    set({ currentStyleId: 'classic' });
  },
}));
