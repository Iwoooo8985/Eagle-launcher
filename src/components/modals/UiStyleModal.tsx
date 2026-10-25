import React, { useState, useRef } from 'react';
import { X, Upload, LayoutTemplate, Check, FileText, Download, Sparkles } from 'lucide-react';
import { useUiStyleStore, PRESET_UI_STYLES } from '../../store/useUiStyleStore';

interface UiStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_STYLE_CSS = `/*
 * My Eagle Launcher UI Style
 * Load this file from the top bar: UI > Load UI Style File.
 *
 * It only changes how things LOOK. All features keep working the same.
 * Use "html[data-ui-style]" in front of your selectors so they win over the defaults.
 *
 * Hooks:
 *   [data-ui="sidebar"]           the whole left panel
 *   [data-ui="sidebar-top"]       scrollable upper part of the panel
 *   [data-ui="sidebar-header"]    logo + back/forward/search row
 *   [data-ui="sidebar-icon-btn"]  small icon buttons in the header
 *   [data-ui="sidebar-add"]       "Add Game / ROM" button
 *   [data-ui="nav-item"]          Library / Pulse / Deals (data-active="true" when selected)
 *   [data-ui="platform-folder"]   "Eagle launcher" folder row
 *   [data-ui="platform-item"]     platform rows (data-active="true" when selected)
 *   [data-ui="sidebar-settings"]  Settings button
 *
 * Colours: var(--app-accent), var(--app-text), var(--app-sidebar), var(--app-border)
 */

html[data-ui-style] [data-ui="sidebar"] {
  width: 16rem !important;
}

html[data-ui-style] [data-ui="nav-item"] {
  min-height: 2.75rem;
  border-radius: 0.75rem !important;
  font-size: 0.875rem !important;
}

html[data-ui-style] [data-ui="nav-item"]:hover {
  color: #ffffff !important;
}

html[data-ui-style] [data-ui][data-active="true"] {
  background: var(--app-accent) !important;
  color: #ffffff !important;
}
`;

export function UiStyleModal({ isOpen, onClose }: UiStyleModalProps) {
  const { currentStyleId, customStyle, setStyleById, loadStyleFromFile, resetStyle } =
    useUiStyleStore();
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

      const res = loadStyleFromFile(content, file.name);
      if (res.success) {
        setStatusMessage({ text: `UI style "${file.name}" loaded successfully!` });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ text: `Failed to load UI style: ${res.error}`, isError: true });
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
    const blob = new Blob([SAMPLE_STYLE_CSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eagle-ui-style.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardClass = (active: boolean) =>
    `p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
      active
        ? 'border-[#0a84ff] bg-[#0a84ff]/10 shadow-sm'
        : 'border-[#27272a] hover:border-[#383840] bg-[#141416]'
    }`;

  return (
    <div
      onDoubleClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-[#18181b] border border-[#2e2e34] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#27272a] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a84ff]/15 border border-[#0a84ff]/30 flex items-center justify-center text-[#0a84ff]">
              <LayoutTemplate size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f4f4f5]">UI Style</h2>
              <p className="text-[11px] text-[#71717a]">
                Change how the interface looks. Features stay exactly the same.
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
          {/* Premade styles */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#0a84ff]" />
              Premade Styles
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_UI_STYLES.map((style) => {
                const isActive = currentStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setStyleById(style.id)}
                    className={cardClass(isActive)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#f4f4f5]">{style.name}</span>
                      {isActive && (
                        <span className="w-4 h-4 rounded-full bg-[#0a84ff] text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-snug text-[#71717a]">{style.description}</p>
                  </button>
                );
              })}

              {customStyle && (
                <button onClick={() => setStyleById('custom')} className={cardClass(currentStyleId === 'custom')}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#f4f4f5]">
                      {customStyle.name} (Imported)
                    </span>
                    {currentStyleId === 'custom' && (
                      <span className="w-4 h-4 rounded-full bg-[#0a84ff] text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-snug text-[#71717a]">{customStyle.description}</p>
                </button>
              )}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2 flex items-center gap-1.5">
              <Upload size={12} className="text-[#0a84ff]" />
              Load UI Style File (.css or .json)
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
                accept=".css,.json,text/css,application/json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-[#202026] mx-auto flex items-center justify-center text-[#9ca3af] mb-2">
                <FileText size={18} />
              </div>
              <p className="text-xs font-medium text-[#f4f4f5]">
                Click to browse or drag &amp; drop your own UI style file
              </p>
              <p className="text-[11px] text-[#71717a] mt-1">
                Download the sample below to see every part you can restyle
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
            <span>Download Sample UI Style File</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={resetStyle}
              className="px-3 py-1.5 rounded-lg border border-[#2e2e34] hover:bg-[#202024] text-xs text-[#9ca3af] hover:text-[#f4f4f5] transition-colors"
            >
              Reset to Classic
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
