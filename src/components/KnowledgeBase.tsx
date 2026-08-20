import React, { useState, useEffect } from 'react';
import { INITIAL_KB_ARTICLES } from '../data/kbData';
import { KnowledgeArticle } from '../types';
import { Search, Plus, Download, Lock, Unlock, Copy, Check, FileText, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface KnowledgeBaseProps {
  isVaultUnlocked: boolean;
  onOpenVaultModal: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ isVaultUnlocked, onOpenVaultModal }) => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => {
    try {
      const saved = localStorage.getItem('wb_kb_articles');
      return saved ? JSON.parse(saved) : INITIAL_KB_ARTICLES;
    } catch {
      return INITIAL_KB_ARTICLES;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  
  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formState, setFormState] = useState<Partial<KnowledgeArticle>>({
    title: '',
    category: 'Windows & OS Repair',
    tags: [],
    content: '',
    code: '',
    restricted: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    localStorage.setItem('wb_kb_articles', JSON.stringify(articles));
  }, [articles]);

  const categories = [
    'All',
    'Windows & OS Repair',
    'Application Fixes',
    'Graphics & Adobe Suite',
    'Boot & Storage',
    'Network & DNS'
  ];

  const filteredArticles = articles.filter(art => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      art.title.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q) ||
      (art.code || '').toLowerCase().includes(q) ||
      art.tags.some(t => t.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleExportAllMarkdown = () => {
    let md = `# Workbench Software Repair & Technical Knowledge Base\n\n`;
    articles.forEach(art => {
      md += `## ${art.title}\n\n`;
      md += `**Category:** ${art.category} | **Tags:** ${art.tags.map(t => '#' + t).join(' ')}\n\n`;
      md += `${art.content}\n\n`;
      if (art.code) {
        md += `\`\`\`bash\n${art.code}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Workbench_Software_Repair_Guides_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openEditor = (article?: KnowledgeArticle) => {
    if (article) {
      setFormState(article);
      setTagInput(article.tags.join(', '));
    } else {
      setFormState({
        title: '',
        category: 'Windows & OS Repair',
        tags: [],
        content: '',
        code: '',
        restricted: false
      });
      setTagInput('');
    }
    setIsEditorOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title || !formState.content) {
      alert('Please provide Title and Content.');
      return;
    }

    const tagsArray = tagInput.split(',').map(s => s.trim()).filter(Boolean);

    if (formState.id) {
      setArticles(prev => prev.map(a => a.id === formState.id ? { ...a, ...(formState as KnowledgeArticle), tags: tagsArray, updatedAt: Date.now() } : a));
    } else {
      const newArt: KnowledgeArticle = {
        id: 'kb_' + Date.now(),
        title: formState.title || '',
        category: formState.category || 'Windows & OS Repair',
        tags: tagsArray,
        content: formState.content || '',
        code: formState.code || '',
        restricted: !!formState.restricted,
        updatedAt: Date.now()
      };
      setArticles(prev => [newArt, ...prev]);
    }
    setIsEditorOpen(false);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Delete this repair tutorial?')) {
      setArticles(prev => prev.filter(a => a.id !== id));
      if (activeArticle?.id === id) setActiveArticle(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Software Repair &amp; Troubleshooting Knowledge Base
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                Offline Field Reference
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Curated repair steps, PowerShell scripts, registry fixes, and recovery procedures for OS and productivity apps.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportAllMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export All (.md)
            </button>
            <button
              onClick={() => openEditor()}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
            >
              <Plus className="w-4 h-4" /> New Guide
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, tags (#office, #bluescreen), commands, or software..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-[#181d29] border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((art) => {
          const isRestricted = art.restricted && !isVaultUnlocked;
          return (
            <div
              key={art.id}
              onClick={() => {
                if (isRestricted) onOpenVaultModal();
                else setActiveArticle(art);
              }}
              className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    {art.category}
                  </span>
                  {art.restricted && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" /> Vault Guarded
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] leading-snug">
                  {isRestricted ? '🔒 Restricted Diagnostic Guide' : art.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {isRestricted ? 'Unlock the vault to view this restricted repair procedure.' : art.content}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{art.code ? '💻 Has Script' : '📝 Notes only'}</span>
                <span>{new Date(art.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{activeArticle.category}</span>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white mt-1">
                  {activeArticle.title}
                </h3>
              </div>
              <button onClick={() => setActiveArticle(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {activeArticle.content}
            </p>

            {activeArticle.code && (
              <div className="bg-[#0b0e14] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.03] border-b border-white/5">
                  <span className="text-xs font-mono text-slate-400">Terminal Script / Commands</span>
                  <button
                    onClick={() => handleCopyCode(activeArticle.code!, activeArticle.id)}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1"
                  >
                    {copiedCodeId === activeArticle.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCodeId === activeArticle.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                  <code>{activeArticle.code}</code>
                </pre>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {activeArticle.tags.map(tag => (
                <span key={tag} className="font-mono text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <button
                onClick={() => handleDeleteArticle(activeArticle.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
              >
                Delete Guide
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const art = activeArticle;
                    setActiveArticle(null);
                    openEditor(art);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white">
                {formState.id ? 'Edit Repair Guide' : 'Publish New Repair Tutorial'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Guide Title *</label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={e => setFormState(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Fix PowerPoint Add-In Crash on Launch"
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Category</label>
                  <select
                    value={formState.category}
                    onChange={e => setFormState(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="powerpoint, crash, office"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Step-by-Step Explanation *</label>
                <textarea
                  required
                  rows={4}
                  value={formState.content}
                  onChange={e => setFormState(p => ({ ...p, content: e.target.value }))}
                  placeholder="Detail root cause and sequential steps..."
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Terminal Commands / Script (Optional)</label>
                <textarea
                  rows={4}
                  value={formState.code}
                  onChange={e => setFormState(p => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. sfc /scannow"
                  className="w-full bg-[#0b0e14] border border-white/10 rounded-xl p-3 text-emerald-300 font-mono text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={formState.restricted}
                  onChange={e => setFormState(p => ({ ...p, restricted: e.target.checked }))}
                  className="accent-purple-400"
                />
                <span>Lock with PIN Vault Guard</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 text-slate-950"
                >
                  Save Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
