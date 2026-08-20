import React, { useState } from 'react';
import { 
  BIOS_BOOT_KEYS, 
  STARTUP_SHORTCUTS, 
  EZ_DEBUG_LEDS, 
  DISPLAY_SPECS, 
  FRONT_PANEL_JFP1_PINS, 
  RESCUE_COMMANDS,
  BiosKeyEntry,
  EzDebugLedGuide
} from '../data/cheatSheetsData';
import { 
  Printer, Search, Copy, Check, Terminal, 
  Cpu, Monitor, Tv, Zap, HardDrive, KeyRound, 
  FileText, Sparkles, AlertTriangle, Layers, Bookmark, 
  CheckCircle2, ArrowRight, ExternalLink, HelpCircle
} from 'lucide-react';

type CheatCategory = 'all' | 'bios' | 'leds' | 'pinouts' | 'display' | 'commands';

export const CheatSheetHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CheatCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandCategoryFilter, setBrandCategoryFilter] = useState<string>('All');
  const [selectedLed, setSelectedLed] = useState<EzDebugLedGuide>(EZ_DEBUG_LEDS[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter BIOS Keys
  const filteredBiosKeys = BIOS_BOOT_KEYS.filter(b => {
    const matchesCat = brandCategoryFilter === 'All' || b.category === brandCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.brand.toLowerCase().includes(q) || 
      b.biosKey.toLowerCase().includes(q) || 
      b.bootMenuKey.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Filter Startup Shortcuts
  const filteredShortcuts = STARTUP_SHORTCUTS.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q || 
      s.actionName.toLowerCase().includes(q) || 
      s.hotkey.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) ||
      s.useCase.toLowerCase().includes(q);
  });

  // Filter Commands
  const filteredCommands = RESCUE_COMMANDS.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return !q || 
      c.command.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Action (Hidden during print) */}
      <div className="no-print bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Printable Workbench Cheat Sheets &amp; Visual Cards
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                Field Reference Manual
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              High-utility hardware reference charts, brand-specific BIOS/UEFI keys, EZ Debug LED diagnostic guides, front panel JFP1 schematics, and rescue command cheat sheets. Print directly for bench laminates or flash drives.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              title="Print formatted high-contrast reference cards (Ctrl+P)"
            >
              <Printer className="w-4 h-4" /> Print Desk Manual (PDF)
            </button>
          </div>
        </div>

        {/* Global Search & Category Tabs */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cheat sheets (e.g. ASUS, Safe Mode, DRAM LED, JFP1, sfc /scannow, HDMI 2.1)..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            {[
              { id: 'all' as CheatCategory, label: 'Full Deck' },
              { id: 'bios' as CheatCategory, label: 'BIOS & Boot Keys' },
              { id: 'leds' as CheatCategory, label: 'EZ Debug LEDs' },
              { id: 'pinouts' as CheatCategory, label: 'JFP1 & Power Pinouts' },
              { id: 'display' as CheatCategory, label: 'HDMI vs DP Specs' },
              { id: 'commands' as CheatCategory, label: 'Rescue Commands' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: BIOS & UEFI SETUP KEYS + STARTUP SHORTCUTS                     */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'bios') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              1. Brand-Specific BIOS / UEFI &amp; Boot Menu Matrix
            </h3>
            <div className="no-print flex items-center gap-2">
              <select
                value={brandCategoryFilter}
                onChange={e => setBrandCategoryFilter(e.target.value)}
                className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-1 text-xs font-mono text-white focus:border-amber-400"
              >
                <option value="All">All Hardware Categories</option>
                <option value="Desktop Motherboard">Desktop Motherboards</option>
                <option value="Laptop / OEM">Laptops &amp; OEM</option>
                <option value="Server / Workstation">Servers &amp; Workstations</option>
                <option value="Handheld / Console">Handhelds &amp; Consoles</option>
              </select>
            </div>
          </div>

          {/* BIOS Keys Table */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4">MANUFACTURER / BRAND</th>
                    <th className="py-3 px-4">BIOS / UEFI SETUP KEY</th>
                    <th className="py-3 px-4">ONE-TIME BOOT MENU</th>
                    <th className="py-3 px-4">RECOVERY / TOOL KEY</th>
                    <th className="py-3 px-4">BENCH NOTES &amp; TRICKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBiosKeys.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-white font-['Space_Grotesk'] text-sm">
                        {item.brand}
                        <span className="text-[10px] block font-mono text-slate-500 font-normal">{item.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          {item.biosKey}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                          {item.bootMenuKey}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {item.recoveryKey || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safe Mode & macOS Startup Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Windows Safe Mode Tricks */}
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                Windows Safe Mode &amp; Fast-Boot Bypasses
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                {filteredShortcuts.filter(s => s.platform === 'Windows').map((s, idx) => (
                  <div key={idx} className="bg-[#181d29] p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{s.actionName}</span>
                      <kbd className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                        {s.hotkey}
                      </kbd>
                    </div>
                    <p className="text-slate-400 text-[11px]">{s.description}</p>
                    <div className="text-[10px] text-teal-400">💡 {s.useCase}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* macOS Diagnostic Combinations */}
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Apple Mac Startup &amp; Recovery Shortcuts
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                {filteredShortcuts.filter(s => s.platform === 'macOS').map((s, idx) => (
                  <div key={idx} className="bg-[#181d29] p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{s.actionName}</span>
                      <kbd className="bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                        {s.hotkey}
                      </kbd>
                    </div>
                    <p className="text-slate-400 text-[11px]">{s.description}</p>
                    <div className="text-[10px] text-teal-400">💡 {s.useCase}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: EZ DEBUG LED DIAGNOSTIC GUIDE                                 */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'leds') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              2. Modern Motherboard EZ Debug LED Visual Guide
            </h3>
            <span className="text-xs font-mono text-slate-400">Status indicators for ASUS, MSI, Gigabyte, ASRock</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Interactive LED Status Buttons (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  SELECT STUCK DEBUG LED ON BOARD:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {EZ_DEBUG_LEDS.map(item => {
                    const isSelected = selectedLed.led === item.led;
                    const ledColors = {
                      CPU: 'from-rose-500 to-red-600 border-rose-500 shadow-rose-500/40',
                      DRAM: 'from-amber-400 to-yellow-500 border-amber-400 shadow-amber-400/40',
                      VGA: 'from-slate-100 to-slate-300 border-white shadow-white/40 text-slate-900',
                      BOOT: 'from-emerald-400 to-green-500 border-emerald-400 shadow-emerald-400/40'
                    };

                    return (
                      <button
                        key={item.led}
                        onClick={() => setSelectedLed(item)}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-[#181d29] border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-gradient-to-br border shadow-lg ${ledColors[item.led]} animate-pulse`} />
                        <span className="font-mono text-sm font-bold text-white tracking-wider">{item.led} LED</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.color}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
                  ⚡ <strong>Normal Boot Sequence:</strong> CPU ➔ DRAM ➔ VGA ➔ BOOT. LEDs flash in sequence and turn OFF. A solid light indicates a failure at that specific stage.
                </div>
              </div>
            </div>

            {/* Right Detailed Diagnostic & Fix Action Card (8 cols) */}
            <div className="lg:col-span-8">
              <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/40">
                      {selectedLed.led} LED FAULT
                    </span>
                    <h4 className="text-base font-bold text-white font-['Space_Grotesk']">{selectedLed.meaning}</h4>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{selectedLed.color}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Common Causes */}
                  <div className="bg-[#181d29] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      MOST COMMON CAUSES:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedLed.commonCauses.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Bench Actions */}
                  <div className="bg-[#181d29] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      STEP-BY-STEP BENCH RESOLUTION:
                    </span>
                    <ul className="space-y-1.5 text-xs text-emerald-300 font-mono">
                      {selectedLed.diagnosticSteps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: FRONT PANEL JFP1 & HARDWARE POWER PINOUTS                     */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'pinouts') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              3. Front Panel Header JFP1 &amp; Power Supply Voltage Pinout
            </h3>
            <span className="text-xs font-mono text-slate-400">Industry Standard Intel / AMD 9-Pin JFP1 Pinout</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* JFP1 9-Pin Visual Schematic (6 cols) */}
            <div className="lg:col-span-6 bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-['Space_Grotesk'] text-white">
                  JFP1 Front Panel Header Map (Top View)
                </span>
                <span className="font-mono text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                  Standard 9-Pin Header
                </span>
              </div>

              {/* Graphical Header Grid */}
              <div className="bg-[#0b0e14] p-5 rounded-2xl border border-white/10 space-y-4 font-mono">
                <div className="flex justify-between text-[11px] text-slate-400 px-2">
                  <span>Pin 1 (Top-Left)</span>
                  <span>Pin 10 (Key Blank)</span>
                </div>

                {/* Pin Matrix: Row 1 (Even 2, 4, 6, 8, 10) / Row 2 (Odd 1, 3, 5, 7, 9) */}
                <div className="space-y-3 max-w-sm mx-auto">
                  {/* Top Row: 2, 4, 6, 8, [10 Key] */}
                  <div className="grid grid-cols-5 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                      <div className="text-[10px] font-bold">2</div>
                      <div className="text-[9px] font-mono">PWR_LED+</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-300">
                      <div className="text-[10px] font-bold">4</div>
                      <div className="text-[9px] font-mono">PWR_LED-</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/30 border border-amber-500/60 text-amber-300 ring-2 ring-amber-400/40">
                      <div className="text-[10px] font-bold">6</div>
                      <div className="text-[9px] font-mono">PWR_SW</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/30 border border-amber-500/60 text-amber-300 ring-2 ring-amber-400/40">
                      <div className="text-[10px] font-bold">8</div>
                      <div className="text-[9px] font-mono">GND</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-600 flex items-center justify-center text-[10px]">
                      [KEY]
                    </div>
                  </div>

                  {/* Bottom Row: 1, 3, 5, 7, 9 */}
                  <div className="grid grid-cols-5 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                      <div className="text-[10px] font-bold">1</div>
                      <div className="text-[9px] font-mono">HD_LED+</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-500/40 text-rose-300">
                      <div className="text-[10px] font-bold">3</div>
                      <div className="text-[9px] font-mono">HD_LED-</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
                      <div className="text-[10px] font-bold">5</div>
                      <div className="text-[9px] font-mono">RESET</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-900/40 border border-blue-500/40 text-blue-300">
                      <div className="text-[10px] font-bold">7</div>
                      <div className="text-[9px] font-mono">GND</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-500">
                      <div className="text-[10px] font-bold">9</div>
                      <div className="text-[9px] font-mono">NC</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    🔧 Screwdriver Test Jump:
                  </div>
                  <div>To bench test power-on without a PC case, briefly bridge <strong>Pin 6 &amp; Pin 8 (PWR_SW &amp; GND)</strong> using the tip of a flathead screwdriver.</div>
                </div>
              </div>
            </div>

            {/* ATX / EPS / PCIe Quick Voltage Tolerance Card (6 cols) */}
            <div className="lg:col-span-6 bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-['Space_Grotesk'] text-white">
                  ATX Power Supply Multimeter Tolerances (&plusmn;5%)
                </span>
                <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  ATX 3.1 Spec
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { rail: '+12V Rail (Yellow)', nominal: '12.00 V', min: '11.40 V', max: '12.60 V', wires: 'GPU 8-pin, EPS 8-pin, 24-pin pins 10,11' },
                  { rail: '+5V Rail (Red)', nominal: '5.00 V', min: '4.75 V', max: '5.25 V', wires: 'SATA SSD logic, USB 5V, 24-pin pins 4,6,19,20' },
                  { rail: '+3.3V Rail (Orange)', nominal: '3.30 V', min: '3.14 V', max: '3.47 V', wires: 'M.2 NVMe, motherboard chipset, 24-pin pins 1,2,12' },
                  { rail: '+5VSB Standby (Purple)', nominal: '5.00 V', min: '4.75 V', max: '5.25 V', wires: 'Active even when PC is off (24-pin Pin 9)' },
                  { rail: 'PS_ON# (Green)', nominal: '0.00 V to start', min: 'Short to Black GND (Pin 16 to 17) to jump-start PSU standalone', max: '', wires: '24-pin Pin 16' }
                ].map((r, idx) => (
                  <div key={idx} className="bg-[#181d29] p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-[11px]">{r.rail}</div>
                      <div className="text-[10px] text-slate-400">{r.wires}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-emerald-400 font-bold">{r.nominal}</div>
                      {r.min && <div className="text-[10px] text-slate-500">{r.min} - {r.max}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: DISPLAY OUTPUT SPECS CHART (HDMI vs DISPLAYPORT)              */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'display') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-teal-400" />
              4. Display Output Specifications: HDMI vs DisplayPort Comparison
            </h3>
            <span className="text-xs font-mono text-slate-400">Maximum resolution &amp; refresh rate capabilities</span>
          </div>

          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4">STANDARD</th>
                    <th className="py-3 px-4">MAX BANDWIDTH</th>
                    <th className="py-3 px-4">MAX 1080p</th>
                    <th className="py-3 px-4">MAX 1440p</th>
                    <th className="py-3 px-4">MAX 4K</th>
                    <th className="py-3 px-4">8K &amp; HDR / DSC</th>
                    <th className="py-3 px-4">BENCH SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {DISPLAY_SPECS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded font-bold ${
                          item.type === 'HDMI' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        }`}>
                          {item.standard}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">
                        {item.maxBandwidthGbps} Gbps
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {item.max1080pHz} Hz
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {item.max1440pHz} Hz
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-bold">
                        {item.max4kHz} Hz
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${item.hdrSupport ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                            HDR: {item.hdrSupport ? 'YES' : 'NO'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${item.dscSupport ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                            DSC: {item.dscSupport ? 'YES' : 'NO'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: WINDOWS & LINUX EMERGENCY RESCUE COMMAND ARSENAL              */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'commands') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              5. Windows &amp; Linux Emergency Rescue Command Arsenal
            </h3>
            <span className="text-xs font-mono text-slate-400">1-Click Copy Terminal Snippets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommands.map((cmd, idx) => (
              <div
                key={idx}
                className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/10">
                      {cmd.category}
                    </span>
                    <h4 className="text-xs font-bold font-mono text-slate-300 mt-1">{cmd.description}</h4>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                    cmd.riskLevel === 'Safe' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : cmd.riskLevel === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {cmd.riskLevel}
                  </span>
                </div>

                {/* Command Box with 1-Click Copy */}
                <div className="relative group">
                  <pre className="p-3 rounded-xl bg-[#0b0e14] border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    <code>{cmd.command}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(cmd.command)}
                    className="no-print absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-all"
                  >
                    {copiedCmd === cmd.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === cmd.command ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400 leading-relaxed bg-[#181d29] p-2.5 rounded-xl border border-white/5">
                  <strong>Flags:</strong> {cmd.flagsExplained}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Footer Notice */}
      <div className="pt-6 border-t border-white/10 text-center text-xs font-mono text-slate-500">
        Workbench Diagnostics &amp; Software Repair Console · Technician Field Reference Manual · All Rights Reserved
      </div>
    </div>
  );
};
