import React, { useState } from 'react';
import { WINDOWS_ERROR_CODES } from '../data/errorCodes';
import { WindowsErrorCode } from '../types';
import { Search, Copy, Check, Terminal, AlertTriangle, ShieldAlert, Cpu, HardDrive, Network, RefreshCw } from 'lucide-react';

interface ErrorMatrixProps {
  onAddToScript?: (command: string) => void;
}

export const ErrorMatrix: React.FC<ErrorMatrixProps> = ({ onAddToScript }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeError, setActiveError] = useState<WindowsErrorCode | null>(null);

  const categories = [
    'All',
    'Windows Update',
    'BSOD & Kernel',
    'Component Store / DISM',
    'Filesystem & Storage',
    'Security & Permissions'
  ];

  const filteredErrors = WINDOWS_ERROR_CODES.filter((err) => {
    const matchesCat = selectedCategory === 'All' || err.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      err.hex.toLowerCase().includes(q) ||
      err.name.toLowerCase().includes(q) ||
      err.description.toLowerCase().includes(q) ||
      err.symptoms.some(s => s.toLowerCase().includes(q)) ||
      err.causes.some(c => c.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getSeverityBadge = (severity: WindowsErrorCode['severity']) => {
    switch (severity) {
      case 'Critical':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30"><ShieldAlert className="w-3 h-3" /> Critical</span>;
      case 'High':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> High</span>;
      case 'Medium':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">Medium</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">Low</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Windows Update': return <RefreshCw className="w-4 h-4 text-sky-400" />;
      case 'BSOD & Kernel': return <Cpu className="w-4 h-4 text-rose-400" />;
      case 'Component Store / DISM': return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'Filesystem & Storage': return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'Security & Permissions': return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      default: return <Network className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">Windows Error Code &amp; BSOD Matrix</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                Phase 1 Core Diagnostic
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Instant hex code decoder, kernel bugcheck diagnostics, root cause analysis, and one-click repair commands.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Showing <strong className="text-amber-400 font-bold">{filteredErrors.length}</strong> of {WINDOWS_ERROR_CODES.length} codes
            </span>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hex (e.g. 0x80070002, 0x800F081F, 0x0000007B), error name, or symptom..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                    : 'bg-[#181d29] border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat !== 'All' && getCategoryIcon(cat)}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Matrix Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredErrors.length === 0 ? (
          <div className="bg-[#12161f]/50 border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-mono text-sm">No Windows error codes match your search criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-3 text-xs text-amber-400 hover:underline font-mono"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          filteredErrors.map((err) => (
            <div
              key={err.hex}
              className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 transition-all shadow-lg hover:shadow-amber-500/5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                      {err.hex}
                    </span>
                    {getSeverityBadge(err.severity)}
                    <span className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                      {getCategoryIcon(err.category)}
                      {err.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-['Space_Grotesk'] leading-snug">
                    {err.name}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {err.description}
                  </p>
                </div>

                <div className="flex lg:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setActiveError(activeError?.hex === err.hex ? null : err)}
                    className="px-3.5 py-2 text-xs font-mono rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    {activeError?.hex === err.hex ? 'Hide Analysis ▲' : 'Inspect Analysis ▼'}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep Analysis & Solution Steps */}
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#181d29]/80 border border-white/5 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>⚠️</span> Root Causes &amp; Triggers
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-amber-500/60">
                    {err.causes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#181d29]/80 border border-white/5 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <span>🔧</span> Recommended Repair Sequence
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-1.5 pl-4 list-decimal marker:text-sky-400 font-sans">
                    {err.solutionSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Actionable Repair Commands with Copy-To-Clipboard */}
              {err.commands && err.commands.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Automated Repair Commands</span>
                    <span className="text-[11px] text-amber-400/80">Click command to copy</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {err.commands.map((cmd, idx) => {
                      const cmdId = `${err.hex}-cmd-${idx}`;
                      const isCopied = copiedCodeId === cmdId;
                      return (
                        <div
                          key={idx}
                          className="bg-[#0b0e14] border border-white/10 rounded-xl overflow-hidden group hover:border-amber-500/40 transition-all"
                        >
                          <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.03] border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <Terminal className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs font-mono text-slate-300 font-medium">{cmd.label}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase">
                                {cmd.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onAddToScript && (
                                <button
                                  onClick={() => onAddToScript(cmd.code)}
                                  className="text-[11px] font-mono text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded hover:bg-sky-500/10 transition-all"
                                  title="Add to Technician Script Generator"
                                >
                                  + Script Builder
                                </button>
                              )}
                              <button
                                onClick={() => handleCopy(cmd.code, cmdId)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <pre className="p-3.5 text-xs font-mono text-amber-200/90 overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-amber-500/30">
                            <code>{cmd.code}</code>
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
