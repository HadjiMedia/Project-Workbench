import React, { useState, useMemo } from 'react';
import { 
  DIY_REPAIR_CHAPTERS, 
  DIY_REPAIR_GLOSSARY, 
  DIY_REPAIR_TREES, 
  DIY_REPAIR_FORUM_QA,
  GuideChapter,
  GlossaryTerm,
  ForumQAItem
} from '../data/diyRepairGuideData';
import { 
  BookOpen, Search, ShieldAlert, Wrench, Zap, FileCode2,
  AlertTriangle, Laptop, Database, Download, CircuitBoard, 
  CheckCircle2, Copy, Check, Filter, Layers, HelpCircle,
  HardDrive, Cpu, Terminal, ArrowRight, RotateCcw, Sparkles,
  Printer, ExternalLink, Sliders
} from 'lucide-react';

export const DiyRepairHandbook: React.FC = () => {
  // Navigation & Sub-views
  const [activeView, setActiveView] = useState<'chapters' | 'trees' | 'qa' | 'glossary' | 'calc' | 'bootdisk'>('chapters');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Troubleshooting Tree Interactive State
  const [activeTreeId, setActiveTreeId] = useState<string>('tree-no-power');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [treeHistory, setTreeHistory] = useState<string[]>([]);
  const [treeResolvedOutcome, setTreeResolvedOutcome] = useState<string | null>(null);

  // Virtual Memory / Swap File Calculator State
  const [installedRamMb, setInstalledRamMb] = useState<number>(1024); // 1GB
  const [driveCount, setDriveCount] = useState<number>(2);
  const [targetTempDrive, setTargetTempDrive] = useState<string>('D:');

  // DOS Boot Disk Config State
  const [dosDriverName, setDosDriverName] = useState<string>('OAKCDROM.SYS');
  const [dosDriveSignature, setDosDriveSignature] = useState<string>('IDECD001');
  const [dosDriveLetter, setDosDriveLetter] = useState<string>('E');

  // Interactive Checklist State (Local Checkboxes)
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<Record<string, boolean>>({});

  const toggleChecklistItem = (key: string) => {
    setCheckedChecklistItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Filter Chapters
  const filteredChapters = useMemo(() => {
    return DIY_REPAIR_CHAPTERS.filter(ch => {
      const matchesCat = selectedCategory === 'All' || ch.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        ch.title.toLowerCase().includes(q) ||
        ch.subtitle.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        ch.sections.some(s => 
          s.title.toLowerCase().includes(q) || 
          s.description.toLowerCase().includes(q) ||
          s.content.some(c => c.toLowerCase().includes(q))
        );

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Active Chapter Object
  const currentChapter = useMemo(() => {
    return DIY_REPAIR_CHAPTERS.find(c => c.id === selectedChapterId) || DIY_REPAIR_CHAPTERS[0];
  }, [selectedChapterId]);

  // Filtered Glossary
  const filteredGlossary = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return DIY_REPAIR_GLOSSARY;
    return DIY_REPAIR_GLOSSARY.filter(term => 
      term.term.toLowerCase().includes(q) ||
      term.definition.toLowerCase().includes(q) ||
      term.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Q&A
  const filteredQA = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return DIY_REPAIR_FORUM_QA;
    return DIY_REPAIR_FORUM_QA.filter(item => 
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.symptomSummary.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Active Troubleshooting Tree
  const currentTree = useMemo(() => {
    return DIY_REPAIR_TREES.find(t => t.id === activeTreeId) || DIY_REPAIR_TREES[0];
  }, [activeTreeId]);

  const currentStep = currentTree.steps[currentStepIndex] || currentTree.steps[0];

  const handleTreeAnswer = (isYes: boolean) => {
    if (isYes) {
      if (currentStep.yesOutcome) {
        setTreeResolvedOutcome(currentStep.yesOutcome);
      } else if (currentStep.yesNextId) {
        const nextIdx = currentTree.steps.findIndex(s => s.id === currentStep.yesNextId);
        if (nextIdx !== -1) {
          setTreeHistory(prev => [...prev, currentStep.id]);
          setCurrentStepIndex(nextIdx);
        }
      }
    } else {
      if (currentStep.noOutcome) {
        setTreeResolvedOutcome(currentStep.noOutcome);
      } else if (currentStep.noNextId) {
        const nextIdx = currentTree.steps.findIndex(s => s.id === currentStep.noNextId);
        if (nextIdx !== -1) {
          setTreeHistory(prev => [...prev, currentStep.id]);
          setCurrentStepIndex(nextIdx);
        }
      }
    }
  };

  const resetTree = () => {
    setCurrentStepIndex(0);
    setTreeHistory([]);
    setTreeResolvedOutcome(null);
  };

  // Virtual Memory Calculation formulas based on Monte Russell's Guide
  const pagefileInitialMb = installedRamMb;
  const pagefileMaxMb = Math.min(Math.round(installedRamMb * 1.5), 2048);
  const recommendedSwapPartitions = installedRamMb > 2048 ? Math.ceil((installedRamMb * 1.5) / 2048) : 1;

  // Print / Export Entire Handbook
  const handleExportHandbook = () => {
    let md = `# DIY Computer Repair - Complete Technician Guide\n`;
    md += `*Author: Monte Russell (Russell Enterprises)*\n\n`;
    md += `Comprehensive hardware diagnostics, component repair, troubleshooting decision trees, server management, and bench solutions.\n\n`;
    md += `---\n\n`;

    DIY_REPAIR_CHAPTERS.forEach(ch => {
      md += `## Chapter ${ch.chapterNumber}: ${ch.title}\n`;
      md += `### ${ch.subtitle}\n\n`;
      md += `*Category: ${ch.category}*\n\n`;
      md += `${ch.summary}\n\n`;

      ch.sections.forEach(sec => {
        md += `### ${sec.title}\n`;
        md += `_${sec.description}_\n\n`;
        sec.content.forEach(p => md += `${p}\n\n`);

        if (sec.warnings && sec.warnings.length > 0) {
          md += `**⚠️ Warnings:**\n`;
          sec.warnings.forEach(w => md += `- ${w}\n`);
          md += `\n`;
        }

        if (sec.checklist && sec.checklist.length > 0) {
          md += `**✓ Bench Checklist:**\n`;
          sec.checklist.forEach(c => md += `- [ ] ${c}\n`);
          md += `\n`;
        }

        if (sec.codeSnippets && sec.codeSnippets.length > 0) {
          sec.codeSnippets.forEach(code => {
            md += `**${code.title}:**\n\`\`\`${code.language}\n${code.code}\n\`\`\`\n\n`;
          });
        }
      });
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DIY_Computer_Repair_Technician_Manual.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#0f172a] to-[#0d131f] border border-amber-500/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Russell Enterprises 2007 Master Reference
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono">
                300-Page Full Encyclopedia
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              DIY Computer Repair & Diagnostics Manual
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Complete technician guide by Monte Russell: step-by-step component repair, fall-through troubleshooting trees, bare-metal Ghost imaging, swap file optimization, and real-world bench diagnostic solvers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportHandbook}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
              title="Download Complete Guide as Markdown"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Handbook (.md)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Guide</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
          {[
            { id: 'chapters', label: 'Manual Chapters & Guides', icon: BookOpen },
            { id: 'trees', label: 'Interactive Decision Trees', icon: AlertTriangle },
            { id: 'qa', label: 'Real-World Bench Q&A (15+)', icon: HelpCircle },
            { id: 'calc', label: 'Virtual Memory & Temp Optimizer', icon: Sliders },
            { id: 'bootdisk', label: 'DOS Boot File Generator', icon: Terminal },
            { id: 'glossary', label: 'Hardware A-Z Glossary', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: CHAPTERS & IN-DEPTH TUTORIALS */}
      {activeView === 'chapters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Chapter Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chapters, topics, rules..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              {/* Category Quick Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-thin">
                {['All', 'Safety & Basics', 'Component Repair', 'How-To Tutorials', 'Laptops', 'Servers & Networks', 'Hardware Reviews'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter List Cards */}
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredChapters.map(ch => {
                const isSelected = ch.id === selectedChapterId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-[#0b0f17] hover:bg-[#0e131d] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                        Chapter {ch.chapterNumber} · {ch.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {ch.sections.length} topic{ch.sections.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                      {ch.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-sans">
                      {ch.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Content Viewport */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-6">
              
              {/* Chapter Header */}
              <div className="border-b border-white/10 pb-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                    CHAPTER {currentChapter.chapterNumber}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Category: <span className="text-slate-200">{currentChapter.category}</span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {currentChapter.title}
                </h2>
                <p className="text-xs font-mono text-amber-400/90">
                  {currentChapter.subtitle}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                  {currentChapter.summary}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {currentChapter.sections.map((sec, idx) => (
                  <div key={sec.id} className="space-y-4 p-5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white font-mono">
                        {sec.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-slate-400 italic">
                      {sec.description}
                    </p>

                    {/* Content Paragraphs */}
                    <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                      {sec.content.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Warnings Callout */}
                    {sec.warnings && sec.warnings.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>CRITICAL TECHNICIAN WARNING</span>
                        </div>
                        <ul className="space-y-1 text-xs text-rose-200/90 pl-6 list-disc font-mono">
                          {sec.warnings.map((w, wIdx) => (
                            <li key={wIdx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tips Callout */}
                    {sec.tips && sec.tips.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>BENCH TECHNICIAN PRO-TIP</span>
                        </div>
                        <ul className="space-y-1 text-xs text-emerald-200/90 pl-6 list-disc font-mono">
                          {sec.tips.map((t, tIdx) => (
                            <li key={tIdx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interactive Checklist */}
                    {sec.checklist && sec.checklist.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#090d14] border border-amber-500/20 space-y-2.5">
                        <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Bench Verification Checklist
                        </span>
                        <div className="space-y-2">
                          {sec.checklist.map((item, cIdx) => {
                            const itemKey = `${sec.id}-check-${cIdx}`;
                            const isChecked = !!checkedChecklistItems[itemKey];
                            return (
                              <label
                                key={cIdx}
                                className={`flex items-start gap-2.5 p-2 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                                  isChecked ? 'bg-emerald-500/10 text-emerald-300' : 'bg-black/30 text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleChecklistItem(itemKey)}
                                  className="mt-0.5 rounded border-white/20 text-amber-500 focus:ring-0"
                                />
                                <span className={isChecked ? 'line-through opacity-80' : ''}>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Data Tables */}
                    {sec.table && (
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-xs font-mono text-left">
                          <thead className="bg-white/5 text-amber-400 border-b border-white/10">
                            <tr>
                              {sec.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 text-slate-300">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Code Snippets with 1-Click Copy */}
                    {sec.codeSnippets && sec.codeSnippets.map((snippet, sIdx) => {
                      const snippetId = `${sec.id}-code-${sIdx}`;
                      const isCopied = copiedSnippet === snippetId;
                      return (
                        <div key={sIdx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>{snippet.title}</span>
                            <button
                              onClick={() => handleCopy(snippet.code, snippetId)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto">
                            <code>{snippet.code}</code>
                          </pre>
                        </div>
                      );
                    })}

                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: INTERACTIVE DECISION TREES */}
      {activeView === 'trees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tree Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Select Troubleshooting Decision Tree
            </h3>
            <div className="space-y-2">
              {DIY_REPAIR_TREES.map(tree => {
                const isSelected = tree.id === activeTreeId;
                return (
                  <button
                    key={tree.id}
                    onClick={() => {
                      setActiveTreeId(tree.id);
                      resetTree();
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 shadow-lg'
                        : 'bg-[#0e131d] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{tree.category}</span>
                    <div className="text-xs font-bold text-white mt-1">{tree.title}</div>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">{tree.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Tree Step Visualizer */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Step-by-Step Fall-Through Diagnostic
                </span>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">{currentTree.title}</h3>
              </div>
              <button
                onClick={resetTree}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restart Tree</span>
              </button>
            </div>

            {/* Tree Resolution Box */}
            {treeResolvedOutcome ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300 font-mono">DIAGNOSTIC CONCLUSION REACHED</h4>
                    <p className="text-xs text-slate-400">Root cause isolated via fall-through decision sequence.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-xs font-mono text-emerald-200 leading-relaxed">
                  {treeResolvedOutcome}
                </div>
                <button
                  onClick={resetTree}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-colors cursor-pointer"
                >
                  Run Another Diagnostic
                </button>
              </div>
            ) : (
              /* Question Step Card */
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Question Step #{treeHistory.length + 1}</span>
                    <span className="text-amber-400">Node ID: {currentStep.id}</span>
                  </div>
                  <p className="text-base font-medium text-white font-sans leading-relaxed">
                    {currentStep.prompt}
                  </p>
                  {currentStep.detail && (
                    <p className="text-xs text-slate-400 italic">
                      {currentStep.detail}
                    </p>
                  )}
                </div>

                {/* Yes / No Interactive Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTreeAnswer(true)}
                    className="py-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span>YES (Condition Met)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTreeAnswer(false)}
                    className="py-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span>NO (Condition Fails)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW 3: REAL-WORLD BENCH TECH Q&A (FORUM SOLVER) */}
      {activeView === 'qa' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search symptoms (e.g. 'blinking red light', 'underscore', 'freezes after 20 mins', '80GB shows 33.8GB')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredQA.length} bench diagnostic cases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQA.map(item => (
              <div key={item.id} className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 space-y-3.5 hover:border-amber-400/30 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk']">
                    "{item.question}"
                  </h4>
                  <p className="text-xs font-mono text-rose-300/90 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    Symptom: {item.symptomSummary}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.answer}
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Proven Diagnostic Steps:</span>
                  <ul className="space-y-1 text-xs text-slate-400 pl-4 list-decimal font-mono">
                    {item.diagnosticSteps.map((s, sIdx) => (
                      <li key={sIdx}>{s}</li>
                    ))}
                  </ul>
                  {item.preventativeTip && (
                    <p className="text-[11px] font-mono text-emerald-400 mt-2">
                      💡 Tip: {item.preventativeTip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: VIRTUAL MEMORY & TEMP OPTIMIZER CALCULATOR */}
      {activeView === 'calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Chapter 5 &amp; 7 Optimization Rules</span>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Virtual Memory Swapfile &amp; Temp Configurator</h3>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-300">Installed Physical RAM (MB):</label>
                <div className="flex gap-2">
                  {[512, 1024, 2048, 4096, 8192].map(mb => (
                    <button
                      key={mb}
                      onClick={() => setInstalledRamMb(mb)}
                      className={`px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                        installedRamMb === mb 
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400' 
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={installedRamMb}
                  onChange={e => setInstalledRamMb(Math.max(128, parseInt(e.target.value) || 128))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">Target Dedicated Storage Volume:</label>
                <div className="flex gap-2">
                  {['D:', 'E:', 'Z:'].map(drv => (
                    <button
                      key={drv}
                      onClick={() => setTargetTempDrive(drv)}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                        targetTempDrive === drv
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {drv} Volume
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Calculated Initial Pagefile Size:</span>
                <span className="text-emerald-400 font-bold">{pagefileInitialMb} MB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Calculated Maximum Pagefile Size (1.5x):</span>
                <span className="text-amber-400 font-bold">{pagefileMaxMb} MB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recommended Separate Partitions:</span>
                <span className="text-blue-400 font-bold">{recommendedSwapPartitions} drive(s)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-mono">Generated Automation Script &amp; Registry Fix</h4>
              <button
                onClick={() => handleCopy(
                  `mkdir ${targetTempDrive}\\Temp\nsetx TEMP "${targetTempDrive}\\Temp" /M\nsetx TMP "${targetTempDrive}\\Temp" /M\nwmic pagefilesetting create name="${targetTempDrive}\\\\pagefile.sys", InitialSize=${pagefileInitialMb}, MaximumSize=${pagefileMaxMb}`,
                  'opt-script'
                )}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSnippet === 'opt-script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'opt-script' ? 'Copied' : 'Copy Batch Commands'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`:: Monte Russell Windows Performance Optimization Script
:: 1. Create Dedicated High-Speed Temp Directory on Non-OS Drive
mkdir ${targetTempDrive}\\Temp

:: 2. Redirect User & System Temp Environment Variables
setx TEMP "${targetTempDrive}\\Temp" /M
setx TMP "${targetTempDrive}\\Temp" /M

:: 3. Configure Virtual Memory Pagefile on Dedicated Drive
wmic pagefilesetting create name="${targetTempDrive}\\\\pagefile.sys", InitialSize=${pagefileInitialMb}, MaximumSize=${pagefileMaxMb}

:: 4. Disable High-Overhead Legacy Windows Services (Chapter 5)
sc config "Alerter" start= disabled
sc config "ClipBook" start= disabled
sc config "Messenger" start= disabled
sc config "RemoteRegistry" start= disabled
sc config "WebClient" start= disabled

echo Optimization configuration applied successfully.`}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW 5: DOS BOOT DISK GENERATOR */}
      {activeView === 'bootdisk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0e131d] border border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Chapter 5 Tool</span>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">DOS Recovery Boot Disk Configurator</h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-300">Driver File (`.SYS`):</label>
                <input
                  type="text"
                  value={dosDriverName}
                  onChange={e => setDosDriverName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300">Driver Device Signature (/D:):</label>
                <input
                  type="text"
                  value={dosDriveSignature}
                  onChange={e => setDosDriveSignature(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300">Assigned Drive Letter (/L:):</label>
                <input
                  type="text"
                  value={dosDriveLetter}
                  onChange={e => setDosDriveLetter(e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {/* CONFIG.SYS */}
            <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="text-amber-400 font-bold">CONFIG.SYS</span>
                <button
                  onClick={() => handleCopy(`DEVICE=A:\\HIMEM.SYS\nDOS=HIGH,UMB\nDEVICEHIGH=A:\\${dosDriverName} /D:${dosDriveSignature}\nfiles=30\nbuffers=30`, 'dos-config')}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/60 text-xs font-mono text-emerald-400 overflow-x-auto">
{`DEVICE=A:\\HIMEM.SYS
DOS=HIGH,UMB
DEVICEHIGH=A:\\${dosDriverName} /D:${dosDriveSignature}
files=30
buffers=30`}
              </pre>
            </div>

            {/* AUTOEXEC.BAT */}
            <div className="p-5 rounded-2xl bg-[#0e131d] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="text-amber-400 font-bold">AUTOEXEC.BAT</span>
                <button
                  onClick={() => handleCopy(`@echo off\ncls\nMSCDEX.EXE /D:${dosDriveSignature} /L:${dosDriveLetter}\nprompt $p$g`, 'dos-autoexec')}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/60 text-xs font-mono text-emerald-400 overflow-x-auto">
{`@echo off
cls
MSCDEX.EXE /D:${dosDriveSignature} /L:${dosDriveLetter}
prompt $p$g`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: A-Z HARDWARE GLOSSARY */}
      {activeView === 'glossary' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0e131d] border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search glossary terms (e.g. 'Winchester', 'EIDE', 'LVDS', 'EEPROM', 'RAID')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredGlossary.length} defined hardware terms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredGlossary.map((g, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0e131d] border border-white/10 space-y-2 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 font-mono">{g.term}</h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">{g.category}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{g.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
