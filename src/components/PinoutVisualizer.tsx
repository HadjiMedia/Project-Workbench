import React, { useState } from 'react';
import { PINOUT_DEFINITIONS } from '../data/pinoutsData';
import { PinoutDefinition } from '../types';
import { CircuitBoard, Zap, Info, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

export const PinoutVisualizer: React.FC = () => {
  const [selectedHeaderId, setSelectedHeaderId] = useState<string>(PINOUT_DEFINITIONS[0].id);
  const [activePin, setActivePin] = useState<PinoutDefinition['pins'][0] | null>(null);

  const activeHeader = PINOUT_DEFINITIONS.find(h => h.id === selectedHeaderId) || PINOUT_DEFINITIONS[0];

  const getPinFillColor = (type: string) => {
    switch (type) {
      case '12V': return '#eab308'; // Yellow
      case '5V': return '#ef4444'; // Red
      case '3.3V': return '#f97316'; // Orange
      case '5VSB': return '#a855f7'; // Purple
      case '-12V': return '#3b82f6'; // Blue
      case 'GND': return '#1e293b'; // Black/Dark slate
      case 'Signal': return '#38bdf8'; // Cyan
      case 'Sense': return '#10b981'; // Emerald
      default: return '#64748b'; // Gray
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Interactive Motherboard Header &amp; Pinout Visualizer
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400">
                Phase 3 Hardware Schematic
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Hover over individual pins on ATX 24-Pin, EPS 8-Pin, Front Panel JFP1, USB 3.0, and PCIe headers to inspect voltage rails, ground lines, and multimeter probing points.
            </p>
          </div>

          {/* Header Switcher Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PINOUT_DEFINITIONS.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setSelectedHeaderId(h.id);
                  setActivePin(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedHeaderId === h.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold shadow-sm'
                    : 'bg-[#181d29] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <CircuitBoard className="w-3.5 h-3.5" />
                {h.title.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive SVG Socket on Left, Pin Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive SVG Pinout Socket (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                  {activeHeader.category} CONNECTOR
                </span>
                <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                  {activeHeader.title}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activeHeader.pins.length} Total Pins
              </span>
            </div>

            {/* Visual SVG Layout based on Connector Type */}
            <div className="bg-[#090b10] border border-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[320px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* ATX 24-Pin Dual-Row 2x12 Layout */}
              {activeHeader.id === 'atx24' && (
                <div className="relative border-4 border-[#2d3748] rounded-xl p-4 bg-[#141a24] shadow-2xl">
                  {/* Retention Clip Notch */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-[#3a475d] rounded-t-md border-t border-x border-white/20 text-[9px] font-mono text-center text-slate-400 font-bold">
                    PLASTIC LATCH
                  </div>

                  <div className="grid grid-cols-12 gap-2.5 pt-2">
                    {/* Row 1: Pins 1 to 12 */}
                    {activeHeader.pins.slice(0, 12).map((pin) => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border-2 ${
                          activePin?.pinNumber === pin.pinNumber
                            ? 'scale-125 z-20 ring-4 ring-purple-400 border-white shadow-xl'
                            : 'border-white/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        <span>{pin.pinNumber}</span>
                      </button>
                    ))}

                    {/* Row 2: Pins 13 to 24 */}
                    {activeHeader.pins.slice(12, 24).map((pin) => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border-2 ${
                          activePin?.pinNumber === pin.pinNumber
                            ? 'scale-125 z-20 ring-4 ring-purple-400 border-white shadow-xl'
                            : 'border-white/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        <span>{pin.pinNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EPS 8-Pin / PCIe 8-Pin Dual-Row 2x4 Layout */}
              {(activeHeader.id === 'eps8' || activeHeader.id === 'pcie8') && (
                <div className="relative border-4 border-[#2d3748] rounded-xl p-5 bg-[#141a24] shadow-2xl">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#3a475d] rounded-t-md border-t border-x border-white/20 text-[8px] font-mono text-center text-slate-400 font-bold">
                    LATCH
                  </div>
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {activeHeader.pins.slice(0, 4).map((pin) => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-mono font-bold transition-all border-2 ${
                          activePin?.pinNumber === pin.pinNumber
                            ? 'scale-125 z-20 ring-4 ring-purple-400 border-white shadow-xl'
                            : 'border-white/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        <span>{pin.pinNumber}</span>
                      </button>
                    ))}
                    {activeHeader.pins.slice(4, 8).map((pin) => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-mono font-bold transition-all border-2 ${
                          activePin?.pinNumber === pin.pinNumber
                            ? 'scale-125 z-20 ring-4 ring-purple-400 border-white shadow-xl'
                            : 'border-white/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        <span>{pin.pinNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Front Panel JFP1 Layout (9 pins) */}
              {activeHeader.id === 'jfp1' && (
                <div className="border-4 border-[#2d3748] rounded-xl p-6 bg-[#141a24] shadow-2xl">
                  <div className="grid grid-cols-5 gap-3">
                    {/* Top row: Pins 2, 4, 6, 8, Empty */}
                    {[2, 4, 6, 8].map(num => {
                      const pin = activeHeader.pins.find(p => p.pinNumber === num);
                      if (!pin) return null;
                      return (
                        <button
                          key={pin.pinNumber}
                          onMouseEnter={() => setActivePin(pin)}
                          onClick={() => setActivePin(pin)}
                          className={`w-11 h-11 rounded-full flex flex-col items-center justify-center text-xs font-mono font-bold transition-all border-2 ${
                            activePin?.pinNumber === pin.pinNumber ? 'scale-125 ring-4 ring-purple-400 border-white' : 'border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                        >
                          {pin.pinNumber}
                        </button>
                      );
                    })}
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-600">
                      KEY
                    </div>

                    {/* Bottom row: Pins 1, 3, 5, 7, 9 */}
                    {[1, 3, 5, 7, 9].map(num => {
                      const pin = activeHeader.pins.find(p => p.pinNumber === num);
                      if (!pin) return null;
                      return (
                        <button
                          key={pin.pinNumber}
                          onMouseEnter={() => setActivePin(pin)}
                          onClick={() => setActivePin(pin)}
                          className={`w-11 h-11 rounded-full flex flex-col items-center justify-center text-xs font-mono font-bold transition-all border-2 ${
                            activePin?.pinNumber === pin.pinNumber ? 'scale-125 ring-4 ring-purple-400 border-white' : 'border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                        >
                          {pin.pinNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* USB 3.0 (19-Pin) */}
              {activeHeader.id === 'usb3_19pin' && (
                <div className="border-4 border-[#2d3748] rounded-xl p-5 bg-[#141a24] shadow-2xl">
                  <div className="grid grid-cols-10 gap-2 pt-2">
                    {activeHeader.pins.slice(0, 10).map(pin => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-8 h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                          activePin?.pinNumber === pin.pinNumber ? 'scale-125 ring-2 ring-purple-400 border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        {pin.pinNumber}
                      </button>
                    ))}
                    {activeHeader.pins.slice(10, 19).map(pin => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-8 h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                          activePin?.pinNumber === pin.pinNumber ? 'scale-125 ring-2 ring-purple-400 border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        {pin.pinNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PWM 4-Pin Fan */}
              {activeHeader.id === 'pwm_fan' && (
                <div className="border-4 border-[#2d3748] rounded-xl p-6 bg-[#141a24] shadow-2xl">
                  <div className="flex gap-4">
                    {activeHeader.pins.map(pin => (
                      <button
                        key={pin.pinNumber}
                        onMouseEnter={() => setActivePin(pin)}
                        onClick={() => setActivePin(pin)}
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-mono font-bold transition-all border-2 ${
                          activePin?.pinNumber === pin.pinNumber ? 'scale-125 ring-4 ring-purple-400 border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: getPinFillColor(pin.type), color: pin.type === 'GND' ? '#ffffff' : '#000000' }}
                      >
                        {pin.pinNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wire Color Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> +12V</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> +5V</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> +3.3V</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /> +5VSB</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> -12V</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] border border-white/20" /> GND</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /> Signal</span>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Pin Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activePin ? (
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    PIN #{activePin.pinNumber}
                  </span>
                  <h3 className="text-lg font-bold font-mono text-white">
                    {activePin.pinName}
                  </h3>
                </div>
                <span
                  className="font-mono text-xs px-3 py-1 rounded-full font-bold"
                  style={{ backgroundColor: getPinFillColor(activePin.type), color: activePin.type === 'GND' ? '#ffffff' : '#000000' }}
                >
                  {activePin.type}
                </span>
              </div>

              {/* Expected Voltage & Multimeter Readout */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-[#181d29] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">NOMINAL VOLTAGE</span>
                  <div className="text-white font-bold text-sm">{activePin.voltage}</div>
                </div>
                <div className="bg-[#181d29] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">EXPECTED DMM READING</span>
                  <div className="text-emerald-400 font-bold text-xs">{activePin.expectedDmm}</div>
                </div>
              </div>

              {/* Pin Function Description */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase">SIGNAL PATH &amp; PURPOSE</span>
                <p className="text-slate-200 bg-[#181d29] p-3 rounded-xl border border-white/5 leading-relaxed">
                  {activePin.description}
                </p>
              </div>

              {/* Probing Safety Guidance */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3.5 space-y-1.5 text-xs text-purple-200">
                <span className="font-mono font-bold text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Workbench Probing Rule
                </span>
                <p className="text-[11px] leading-relaxed">
                  {activeHeader.probingSafety}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <CircuitBoard className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white font-mono">Select or Hover Over Any Pin</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click or hover over any individual pin on the left schematic to inspect voltage rail tolerances, signal directions, and multimeter probing instructions.
              </p>
            </div>
          )}

          {/* Full Pin List Table */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-mono uppercase text-slate-400">Complete Pinout Table</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
              {activeHeader.pins.map(pin => (
                <div
                  key={pin.pinNumber}
                  onMouseEnter={() => setActivePin(pin)}
                  onClick={() => setActivePin(pin)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activePin?.pinNumber === pin.pinNumber
                      ? 'bg-purple-500/15 border-purple-500/40 text-white'
                      : 'bg-[#181d29] border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-slate-400">#{pin.pinNumber}</span>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getPinFillColor(pin.type) }} />
                    <span className="font-bold">{pin.pinName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{pin.voltage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
