import React, { useState, useRef, useEffect } from 'react';
import { MOTHERBOARD_PARTS } from '../data/motherboardData';
import { MotherboardHotspot } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Camera, RefreshCw, Layers, ShieldCheck, X } from 'lucide-react';

export const MotherboardCanvas: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<MotherboardHotspot | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customImage, setCustomImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wb_custom_board_img');
    } catch {
      return null;
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Components (12)' },
    { id: 'jumper', label: '⚡ Jumpers & Headers' },
    { id: 'power', label: '🔌 Power Delivery (VRM / ATX)' },
    { id: 'core', label: '🧠 Core & Memory' },
    { id: 'expansion', label: '⚡ PCIe & M.2 NVMe' },
    { id: 'diag', label: '🔍 Diagnostics & Q-LED' }
  ];

  const filteredHotspots = MOTHERBOARD_PARTS.filter(p => activeCategory === 'all' || p.category === activeCategory);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.hotspot-btn')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(z => Math.min(2.5, Math.max(0.5, z + delta)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomImage(result);
      localStorage.setItem('wb_custom_board_img', result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const resetDefaultPcb = () => {
    setCustomImage(null);
    localStorage.removeItem('wb_custom_board_img');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Interactive Motherboard Blueprint &amp; Jumper Guide
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                Full ATX Architecture
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Click on any labeled component or jumper pin for failure symptoms, trace analysis, and bridge recovery procedures.
            </p>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Upload Board Photo
            </button>

            {customImage && (
              <button
                onClick={resetDefaultPcb}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400"
              >
                Default Vector
              </button>
            )}

            <div className="flex items-center gap-1 bg-[#181d29] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-slate-300 px-1 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 20, y: 10 }); }}
                className="p-1.5 text-slate-400 hover:text-white"
                title="Reset Pan & Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                  : 'bg-[#181d29] border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[580px] bg-[#090b10] border border-white/10 rounded-2xl overflow-hidden cursor-grab select-none ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '1100px',
            height: '800px'
          }}
          className="relative bg-[#0d1117] transition-transform duration-75 shadow-2xl"
        >
          {customImage ? (
            <img src={customImage} alt="Custom Motherboard" className="w-full h-full object-contain pointer-events-none" />
          ) : (
            <svg viewBox="0 0 1100 800" className="w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0e131d" />
                  <stop offset="100%" stopColor="#080b11" />
                </linearGradient>
                <linearGradient id="heatsinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#242c3d" />
                  <stop offset="100%" stopColor="#141923" />
                </linearGradient>
                <pattern id="pcbGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#171d2a" strokeWidth="1" />
                </pattern>
              </defs>

              <rect x="20" y="20" width="1060" height="760" rx="16" fill="url(#pcbGrad)" stroke="#263147" strokeWidth="3" />
              <rect x="20" y="20" width="1060" height="760" fill="url(#pcbGrid)" opacity="0.4" />

              {/* Traces */}
              <g stroke="#1e293b" strokeWidth="1.5" fill="none">
                <path d="M 120 180 L 320 180 L 370 230" />
                <path d="M 120 220 L 320 220 L 380 280" />
                <path d="M 520 240 L 640 240 L 700 300" />
                <path d="M 380 480 L 380 620 L 450 690" />
              </g>

              {/* Rear IO */}
              <rect x="30" y="70" width="80" height="340" rx="6" fill="#141a24" stroke="#334155" strokeWidth="2" />
              <text x="70" y="240" fontFamily="JetBrains Mono" fontSize="11" fill="#64748b" textAnchor="middle" transform="rotate(-90 70 240)">REAR I/O PORTS</text>

              {/* Dual EPS */}
              <rect x="150" y="32" width="110" height="32" rx="4" fill="#0d1117" stroke="#f43f5e" strokeWidth="1.8" />
              <text x="205" y="52" fontFamily="JetBrains Mono" fontSize="10" fill="#f43f5e" textAnchor="middle">8+8 PIN EPS 12V</text>

              {/* VRM Heatsinks */}
              <rect x="290" y="40" width="220" height="50" rx="6" fill="url(#heatsinkGrad)" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="140" y="100" width="70" height="230" rx="6" fill="url(#heatsinkGrad)" stroke="#38bdf8" strokeWidth="1.5" />

              {/* CPU Socket */}
              <rect x="260" y="120" width="250" height="250" rx="12" fill="#101520" stroke="#f59e0b" strokeWidth="2.5" />
              <rect x="290" y="150" width="190" height="190" rx="6" fill="#090c12" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="385" y="240" fontFamily="Space Grotesk" fontSize="16" fontWeight="700" fill="#f59e0b" textAnchor="middle">CPU SOCKET</text>

              {/* 4x DDR5 Slots */}
              <g>
                <rect x="560" y="110" width="20" height="280" rx="3" fill="#1e2638" stroke="#334155" strokeWidth="1.5" />
                <rect x="590" y="110" width="20" height="280" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="620" y="110" width="20" height="280" rx="3" fill="#1e2638" stroke="#334155" strokeWidth="1.5" />
                <rect x="650" y="110" width="20" height="280" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              </g>

              {/* 24-Pin ATX */}
              <rect x="710" y="140" width="40" height="160" rx="5" fill="#090d14" stroke="#f43f5e" strokeWidth="2" />

              {/* Q-LED */}
              <rect x="710" y="80" width="45" height="45" rx="6" fill="#141a24" stroke="#10b981" strokeWidth="1.5" />

              {/* PCIe 5.0 x16 */}
              <rect x="220" y="460" width="370" height="30" rx="5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <text x="405" y="480" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#ffffff" textAnchor="middle">PCIe 5.0 x16 (GPU PRIMARY)</text>

              {/* Chipset PCH */}
              <rect x="680" y="460" width="190" height="170" rx="12" fill="url(#heatsinkGrad)" stroke="#f59e0b" strokeWidth="2" />
              <text x="775" y="540" fontFamily="Space Grotesk" fontSize="15" fontWeight="700" fill="#f59e0b" textAnchor="middle">CHIPSET (PCH)</text>

              {/* CR2032 Battery */}
              <circle cx="630" cy="650" r="32" fill="#1c2433" stroke="#e2e8f0" strokeWidth="2.5" />
              <text x="630" y="654" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#ffffff" textAnchor="middle">CR2032 3V</text>
            </svg>
          )}

          {/* Interactive Hotspot Overlay Pins */}
          {filteredHotspots.map((spot, i) => (
            <button
              key={spot.id}
              onClick={() => setSelectedHotspot(spot)}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className={`hotspot-btn absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-xl z-20 ${
                spot.category === 'jumper'
                  ? 'bg-purple-900/90 text-purple-300 border-2 border-purple-400 shadow-purple-500/30'
                  : spot.category === 'power'
                  ? 'bg-rose-900/90 text-rose-300 border-2 border-rose-400 shadow-rose-500/30'
                  : spot.category === 'diag'
                  ? 'bg-emerald-900/90 text-emerald-300 border-2 border-emerald-400 shadow-emerald-500/30'
                  : 'bg-amber-900/90 text-amber-300 border-2 border-amber-400 shadow-amber-500/30'
              } hover:scale-125`}
            >
              {spot.category === 'jumper' ? '⚡' : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal for Clicked Hotspot */}
      {selectedHotspot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {selectedHotspot.category.toUpperCase()} COMPONENT
                </span>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white mt-1">
                  {selectedHotspot.label}
                </h3>
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedHotspot.brief}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-mono text-amber-400 uppercase text-[11px] font-bold">🔧 Technical Specs</h4>
                <p className="text-slate-300">{selectedHotspot.specs}</p>
              </div>

              <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-mono text-rose-400 uppercase text-[11px] font-bold">⚠️ Failure Symptoms</h4>
                <p className="text-slate-300">{selectedHotspot.symptoms}</p>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-mono text-purple-300 uppercase text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                ⚡ Jumper Bridging &amp; Recovery Sequence
              </h4>
              <ol className="text-slate-200 space-y-1.5 pl-4 list-decimal marker:text-purple-400 font-sans">
                {selectedHotspot.jumperGuide.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedHotspot(null)}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
