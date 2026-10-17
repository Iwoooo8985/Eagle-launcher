import React, { useState, useRef } from 'react';
import { X, Upload, Palette, Check, RefreshCw, FileText, Download, Sparkles } from 'lucide-react';
import { useThemeStore, PRESET_THEMES } from '../../store/useThemeStore';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { currentThemeId, customTheme, setThemeById, loadThemeFromFile, resetTheme } =
    useThemeStore();
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      colors: {
        bg: '#090a12',
        cardBg: '#121624',
        accent: '#0a84ff',
        accentHover: '#0070e0',
        text: '#f4f4f5',
        textMuted: '#9ca3af',
        border: '#27272a',
      },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#18181b] border border-[#2e2e34] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#27272a] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a84ff]/15 border border-[#0a84ff]/30 flex items-center justify-center text-[#0a84ff]">
              <Palette size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f4f4f5]">Theme Manager</h2>
              <p className="text-[11px] text-[#71717a]">
                Load custom theme files or choose from aesthetic presets
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
          {/* File Upload Zone Asking for Theme File */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 flex items-center gap-1.5">
              <Upload size={12} className="text-[#0a84ff]" />
              Load Theme File (.json or .css)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#0a84ff] bg-[#0a84ff]/10 scale-[1.01]'
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
              <div className="w-10 h-10 rounded-full bg-[#202026] mx-auto flex items-center justify-center text-[#9ca3af] mb-2">
                <Upload size={18} />
              </div>
              <p className="text-xs font-medium text-[#f4f4f5]">
                Click to browse or drag & drop your theme file
              </p>
              <p className="text-[11px] text-[#71717a] mt-1">
                Supports <span className="text-[#0a84ff]">.json</span> palette files and{' '}
                <span className="text-[#0a84ff]">.css</span> custom style sheets
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

          {/* Built-in Theme Presets */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#0a84ff]" />
              Built-in Preset Themes
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
                    {/* Swatches */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: theme.colors.bg }}
                        title="Background"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: theme.colors.cardBg }}
                        title="Card Surface"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: theme.colors.border }}
                        title="Border"
                      />
                    </div>
                  </button>
                );
              })}

              {/* Custom Theme Card (if file was loaded) */}
              {customTheme && (
                <button
                  onClick={() => setThemeById('custom')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    currentThemeId === 'custom'
                      ? 'border-[#0a84ff] bg-[#0a84ff]/10 shadow-sm'
                      : 'border-[#27272a] hover:border-[#383840] bg-[#141416]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#f4f4f5]">
                      {customTheme.name} (Imported)
                    </span>
                    {currentThemeId === 'custom' && (
                      <span className="w-4 h-4 rounded-full bg-[#0a84ff] text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: customTheme.colors.bg }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: customTheme.colors.cardBg }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ backgroundColor: customTheme.colors.accent }}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#27272a] flex items-center justify-between bg-[#141416]">
          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-[#9ca3af] hover:text-[#f4f4f5] flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Download Sample Theme File</span>
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
