import React, { useState, useMemo } from 'react';
import { SCRIPT_PRESETS } from '../data/scriptPresets';
import { ScriptOption, ScriptConfig } from '../types';
import { Terminal, Download, Copy, Check, ShieldCheck, RefreshCw, Layers, SlidersHorizontal, FileCode2 } from 'lucide-react';

export const ScriptGenerator: React.FC = () => {
  const [options, setOptions] = useState<ScriptOption[]>(SCRIPT_PRESETS);
  const [config, setConfig] = useState<ScriptConfig>({
    format: 'bat',
    autoElevate: true,
    logToDesktop: true,
    pauseAtEnd: true,
    echoHeaders: true,
    customHeaderNote: 'Workbench Technical Repair Suite - Automated Diagnostic Script'
  });

  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = [
    'All',
    'System Integrity',
    'Network & DNS',
    'Cache & Temp',
    'Windows Update',
    'Performance & Storage',
    'Diagnostics & Logs'
  ];

  // Toggle single option
  const toggleOption = (id: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, enabled: !opt.enabled } : opt));
  };

  // Toggle all in category
  const toggleAll = (enable: boolean) => {
    setOptions(prev => prev.map(opt => ({ ...opt, enabled: enable })));
  };

  // Compile final script
  const compiledScript = useMemo(() => {
    const activeOpts = options.filter(o => o.enabled);

    if (activeOpts.length === 0) {
      return config.format === 'bat' 
        ? ':: Select at least one repair module from the checklist above.\n@echo off\necho No repair modules enabled.\npause'
        : '# Select at least one repair module from the checklist above.\nWrite-Host "No repair modules enabled." -ForegroundColor Yellow';
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (config.format === 'bat') {
      let bat = `@echo off\n:: ==========================================================================\n`;
      bat += `:: ${config.customHeaderNote}\n`;
      bat += `:: Generated: ${timestamp}\n`;
      bat += `:: ==========================================================================\n\n`;

      if (config.autoElevate) {
        bat += `:: Auto-elevate script to Run as Administrator\n`;
        bat += `net session >nul 2>&1\n`;
        bat += `if %errorlevel% neq 0 (\n`;
        bat += `    echo Requesting Administrator privileges...\n`;
        bat += `    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"\n`;
        bat += `    exit /b\n`;
        bat += `)\n\n`;
      }

      bat += `title Workbench System Repair Console\n`;
      bat += `color 0A\n`;
      bat += `echo =====================================================================\n`;
      bat += `echo  STARTING WORKBENCH AUTOMATED SYSTEM REPAIR\n`;
      bat += `echo =====================================================================\n\n`;

      if (config.logToDesktop) {
        bat += `set LOGFILE="%USERPROFILE%\\Desktop\\Workbench_Repair_Log.txt"\n`;
        bat += `echo Execution Log - %date% %time% > %LOGFILE%\n\n`;
      }

      activeOpts.forEach((opt, i) => {
        bat += `:: --------------------------------------------------------------------------\n`;
        bat += `:: Module ${i + 1}/${activeOpts.length}: ${opt.title}\n`;
        bat += `:: --------------------------------------------------------------------------\n`;
        if (config.echoHeaders) {
          bat += `echo [STEP ${i + 1}/${activeOpts.length}] Executing: ${opt.title}...\n`;
        }
        bat += `${opt.cmdCode}\n`;
        if (config.logToDesktop) {
          bat += `echo [OK] Completed ${opt.title} >> %LOGFILE%\n`;
        }
        bat += `\n`;
      });

      bat += `echo =====================================================================\n`;
      bat += `echo  ALL REPAIR PROCEDURES COMPLETED SUCCESSFULLY.\n`;
      if (config.logToDesktop) {
        bat += `echo  Log saved to: %USERPROFILE%\\Desktop\\Workbench_Repair_Log.txt\n`;
      }
      bat += `echo =====================================================================\n`;

      if (config.pauseAtEnd) {
        bat += `pause\n`;
      }

      return bat;
    } else {
      // PowerShell (.ps1)
      let ps = `# ==========================================================================\n`;
      ps += `# ${config.customHeaderNote}\n`;
      ps += `# Generated: ${timestamp}\n`;
      ps += `# ==========================================================================\n\n`;

      if (config.autoElevate) {
        ps += `# Self-elevate to Administrator\n`;
        ps += `if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {\n`;
        ps += `    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`"" -Verb RunAs\n`;
        ps += `    exit\n`;
        ps += `}\n\n`;
      }

      ps += `$Host.UI.RawUI.WindowTitle = "Workbench System Repair Console"\n`;
      ps += `Clear-Host\n`;
      ps += `Write-Host "=====================================================================" -ForegroundColor Green\n`;
      ps += `Write-Host "  STARTING WORKBENCH AUTOMATED SYSTEM REPAIR" -ForegroundColor Green\n`;
      ps += `Write-Host "=====================================================================" -ForegroundColor Green\n\n`;

      if (config.logToDesktop) {
        ps += `$LogPath = "$env:USERPROFILE\\Desktop\\Workbench_Repair_Log.txt"\n`;
        ps += `"Workbench Execution Log - $(Get-Date)" | Out-File $LogPath\n\n`;
      }

      activeOpts.forEach((opt, i) => {
        ps += `# Module ${i + 1}/${activeOpts.length}: ${opt.title}\n`;
        if (config.echoHeaders) {
          ps += `Write-Host "[STEP ${i + 1}/${activeOpts.length}] Executing: ${opt.title}..." -ForegroundColor Cyan\n`;
        }
        ps += `${opt.psCode}\n`;
        if (config.logToDesktop) {
          ps += `"[OK] Finished: ${opt.title} at $(Get-Date)" | Out-File $LogPath -Append\n`;
        }
        ps += `\n`;
      });

      ps += `Write-Host "=====================================================================" -ForegroundColor Green\n`;
      ps += `Write-Host "  ALL REPAIR PROCEDURES COMPLETED SUCCESSFULLY." -ForegroundColor Green\n`;
      if (config.logToDesktop) {
        ps += `Write-Host "  Log written to: $env:USERPROFILE\\Desktop\\Workbench_Repair_Log.txt" -ForegroundColor Yellow\n`;
      }
      ps += `Write-Host "=====================================================================" -ForegroundColor Green\n`;

      if (config.pauseAtEnd) {
        ps += `Read-Host -Prompt "Press Enter to exit..."\n`;
      }

      return ps;
    }
  }, [options, config]);

  // Download Handler
  const handleDownload = () => {
    const filename = `Workbench_Repair_${Date.now()}.${config.format}`;
    const blob = new Blob([compiledScript], { type: config.format === 'bat' ? 'application/x-bat' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPresets = options.filter(opt => filterCategory === 'All' || opt.category === filterCategory);
  const activeCount = options.filter(o => o.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Technician Batch &amp; PowerShell Script Generator
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                Phase 1 Core Diagnostic
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Dynamically combine SFC/DISM repairs, DNS flushes, temporary cache purges, and Windows Update resets into a single executable script.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Script!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download .{config.format.toUpperCase()} Script
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Toggle Checklist on Left, Dynamic Preview & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Modular Preset Checkbox Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Select Repair Modules ({activeCount}/{options.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="text-[11px] font-mono text-emerald-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => toggleAll(false)}
                  className="text-[11px] font-mono text-slate-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredPresets.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    opt.enabled
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                      : 'bg-[#181d29] border-white/5 hover:border-white/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={opt.enabled}
                    onChange={() => {}} // Handled by container
                    className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{opt.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {opt.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{opt.description}</p>
                    {opt.requiresReboot && (
                      <span className="inline-block text-[10px] font-mono text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded mt-1">
                        ⚠️ Requires system reboot
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Options & Real-Time Code Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Script Format & Flags Configuration */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Format Toggle */}
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Script Architecture</label>
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                  <button
                    onClick={() => setConfig(c => ({ ...c, format: 'bat' }))}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all ${
                      config.format === 'bat' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    .BAT (CMD)
                  </button>
                  <button
                    onClick={() => setConfig(c => ({ ...c, format: 'ps1' }))}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all ${
                      config.format === 'ps1' ? 'bg-sky-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    .PS1 (PowerShell)
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-2 flex flex-col justify-center space-y-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={config.autoElevate}
                    onChange={e => setConfig(c => ({ ...c, autoElevate: e.target.checked }))}
                    className="accent-amber-400"
                  />
                  <span>Inject Auto-Elevation (RunAs Administrator)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={config.logToDesktop}
                    onChange={e => setConfig(c => ({ ...c, logToDesktop: e.target.checked }))}
                    className="accent-amber-400"
                  />
                  <span>Output timestamped logs to Desktop\RepairLog.txt</span>
                </label>
              </div>
            </div>
          </div>

          {/* Script Code Viewer */}
          <div className="bg-[#0b0e14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs text-slate-200 font-bold">
                  Repair_Suite.{config.format}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  ({compiledScript.split('\n').length} lines)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Save File
                </button>
              </div>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="p-4 max-h-[460px] overflow-x-auto overflow-y-auto font-mono text-xs text-emerald-300/90 leading-relaxed whitespace-pre selection:bg-emerald-500/30">
              <code>{compiledScript}</code>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
