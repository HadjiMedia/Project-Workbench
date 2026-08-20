import React, { useState, useMemo } from 'react';
import { CPU_PRESETS, GPU_PRESETS, ATX_VOLTAGE_TOLERANCES } from '../data/psuDatabase';
import { PsuComponentSelection } from '../types';
import { Zap, Gauge, CheckCircle2, AlertTriangle, XCircle, Activity, Info, Sliders, Cpu, HardDrive, Shield } from 'lucide-react';

export const PsuCalculator: React.FC = () => {
  const [selection, setSelection] = useState<PsuComponentSelection>({
    cpuModel: CPU_PRESETS[0].name,
    cpuTdp: CPU_PRESETS[0].tdp,
    cpuOverclockW: 0,
    gpuModel: GPU_PRESETS[0].name,
    gpuTgp: GPU_PRESETS[0].tgp,
    gpuCount: 1,
    ramSticks: 2,
    ramType: 'DDR5',
    m2NvmeCount: 2,
    sataSsdCount: 1,
    sataHddCount: 1,
    caseFansCount: 4,
    aioPumpType: '240mm',
    pcieExpansionCards: 0,
    rgbLightingWatts: 15,
    usbPeripheralsWatts: 20,
    loadHeadroomPercent: 25
  });

  // Multimeter live probe simulator state
  const [measuredVoltages, setMeasuredVoltages] = useState<Record<string, string>>({
    '+12V': '12.12',
    '+5V': '5.04',
    '+3.3V': '3.32',
    '+5VSB': '5.08',
    '-12V': '-11.95'
  });

  // Handle CPU change
  const handleCpuChange = (modelName: string) => {
    const preset = CPU_PRESETS.find(p => p.name === modelName);
    if (preset) {
      setSelection(prev => ({
        ...prev,
        cpuModel: preset.name,
        cpuTdp: preset.tdp
      }));
    }
  };

  // Handle GPU change
  const handleGpuChange = (modelName: string) => {
    const preset = GPU_PRESETS.find(p => p.name === modelName);
    if (preset) {
      setSelection(prev => ({
        ...prev,
        gpuModel: preset.name,
        gpuTgp: preset.tgp
      }));
    }
  };

  // Calculate rail power distribution
  const calculations = useMemo(() => {
    // 1. CPU Power (+12V rail mainly)
    const cpuTotal = (selection.cpuTdp + selection.cpuOverclockW);
    const cpu12V = cpuTotal * 0.95;
    const cpuOther = cpuTotal * 0.05;

    // 2. GPU Power (+12V rail mostly, minor 3.3V on slot)
    const gpuTotal = selection.gpuTgp * selection.gpuCount;
    const gpu12V = gpuTotal * 0.96;
    const gpu33V = gpuTotal * 0.04;

    // 3. RAM Power
    // DDR4 ~3W per stick (+1.2V buck from 3.3V/5V), DDR5 ~4.5W per stick (PMIC on 5V/12V input)
    const ramWattsPerStick = selection.ramType === 'DDR5' ? 5 : 3.5;
    const ramTotal = selection.ramSticks * ramWattsPerStick;
    const ram33V = ramTotal * 0.5;
    const ram5V = ramTotal * 0.5;

    // 4. Storage
    // M.2 NVMe: ~7W active (+3.3V rail directly)
    const nvmeWatts = selection.m2NvmeCount * 7.5;
    // 2.5" SATA SSD: ~4W (+5V rail)
    const sataSsdWatts = selection.sataSsdCount * 4;
    // 3.5" 7200RPM HDD: ~10W spin/read (+12V motor ~7W, +5V logic ~3W)
    const hdd12V = selection.sataHddCount * 7.5;
    const hdd5V = selection.sataHddCount * 3.5;

    // 5. Fans & Cooling (+12V rail)
    const fanWatts = selection.caseFansCount * 2.5;
    let pumpWatts = 0;
    if (selection.aioPumpType === '120mm') pumpWatts = 6;
    else if (selection.aioPumpType === '240mm') pumpWatts = 12;
    else if (selection.aioPumpType === '360mm') pumpWatts = 18;
    else if (selection.aioPumpType === 'custom_d5') pumpWatts = 28;

    // 6. Motherboard Chipset, Audio & Peripherals
    const mbBase12V = 15;
    const mbBase5V = 12;
    const mbBase33V = 18;

    // PCIe Cards (~25W default: +12V 15W, +3.3V 10W)
    const pcieCard12V = selection.pcieExpansionCards * 15;
    const pcieCard33V = selection.pcieExpansionCards * 10;

    // RGB & USB
    const rgb5V = selection.rgbLightingWatts * 0.8;
    const rgb12V = selection.rgbLightingWatts * 0.2;
    const usb5V = selection.usbPeripheralsWatts;

    // Summing by Rail
    const rail12V_Watts = cpu12V + gpu12V + hdd12V + fanWatts + pumpWatts + mbBase12V + pcieCard12V + rgb12V;
    const rail5V_Watts = cpuOther + ram5V + sataSsdWatts + hdd5V + mbBase5V + rgb5V + usb5V;
    const rail33V_Watts = gpu33V + ram33V + nvmeWatts + mbBase33V + pcieCard33V;
    const rail5VSB_Watts = 5.0; // Standby
    const railMinus12V_Watts = 2.0; // Audio opamps

    const totalSystemWatts = rail12V_Watts + rail5V_Watts + rail33V_Watts + rail5VSB_Watts + railMinus12V_Watts;
    
    // Headroom buffer calculation (25% for transient spikes / ATX 3.0 standard)
    const bufferMultiplier = 1 + (selection.loadHeadroomPercent / 100);
    const recommendedPsuWatts = Math.ceil((totalSystemWatts * bufferMultiplier) / 50) * 50;

    // Current in Amps: I = P / V
    const rail12V_Amps = rail12V_Watts / 12.0;
    const rail5V_Amps = rail5V_Watts / 5.0;
    const rail33V_Amps = rail33V_Watts / 3.3;

    return {
      rail12V_Watts: Math.round(rail12V_Watts),
      rail5V_Watts: Math.round(rail5V_Watts),
      rail33V_Watts: Math.round(rail33V_Watts),
      rail12V_Amps: parseFloat(rail12V_Amps.toFixed(1)),
      rail5V_Amps: parseFloat(rail5V_Amps.toFixed(1)),
      rail33V_Amps: parseFloat(rail33V_Amps.toFixed(1)),
      totalSystemWatts: Math.round(totalSystemWatts),
      recommendedPsuWatts,
      peakTransientEstimate: Math.round(gpuTotal * 1.8 + cpuTotal * 1.3)
    };
  }, [selection]);

  // Multimeter testing function
  const evaluateMultimeter = (railName: string) => {
    const spec = ATX_VOLTAGE_TOLERANCES.find(r => r.rail === railName);
    if (!spec) return { status: 'UNKNOWN', diff: 0, text: 'No Spec' };

    const val = parseFloat(measuredVoltages[railName]);
    if (isNaN(val)) return { status: 'INVALID', diff: 0, text: 'Enter Voltage' };

    const min = spec.minAllowed;
    const max = spec.maxAllowed;
    const nominal = spec.nominalVoltage;

    const diffPercent = ((val - nominal) / nominal) * 100;

    if (railName === '-12V') {
      // For negative rail
      if (val >= min && val <= max) {
        return { status: 'PASS', diff: diffPercent, text: 'Within ATX ±10% Spec' };
      }
      return { status: 'FAIL', diff: diffPercent, text: 'Out of Tolerance!' };
    }

    if (val >= min && val <= max) {
      // Check if marginal (within outer 1.5%)
      const isMarginalLow = val < nominal - ((nominal * 0.035));
      const isMarginalHigh = val > nominal + ((nominal * 0.035));
      if (isMarginalLow || isMarginalHigh) {
        return { status: 'WARN', diff: diffPercent, text: 'Marginal (Near Limits)' };
      }
      return { status: 'PASS', diff: diffPercent, text: 'Optimal (Within ±5%)' };
    }

    return { status: 'FAIL', diff: diffPercent, text: val < min ? 'Under-voltage (PSU Sag / Droop)' : 'Over-voltage (Dangerous Surge)' };
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
                Power Supply &amp; Voltage Rail Calculator
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400">
                ATX 3.0 / PCIe 5.0 Spec
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate individual +12V, +5V, and +3.3V power demands, calculate rail amperages, and verify physical multimeter voltage tolerances.
            </p>
          </div>

          {/* Big Recommendation Card */}
          <div className="bg-gradient-to-br from-amber-500/15 via-sky-500/10 to-transparent border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Recommended PSU</div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {calculations.recommendedPsuWatts} Watts
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Estimated Load: <strong className="text-white">{calculations.totalSystemWatts}W</strong> ({selection.loadHeadroomPercent}% headroom)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Component Selector on Left, Rail Analysis & Multimeter on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Component Inputs (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Component Power Configuration
            </h3>

            {/* CPU Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-amber-400" /> Processor (CPU)</span>
                <span className="text-amber-400 font-bold">{selection.cpuTdp}W Base TDP</span>
              </label>
              <select
                value={selection.cpuModel}
                onChange={(e) => handleCpuChange(e.target.value)}
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-400"
              >
                {CPU_PRESETS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.tdp}W) - {c.socket}
                  </option>
                ))}
              </select>

              {/* Custom CPU / Overclock Adjuster */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Overclock / PBO Headroom</span>
                    <span>+{selection.cpuOverclockW}W</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="10"
                    value={selection.cpuOverclockW}
                    onChange={(e) => setSelection(prev => ({ ...prev, cpuOverclockW: parseInt(e.target.value) }))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* GPU Selection */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-sky-400" /> Graphics Card (GPU)</span>
                <span className="text-sky-400 font-bold">{selection.gpuTgp * selection.gpuCount}W TGP</span>
              </label>
              <select
                value={selection.gpuModel}
                onChange={(e) => handleGpuChange(e.target.value)}
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-sky-400"
              >
                {GPU_PRESETS.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.tgp}W)
                  </option>
                ))}
              </select>
            </div>

            {/* RAM & Storage */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">RAM Sticks</label>
                <div className="flex gap-2">
                  <select
                    value={selection.ramSticks}
                    onChange={(e) => setSelection(p => ({ ...p, ramSticks: parseInt(e.target.value) }))}
                    className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value={1}>1x DIMM</option>
                    <option value={2}>2x DIMM</option>
                    <option value={4}>4x DIMM</option>
                  </select>
                  <select
                    value={selection.ramType}
                    onChange={(e) => setSelection(p => ({ ...p, ramType: e.target.value as any }))}
                    className="w-24 bg-[#181d29] border border-white/10 rounded-xl px-2.5 py-2 text-sm text-white"
                  >
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">M.2 NVMe SSDs</label>
                <select
                  value={selection.m2NvmeCount}
                  onChange={(e) => setSelection(p => ({ ...p, m2NvmeCount: parseInt(e.target.value) }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value={0}>0 Drives</option>
                  <option value={1}>1x NVMe M.2</option>
                  <option value={2}>2x NVMe M.2</option>
                  <option value={3}>3x NVMe M.2</option>
                  <option value={4}>4x NVMe M.2</option>
                </select>
              </div>
            </div>

            {/* SATA Storage & Cooling */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">2.5" SATA SSD</label>
                <select
                  value={selection.sataSsdCount}
                  onChange={(e) => setSelection(p => ({ ...p, sataSsdCount: parseInt(e.target.value) }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  {[0, 1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n} SSDs</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">3.5" 7200 RPM</label>
                <select
                  value={selection.sataHddCount}
                  onChange={(e) => setSelection(p => ({ ...p, sataHddCount: parseInt(e.target.value) }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  {[0, 1, 2, 4, 6].map(n => <option key={n} value={n}>{n} HDDs</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Case Fans</label>
                <select
                  value={selection.caseFansCount}
                  onChange={(e) => setSelection(p => ({ ...p, caseFansCount: parseInt(e.target.value) }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  {[0, 2, 3, 4, 6, 8, 10].map(n => <option key={n} value={n}>{n} Fans</option>)}
                </select>
              </div>
            </div>

            {/* AIO Pump & Headroom */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Liquid Cooling / AIO</label>
                <select
                  value={selection.aioPumpType}
                  onChange={(e) => setSelection(p => ({ ...p, aioPumpType: e.target.value as any }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="none">Air Cooler (0W Pump)</option>
                  <option value="120mm">120mm AIO (~6W)</option>
                  <option value="240mm">240mm / 280mm AIO (~12W)</option>
                  <option value="360mm">360mm / 420mm AIO (~18W)</option>
                  <option value="custom_d5">Custom Loop D5/DDC (~28W)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Safety Buffer ({selection.loadHeadroomPercent}%)
                </label>
                <select
                  value={selection.loadHeadroomPercent}
                  onChange={(e) => setSelection(p => ({ ...p, loadHeadroomPercent: parseInt(e.target.value) }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={15}>15% (Tight Budget)</option>
                  <option value={25}>25% (Standard ATX 3.0)</option>
                  <option value={35}>35% (High Transient Reserve)</option>
                  <option value={50}>50% (Silent / Fanless Curve)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rail Breakdown & Multimeter Inspector (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Rail Wattage & Amperage Breakdown Cards */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Power Distribution Across Supply Rails
              </span>
              <span className="font-mono text-xs text-slate-400">Total: {calculations.totalSystemWatts}W</span>
            </h3>

            {/* +12V Rail */}
            <div className="bg-[#181d29] border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                  <span className="font-mono font-bold text-white text-sm">+12V Primary Rail</span>
                  <span className="text-[11px] font-mono text-slate-400">(CPU, GPU, Fans, Pumps)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-yellow-400 text-base">{calculations.rail12V_Watts} W</span>
                  <span className="font-mono text-xs text-slate-400 block">{calculations.rail12V_Amps} Amps</span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calculations.rail12V_Watts / calculations.totalSystemWatts) * 100)}%` }}
                />
              </div>
            </div>

            {/* +5V and +3.3V Rails */}
            <div className="grid grid-cols-2 gap-3">
              {/* +5V */}
              <div className="bg-[#181d29] border border-white/10 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-mono font-bold text-white text-xs">+5V Rail</span>
                  </div>
                  <span className="font-mono text-red-400 font-bold text-xs">{calculations.rail5V_Watts} W</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Current:</span>
                  <span>{calculations.rail5V_Amps} A</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (calculations.rail5V_Watts / 120) * 100)}%` }}
                  />
                </div>
              </div>

              {/* +3.3V */}
              <div className="bg-[#181d29] border border-white/10 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="font-mono font-bold text-white text-xs">+3.3V Rail</span>
                  </div>
                  <span className="font-mono text-orange-400 font-bold text-xs">{calculations.rail33V_Watts} W</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Current:</span>
                  <span>{calculations.rail33V_Amps} A</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (calculations.rail33V_Watts / 100) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Transient Spike Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono text-amber-300">Transient Power Spike Warning:</strong> High-end modern GPUs can produce 10–20ms load spikes up to <span className="font-mono font-bold text-white">{calculations.peakTransientEstimate}W</span>. Always use an ATX 3.0 / PCIe 5.0 rated PSU with native 12V-2x6 / 12VHPWR cabling to prevent trip-offs.
              </div>
            </div>
          </div>

          {/* Multimeter Live Voltage Probing & Tolerance Tester */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Physical Multimeter DMM Voltage Tolerance Tester
              </h3>
              <span className="font-mono text-[11px] text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded">
                ATX Standard Table
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Measure DC voltage between rail pins and chassis Ground (GND). Type your measured readings below to test for droop, sag, or hazardous surges:
            </p>

            <div className="space-y-2.5">
              {ATX_VOLTAGE_TOLERANCES.map((spec) => {
                const evalResult = evaluateMultimeter(spec.rail);
                return (
                  <div
                    key={spec.rail}
                    className="bg-[#181d29] border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{spec.rail}</span>
                        <span className="text-[11px] font-mono text-slate-400">({spec.standardTolerance})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs" title={spec.multimeterPinLocation}>
                        Probe: {spec.multimeterPinLocation}
                      </div>
                    </div>

                    {/* Input & Evaluation Badge */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={measuredVoltages[spec.rail] || ''}
                          onChange={(e) => setMeasuredVoltages(prev => ({ ...prev, [spec.rail]: e.target.value }))}
                          placeholder="Volts"
                          className="w-20 bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-xs font-mono text-right text-white focus:border-purple-400"
                        />
                        <span className="absolute right-1 top-1 text-[10px] text-slate-500 pointer-events-none">V</span>
                      </div>

                      {/* Status Indicator */}
                      <div className="w-28 text-right">
                        {evalResult.status === 'PASS' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </span>
                        )}
                        {evalResult.status === 'WARN' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Warn
                          </span>
                        )}
                        {evalResult.status === 'FAIL' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                            <XCircle className="w-3 h-3" /> Fail!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
