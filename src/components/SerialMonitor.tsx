import React, { useState, useEffect, useRef } from 'react';
import { SerialLogEntry } from '../types';
import { POST_CODES, PostCodeEntry } from '../data/postCodesData';
import { 
  Cable, Play, Square, Download, Trash2, Send, Cpu, 
  Activity, AlertTriangle, CheckCircle2, Terminal, RefreshCw, Radio
} from 'lucide-react';

export const SerialMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [logs, setLogs] = useState<SerialLogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'ascii' | 'hex'>('ascii');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [detectedPostCode, setDetectedPostCode] = useState<PostCodeEntry | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const simIntervalRef = useRef<any>(null);

  const hasWebSerial = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Parse incoming text for 2-digit hex POST codes
  const parsePostCodes = (text: string): PostCodeEntry | undefined => {
    // Regex for patterns like POST: 55, 0x15, CODE: A2, [d6]
    const hexMatch = text.match(/\b(0x)?([0-9A-Fa-f]{2})\b/);
    if (hexMatch) {
      const rawCode = hexMatch[2].toUpperCase();
      if (POST_CODES[rawCode] || POST_CODES[hexMatch[2].toLowerCase()]) {
        return POST_CODES[rawCode] || POST_CODES[hexMatch[2].toLowerCase()];
      }
    }
    return undefined;
  };

  // Append a log entry
  const appendLog = (type: SerialLogEntry['type'], data: string) => {
    const postMatch = parsePostCodes(data);
    if (postMatch) {
      setDetectedPostCode(postMatch);
    }

    const newEntry: SerialLogEntry = {
      id: 'log_' + Date.now() + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      type,
      data,
      postCodeMatch: postMatch
    };

    setLogs(prev => [...prev.slice(-300), newEntry]);
  };

  // Connect via Web Serial API
  const handleConnectSerial = async () => {
    if (!hasWebSerial) {
      alert('Web Serial API is not supported in this browser. Use Chrome or Edge, or try the Hardware Simulator Mode.');
      return;
    }

    try {
      // Prompt user to select COM / Serial port
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate });
      portRef.current = port;
      setIsConnected(true);
      appendLog('system', `Connected to serial port at ${baudRate} baud.`);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      readLoop(reader);
    } catch (err: any) {
      console.error('Serial connection error:', err);
      appendLog('error', `Connection failed: ${err.message || err}`);
    }
  };

  // Read loop
  const readLoop = async (reader: any) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          appendLog('rx', value);
        }
      }
    } catch (err: any) {
      appendLog('error', `Stream read error: ${err.message}`);
    } finally {
      setIsConnected(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (e) {
      console.error(e);
    }
    setIsConnected(false);
    appendLog('system', 'Serial port disconnected.');
  };

  // Hardware Simulation Mode (POST Card / Arduino Test Rig)
  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      appendLog('system', 'Hardware simulation stopped.');
    } else {
      setIsSimulating(true);
      appendLog('system', 'Hardware test jig simulation started (UEFI POST & Sensor stream)...');
      
      const simSequence = [
        'POST: 00 [SEC Phase - CPU Initialization]',
        'POST: 15 [PEI Phase - DDR5 Memory Training Slot A2/B2]',
        'SENSOR: VRM Vcore=1.24V | Temp=42.5C | Fan=1240 RPM',
        'POST: 55 [DRAM Channel B Verified]',
        'POST: 62 [DXE Phase - Southbridge PCH Runtime Services]',
        'POST: 99 [DXE Phase - Super I/O & PCIe Device Detection]',
        'SENSOR: +12V Rail=12.14V | +5V Rail=5.02V | +3.3V=3.31V',
        'POST: A2 [BDS Phase - NVMe Gen 5 SSD Controller Handshake]',
        'POST: A9 [Entering UEFI Setup Utility]',
        'POST: AA [System transitioned to ACPI OS Boot Mode]'
      ];

      let step = 0;
      simIntervalRef.current = setInterval(() => {
        if (step < simSequence.length) {
          appendLog('rx', simSequence[step]);
          step++;
        } else {
          // Periodic sensor stream
          const temp = (38 + Math.random() * 8).toFixed(1);
          const v12 = (12.08 + (Math.random() * 0.08 - 0.04)).toFixed(2);
          appendLog('rx', `SENSOR_TELEMETRY: CPU_Tdie=${temp}°C | V_12V=${v12}V | STATUS=OK | POST=AA`);
        }
      }, 1500);
    }
  };

  // Send command
  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    appendLog('tx', commandInput.trim());

    if (isConnected && portRef.current && portRef.current.writable) {
      try {
        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(portRef.current.writable);
        const writer = textEncoder.writable.getWriter();
        await writer.write(commandInput.trim() + '\r\n');
        writer.releaseLock();
      } catch (err: any) {
        appendLog('error', `Write error: ${err.message}`);
      }
    } else if (isSimulating) {
      if (commandInput.toLowerCase().includes('help')) {
        setTimeout(() => appendLog('rx', 'BENCH_SIM COMMANDS: HELP, STATUS, RESET_POST, GET_VOLTAGES'), 300);
      } else if (commandInput.toLowerCase().includes('volt')) {
        setTimeout(() => appendLog('rx', 'DMM_PROBE: +12V=12.12V, +5V=5.04V, +3.3V=3.32V, +5VSB=5.08V (PASS)'), 300);
      } else {
        setTimeout(() => appendLog('rx', `ACK: Received command '${commandInput}'`), 300);
      }
    }

    setCommandInput('');
  };

  // Export Log
  const handleDownloadLog = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.data}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial_post_log_${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Hex representation helper
  const toHexDump = (str: string) => {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected || isSimulating ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-rose-500'}`} />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Web Serial POST &amp; Hardware Sensor Stream
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 text-teal-400">
                Phase 3 Web Serial API
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Connect external POST diagnostic cards, UART serial debuggers, or Arduino/ESP32 test rigs directly via <code className="text-teal-300 font-mono">navigator.serial</code>.
            </p>
          </div>

          {/* Connection Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Baud Rate Selector */}
            <select
              value={baudRate}
              disabled={isConnected}
              onChange={(e) => setBaudRate(parseInt(e.target.value))}
              className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
            >
              {[9600, 19200, 38400, 57600, 115200, 230400, 921600].map(b => (
                <option key={b} value={b}>{b} Baud</option>
              ))}
            </select>

            {hasWebSerial ? (
              isConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                >
                  <Square className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectSerial}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Cable className="w-3.5 h-3.5" /> Connect Device
                </button>
              )
            ) : null}

            {/* Simulation Button */}
            <button
              onClick={toggleSimulation}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
                isSimulating
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              {isSimulating ? 'Stop Simulator' : 'Test Rig Simulator'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Real-Time Stream on Left, Live POST Code Decoder on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Serial Console Terminal (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-[#0b0e14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 font-bold">
                  {isConnected ? `COM Port Live @ ${baudRate} 8-N-1` : isSimulating ? 'Hardware Simulator Stream' : 'Console Idle'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10">
                  <button
                    onClick={() => setViewMode('ascii')}
                    className={`px-2 py-0.5 text-[10px] rounded ${viewMode === 'ascii' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    ASCII
                  </button>
                  <button
                    onClick={() => setViewMode('hex')}
                    className={`px-2 py-0.5 text-[10px] rounded ${viewMode === 'hex' ? 'bg-sky-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    HEX
                  </button>
                </div>

                <button
                  onClick={() => setShowTimestamps(v => !v)}
                  className={`px-2 py-0.5 text-[10px] rounded border ${showTimestamps ? 'bg-white/10 text-white border-white/20' : 'text-slate-500 border-white/5'}`}
                >
                  Time
                </button>

                <button
                  onClick={() => setLogs([])}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Clear Console"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDownloadLog}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Save Log"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 select-text">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <Cable className="w-8 h-8 opacity-40" />
                  <p>No serial stream active.</p>
                  <p className="text-[11px] text-slate-500">Click &quot;Connect Device&quot; to open a COM port or click &quot;Test Rig Simulator&quot; to test.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 leading-relaxed ${
                      log.type === 'error'
                        ? 'text-rose-400 bg-rose-500/10 px-2 py-1 rounded'
                        : log.type === 'system'
                        ? 'text-amber-400 font-semibold'
                        : log.type === 'tx'
                        ? 'text-sky-300'
                        : log.postCodeMatch
                        ? 'text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20'
                        : 'text-slate-300'
                    }`}
                  >
                    {showTimestamps && (
                      <span className="text-slate-500 text-[10px] select-none shrink-0">
                        [{log.timestamp}]
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase select-none opacity-60 w-8 shrink-0">
                      {log.type === 'rx' ? 'RX<' : log.type === 'tx' ? 'TX>' : 'SYS'}
                    </span>
                    <span className="break-all whitespace-pre-wrap">
                      {viewMode === 'hex' ? toHexDump(log.data) : log.data}
                    </span>
                    {log.postCodeMatch && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 ml-auto shrink-0 select-none">
                        POST {log.postCodeMatch.code}
                      </span>
                    )}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Bar */}
            <form onSubmit={handleSendCommand} className="flex items-center gap-2 p-2.5 bg-white/[0.02] border-t border-white/10">
              <input
                type="text"
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                placeholder="Send AT/ASCII command to connected microcontroller (e.g. GET_VOLTAGES, RESET)..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Live POST Code Decoder & Hardware Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active POST Code Card */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                Live POST Code Analyzer
              </span>
              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                AMI / UEFI
              </span>
            </h3>

            {detectedPostCode ? (
              <div className="bg-[#181d29] border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-mono font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/50">
                    {detectedPostCode.code}
                  </span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {detectedPostCode.phase} Phase
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400">Description:</h4>
                  <p className="text-sm font-bold text-white mt-0.5">{detectedPostCode.description}</p>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs text-slate-300">
                  <span className="text-amber-400 font-mono text-[10px] block mb-0.5 uppercase font-bold">Diagnostic Guidance:</span>
                  {detectedPostCode.troubleshooting}
                </div>
              </div>
            ) : (
              <div className="bg-[#181d29]/50 border border-white/5 rounded-xl p-6 text-center text-xs text-slate-400 space-y-2">
                <p>Waiting for POST debug signals...</p>
                <p className="text-[11px] text-slate-500">Incoming two-digit hex codes (e.g. 15, 55, 99, A2, AA) will be decoded live here.</p>
              </div>
            )}
          </div>

          {/* Quick POST Code Reference Matrix */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400">Common POST Code Reference</h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Object.values(POST_CODES).map((p) => (
                <div
                  key={p.code}
                  onClick={() => setDetectedPostCode(p)}
                  className="bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-amber-500/40 rounded-xl p-2.5 transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs w-6">{p.code}</span>
                    <span className="text-xs text-slate-200 truncate max-w-[170px]">{p.description}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{p.phase}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
