import React, { useState, useRef } from 'react';
import { X, Upload, Palette, Check, Download, Sparkles, Sliders } from 'lucide-react';
import { useThemeStore, PRESET_THEMES } from '../../store/useThemeStore';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_ACCENT_COLORS = [
  { name: 'Cobalt Blue', hex: '#0a84ff' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Rose Pink', hex: '#f43f5e' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Electric Indigo', hex: '#6366f1' },
  { name: 'Royal Purple', hex: '#a855f7' },
  { name: 'Silver Grey', hex: '#a1a1aa' },
  { name: 'Lime Neon', hex: '#84cc16' },
];

const EXAMPLE_BG_PALETTES = [
  { name: 'Obsidian', bg: '#0f0f11', sidebar: '#121214', cardBg: '#18181b', border: '#27272a' },
  { name: 'OLED Pitch', bg: '#000000', sidebar: '#050505', cardBg: '#09090b', border: '#18181b' },
  { name: 'Carbon Grey', bg: '#141417', sidebar: '#18181c', cardBg: '#1f1f24', border: '#2e2e36' },
  { name: 'Deep Slate', bg: '#0b0e14', sidebar: '#0f131c', cardBg: '#151b26', border: '#222b3b' },
  { name: 'Graphite', bg: '#18181b', sidebar: '#1c1c20', cardBg: '#242429', border: '#32323a' },
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const {
    currentThemeId,
    activeColors,
    setThemeById,
    setCustomColors,
    loadThemeFromFile,
    resetTheme,
  } = useThemeStore();
  const [dragOver, setDragOver] = useState(false);
  const [wheelTarget, setWheelTarget] = useState<'accent' | 'bg' | 'cardBg'>('accent');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);

  if (!isOpen) return null;

  const pickColorFromWheel = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = rect.width / 2;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius);

    // Angle in degrees matching conic-gradient(from 0deg at top)
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    const saturation = Math.round((dist / radius) * 100);
    const lightness = wheelTarget === 'accent' ? 55 : Math.max(6, Math.round(18 - (dist / radius) * 10));
    const hex = hslToHex(angle, saturation, lightness);

    if (wheelTarget === 'accent') {
      setCustomColors({ accent: hex, accentHover: hex });
    } else if (wheelTarget === 'bg') {
      setCustomColors({ bg: hex, sidebar: hex });
    } else {
      setCustomColors({ cardBg: hex });
    }
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const res = loadThemeFromFile(content, file.name);
      if (res.success) {
        setStatusMessage({ text: `Theme file "${file.name}" loaded successfully!` });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ text: `Failed to load theme: ${res.error}`, isError: true });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const template = {
      name: 'My Custom Theme',
      description: 'Custom theme for Eagle Launcher',
      colors: activeColors,
      customCss: '/* Add your optional custom CSS tweaks here */\n',
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eagle-custom-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseMove={(e) => {
        if (isDraggingWheel) pickColorFromWheel(e.clientX, e.clientY);
      }}
      onMouseUp={() => setIsDraggingWheel(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-[#18181b] border border-[#2e2e34] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#27272a] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a84ff]/15 border border-[#0a84ff]/30 flex items-center justify-center text-[#0a84ff]">
              <Palette size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f4f4f5]">Theme Manager</h2>
              <p className="text-[11px] text-[#71717a]">
                Choose Obsidian Dark, OLED Abyss, or pick your own custom colors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#f4f4f5] p-1 rounded-md hover:bg-[#25252a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Built-in Theme Presets (Obsidian Dark & OLED Abyss only) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#0a84ff]" />
              Preset Themes
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_THEMES.map((theme) => {
                const isActive = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeById(theme.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isActive
                        ? 'border-[#0a84ff] bg-[#0a84ff]/10 shadow-sm'
                        : 'border-[#27272a] hover:border-[#383840] bg-[#141416]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#f4f4f5]">{theme.name}</span>
                      {isActive && (
                        <span className="w-4 h-4 rounded-full bg-[#0a84ff] text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/25 ring-1 ring-black/40"
                        style={{ backgroundColor: theme.colors.bg }}
                        title="Background"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/25 ring-1 ring-black/40"
                        style={{ backgroundColor: theme.colors.cardBg }}
                        title="Card Surface"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/25 ring-1 ring-black/40"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/25 ring-1 ring-black/40"
                        style={{ backgroundColor: theme.colors.border }}
                        title="Border"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Your Own Colors: Color Wheel & Example Colors */}
          <div className="p-4 rounded-xl bg-[#141416] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] flex items-center gap-1.5">
                <Sliders size={12} className="text-[#0a84ff]" />
                Choose Your Own Colors
              </label>
              {currentThemeId === 'custom' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] font-medium">
                  Custom Active
                </span>
              )}
            </div>

            {/* Color Wheel + Direct Color Pickers */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Interactive Circular Color Wheel */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  ref={wheelRef}
                  onMouseDown={(e) => {
                    setIsDraggingWheel(true);
                    pickColorFromWheel(e.clientX, e.clientY);
                  }}
                  title="Click or drag on the color wheel"
                  className="w-28 h-28 rounded-full cursor-crosshair relative border-2 border-white/20 shadow-lg select-none"
                  style={{
                    background:
                      'radial-gradient(circle, #ffffff 0%, transparent 72%), conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      backgroundColor:
                        wheelTarget === 'accent'
                          ? activeColors.accent
                          : wheelTarget === 'bg'
                          ? activeColors.bg
                          : activeColors.cardBg,
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#71717a]">Color Wheel</span>
              </div>

              {/* Target Selectors & Native Color Inputs */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setWheelTarget('accent')}
                    className={`text-xs font-medium flex items-center gap-2 ${
                      wheelTarget === 'accent' ? 'text-white' : 'text-[#9ca3af]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        wheelTarget === 'accent' ? 'bg-[#0a84ff]' : 'bg-transparent'
                      }`}
                    />
                    Accent Color
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#71717a]">
                      {activeColors.accent}
                    </span>
                    <input
                      type="color"
                      value={activeColors.accent}
                      onChange={(e) =>
                        setCustomColors({ accent: e.target.value, accentHover: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setWheelTarget('bg')}
                    className={`text-xs font-medium flex items-center gap-2 ${
                      wheelTarget === 'bg' ? 'text-white' : 'text-[#9ca3af]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        wheelTarget === 'bg' ? 'bg-[#0a84ff]' : 'bg-transparent'
                      }`}
                    />
                    Background Color
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#71717a]">{activeColors.bg}</span>
                    <input
                      type="color"
                      value={activeColors.bg}
                      onChange={(e) =>
                        setCustomColors({ bg: e.target.value, sidebar: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setWheelTarget('cardBg')}
                    className={`text-xs font-medium flex items-center gap-2 ${
                      wheelTarget === 'cardBg' ? 'text-white' : 'text-[#9ca3af]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        wheelTarget === 'cardBg' ? 'bg-[#0a84ff]' : 'bg-transparent'
                      }`}
                    />
                    Card / Surface Color
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#71717a]">
                      {activeColors.cardBg}
                    </span>
                    <input
                      type="color"
                      value={activeColors.cardBg}
                      onChange={(e) => setCustomColors({ cardBg: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Example Accent Colors */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#71717a] mb-2">
                Example Accent Colors
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {EXAMPLE_ACCENT_COLORS.map((c) => {
                  const selected = activeColors.accent.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setCustomColors({ accent: c.hex, accentHover: c.hex })}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        selected
                          ? 'scale-110 border-white ring-2 ring-white/40'
                          : 'border-white/15 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Example Background Tones */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#71717a] mb-2">
                Example Background Tones
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {EXAMPLE_BG_PALETTES.map((p) => {
                  const selected = activeColors.bg.toLowerCase() === p.bg.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setCustomColors({
                          bg: p.bg,
                          sidebar: p.sidebar,
                          cardBg: p.cardBg,
                          border: p.border,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all ${
                        selected
                          ? 'border-white/60 text-white bg-[#222226]'
                          : 'border-[#27272a] text-[#9ca3af] hover:text-white hover:border-[#383840]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: p.bg }}
                      />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. File Upload Zone */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 flex items-center gap-1.5">
              <Upload size={12} className="text-[#0a84ff]" />
              Or Load Theme File (.json or .css)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#0a84ff] bg-[#0a84ff]/10'
                  : 'border-[#2e2e36] hover:border-[#3f3f4a] bg-[#141416]/60 hover:bg-[#141416]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.css,.theme,application/json,text/css"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <p className="text-xs font-medium text-[#f4f4f5]">
                Click to browse or drag &amp; drop a theme file (.json / .css)
              </p>
            </div>

            {statusMessage && (
              <div
                className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  statusMessage.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}
              >
                {statusMessage.isError ? <X size={14} /> : <Check size={14} />}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#27272a] flex items-center justify-between bg-[#141416]">
          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-[#9ca3af] hover:text-[#f4f4f5] flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Export Current Theme (.json)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTheme}
              className="px-3 py-1.5 rounded-lg border border-[#2e2e34] hover:bg-[#202024] text-xs text-[#9ca3af] hover:text-[#f4f4f5] transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] text-xs font-medium text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
