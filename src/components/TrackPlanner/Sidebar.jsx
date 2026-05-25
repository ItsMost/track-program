import React from 'react';
import {
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  BarChart3,
  Trash2,
  Eye,
  EyeOff,
  Layout,
  FileText
} from 'lucide-react';

export default function Sidebar({
  isPreviewMode,
  setIsPreviewMode,
  onCopyWeek,
  onPasteWeek,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShowStats,
  onClearWeek,
  onPrintLandscape,
  onPrintPortrait
}) {
  return (
    <aside className="hidden md:flex md:flex-col md:relative md:h-full md:w-16 items-center justify-between py-4 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 z-[120] shrink-0 print:hidden">
      {/* Upper Actions Section */}
      <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-3 w-auto">
        {/* Toggle Mode */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`p-2 rounded-xl transition-all duration-200 shadow-sm ${
            isPreviewMode
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
          }`}
          title={isPreviewMode ? 'Exit Preview Mode' : 'Enter Preview Mode'}
        >
          {isPreviewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <div className="hidden md:block w-8 h-[1px] bg-slate-200 dark:bg-slate-800 my-1"></div>

        {/* Analytics Modal Button */}
        <button
          onClick={onShowStats}
          className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-150"
          title="Open Weekly Workload Analytics"
        >
          <BarChart3 className="w-4.5 h-4.5" />
        </button>

        {/* Undo/Redo */}
        <div className="flex flex-row md:flex-col items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-xl transition-colors ${
              canUndo
                ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-xl transition-colors ${
              canRedo
                ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle/Lower Utilities Section */}
      <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-3">
        {/* Copy/Paste Week */}
        <div className="flex flex-row md:flex-col items-center gap-1">
          <button
            onClick={onCopyWeek}
            className="p-2 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Copy Current Week Parameters"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onPasteWeek}
            className="p-2 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Paste Clipboard Week Parameters"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:block w-8 h-[1px] bg-slate-200 dark:bg-slate-800 my-1"></div>

        {/* Dual Print Toggles */}
        <div className="flex flex-row md:flex-col items-center gap-1">
          <button
            onClick={onPrintLandscape}
            className="p-2 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 hidden md:flex"
            title="Print Landscape (7-Column Grid)"
          >
            <Layout className="w-4 h-4 text-emerald-500" />
          </button>
          <button
            onClick={onPrintPortrait}
            className="p-2 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 hidden md:flex"
            title="Print Portrait (Vertical List Stack)"
          >
            <FileText className="w-4 h-4 text-sky-500" />
          </button>
        </div>

        {/* Clear Week */}
        <button
          onClick={onClearWeek}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors hidden md:block"
          title="Clear Entire Week Plan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
