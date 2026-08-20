import React, { useState } from 'react';
import { SHORTCUTS_DATA } from '../data/kbData';
import { ShortcutItem } from '../types';
import { Search, Copy, Check, Download, Command, Laptop, Monitor } from 'lucide-react';

export const ShortcutHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const apps = [
    { id: 'all', label: 'All Software' },
    { id: 'powerpoint', label: '📊 MS PowerPoint' },
    { id: 'photoshop', label: '🎨 Adobe Photoshop' },
    { id: 'windows', label: '🪟 Windows OS & SysAdmin' },
    { id: 'vscode', label: '💻 VS Code & Terminals' },
    { id: 'premiere', label: '🎬 Adobe Premiere Pro' },
    { id: 'linux', label: '🐧 Linux Diagnostics' }
  ];

  const filteredShortcuts = SHORTCUTS_DATA.filter(item => {
    const matchesApp = selectedApp === 'all' || item.app === selectedApp;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.action.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keys.join(' ').toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesApp && matchesSearch;
  });

  const handleCopy = (keys: string[], id: string) => {
    navigator.clipboard.writeText(keys.join(' + '));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportMarkdown = () => {
    let md = `# Workbench Software & Keyboard Shortcuts Cheat Sheet\n\n`;
    const grouped: Record<string, ShortcutItem[]> = {};

    SHORTCUTS_DATA.forEach(s => {
      if (!grouped[s.app]) grouped[s.app] = [];
      grouped[s.app].push(s);
    });

    for (const [app, items] of Object.entries(grouped)) {
      md += `## ${app.toUpperCase()}\n\n`;
      md += `| Action | Shortcut Key | Description |\n`;
      md += `| :--- | :--- | :--- |\n`;
      items.forEach(i => {
        md += `| **${i.action}** | \`${i.keys.join(' + ')}\` | ${i.desc} |\n`;
      });
      md += `\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Workbench_Shortcuts_Cheatsheet_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Software &amp; Keyboard Shortcut Suite
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400">
                Diagnostic &amp; Productivity Hotkeys
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Instant lookup for critical technician key sequences (GPU driver restart Win+Ctrl+Shift+B, DMM Task Manager, Safe Mode bypasses) and design tools.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Cheatsheet (.md)
            </button>
          </div>
        </div>

        {/* Search & App Filter Tabs */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts, keys (e.g. F5, Ctrl+P), or actions..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  selectedApp === app.id
                    ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300 font-bold'
                    : 'bg-[#181d29] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {app.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShortcuts.map((sc) => {
          const isCopied = copiedId === sc.id;
          return (
            <div
              key={sc.id}
              className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 hover:border-sky-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] leading-snug">
                    {sc.action}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white/5 shrink-0">
                    {sc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 flex-wrap">
                  {sc.keys.map((k, idx) => (
                    <React.Fragment key={idx}>
                      <kbd className="font-mono text-xs text-white">{k}</kbd>
                      {idx < sc.keys.length - 1 && <span className="text-slate-600 text-xs">+</span>}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => handleCopy(sc.keys, sc.id)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="Copy key combination"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
