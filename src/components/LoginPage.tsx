import React, { useState, useEffect } from 'react';
import { User, UserRole, SecurityAuditLog } from '../types';
import { getClientIp } from '../data/usersData';
import { 
  ShieldCheck, Terminal, Zap, FileCode2, ClipboardList, 
  FileText, CircuitBoard, Cable, LayoutGrid, BookOpen, 
  Keyboard, Bookmark, Globe, Wifi, WifiOff, Sparkles, 
  LogIn, UserPlus, AlertTriangle, CheckCircle2, ArrowRight, 
  Eye, Lock, KeyRound, Cpu, Layers, Check, Monitor, Wrench
} from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSubmit: (newUser: User, auditLog: SecurityAuditLog) => void;
  isOnline: boolean;
}

type PreviewTab = 'errors' | 'cheatsheets' | 'subnet' | 'pinouts' | 'ticketing' | 'serial';

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLoginSuccess,
  onRegisterSubmit,
  isOnline
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activePreview, setActivePreview] = useState<PreviewTab>('errors');
  const [detectedIp, setDetectedIp] = useState<string>('Detecting IP...');
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCallsign, setRegCallsign] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('bench_tech');
  const [regPassword, setRegPassword] = useState('');
  const [regNotes, setRegNotes] = useState('');

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getClientIp().then(ip => setDetectedIp(ip));
  }, []);

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetUser = users.find(u => 
      (u.email.toLowerCase() === loginIdentifier.toLowerCase().trim() ||
       u.techCallsign.toLowerCase() === loginIdentifier.toLowerCase().trim()) &&
      u.passwordHash === loginPassword
    );

    if (!targetUser) {
      setErrorMsg('Invalid email/callsign or password.');
      return;
    }

    if (targetUser.status === 'pending') {
      setErrorMsg(`Account status: PENDING ADMIN APPROVAL. Your registered IP (${targetUser.registeredIp}) is logged. Please await Administrator approval.`);
      return;
    }

    if (targetUser.status === 'suspended') {
      setErrorMsg('Account has been SUSPENDED by Lab Administrator. Access denied.');
      return;
    }

    if (targetUser.status === 'rejected') {
      setErrorMsg('Registration request was REJECTED by Lab Administrator.');
      return;
    }

    // Success login
    const updatedUser: User = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: detectedIp
    };

    setSuccessMsg(`Welcome, ${targetUser.fullName}! Initializing Workbench console...`);
    setTimeout(() => {
      onLoginSuccess(updatedUser);
    }, 400);
  };

  // Handle Register Submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (users.some(u => u.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      setErrorMsg('An account with this email address already exists.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      email: regEmail.trim(),
      fullName: regFullName.trim(),
      techCallsign: regCallsign.trim() || `TECH-${Math.floor(100 + Math.random() * 900)}`,
      role: regRole,
      status: 'pending',
      passwordHash: regPassword,
      registeredAt: new Date().toISOString(),
      registeredIp: detectedIp,
      notes: regNotes.trim() || 'Self-registered technician via portal'
    };

    const newAuditLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'USER_REGISTER_REQUEST',
      ip: detectedIp,
      userAgent: navigator.userAgent,
      details: `New technician registration for ${newUser.fullName} (${newUser.role}) from IP ${detectedIp}`,
      severity: 'info'
    };

    onRegisterSubmit(newUser, newAuditLog);
    setSuccessMsg('Registration request submitted! Status: PENDING ADMIN APPROVAL. An Administrator can now verify your client IP and activate your account.');
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMsg('');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#090c12] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#12161f]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 font-['Space_Grotesk'] text-xl">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
                  Workbench
                </h1>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                  AUTH GATE · SECURE CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-400">Technical Hardware &amp; Software Diagnostics Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181d29] border border-white/10 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>IP: <strong className="text-teal-300">{detectedIp}</strong></span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Network Active' : 'Offline Mode'}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area: Split View (Auth Card + Interactive Feature Showcase) */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* LEFT COLUMN: AUTHENTICATION / REGISTER FORM (5 Cols) */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col justify-center">
          <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                  Technician Sign In
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authentication is required to access diagnostics tools, job tickets, and hardware schematics.
              </p>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold ${
                  authMode === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold ${
                  authMode === 'register'
                    ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Register Tech
              </button>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                    Email or Callsign
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. admin@workbench.local or LEAD-OPS-01"
                      className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <ShieldCheck className="w-4 h-4" /> Authenticate &amp; Launch Console
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Tech Callsign</label>
                    <input
                      type="text"
                      value={regCallsign}
                      onChange={e => setRegCallsign(e.target.value)}
                      placeholder="BENCH-09"
                      className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="tech@lab.com"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Requested Role</label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    >
                      <option value="bench_tech">Bench Tech</option>
                      <option value="lead_tech">Lead Tech</option>
                      <option value="trainee">Junior Trainee</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="4+ characters"
                      className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Specialties &amp; Notes</label>
                  <input
                    type="text"
                    value={regNotes}
                    onChange={e => setRegNotes(e.target.value)}
                    placeholder="e.g. BIOS flashing, Micro-soldering"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 leading-relaxed">
                  🛡️ Note: All registrations require manual approval in the Admin Command Center. Your client IP (<span className="font-bold text-white">{detectedIp}</span>) is recorded.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-mono font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg shadow-sky-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <UserPlus className="w-4 h-4" /> Submit Application
                </button>
              </form>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FEATURE PREVIEW SHOWCASE (7 Cols) */}
        <div className="flex-1 flex flex-col justify-between bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
          
          {/* Showcase Header & Tab Switcher */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
                  <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                    Workbench System Live Preview
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    Interactive Showcase
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explore available diagnostics, calculation engines, and schematics included in this suite.
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181d29] border border-white/10 text-xs font-mono text-amber-300 shrink-0">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign in for Full Console</span>
              </div>
            </div>

            {/* Feature Selector Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
              {[
                { id: 'errors' as PreviewTab, label: 'Error Matrix', icon: Terminal },
                { id: 'cheatsheets' as PreviewTab, label: 'Cheat Sheets', icon: Bookmark },
                { id: 'subnet' as PreviewTab, label: 'Subnet & Beep Tool', icon: Wrench },
                { id: 'pinouts' as PreviewTab, label: 'ATX Pinouts', icon: CircuitBoard },
                { id: 'ticketing' as PreviewTab, label: 'Intake & Invoices', icon: ClipboardList },
                { id: 'serial' as PreviewTab, label: 'Web Serial POST', icon: Cable }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activePreview === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreview(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="flex-1 bg-[#0b0e14] rounded-2xl border border-white/10 p-5 font-mono relative overflow-hidden">
            
            {/* PREVIEW 1: ERROR MATRIX */}
            {activePreview === 'errors' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <Terminal className="w-4 h-4" />
                    <span>Windows Hex Code &amp; BSOD Matrix</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                    25+ Error Hex Decoders
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#12161f] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">0x80070002</span>
                      <span className="text-[10px] text-slate-500">ERROR_FILE_NOT_FOUND</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">System cannot find file specified during Windows Update or image mounting.</p>
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                      💡 Fix: Purge SoftwareDistribution cache &amp; run SFC /scannow
                    </div>
                  </div>

                  <div className="bg-[#12161f] p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold">0x0000007E</span>
                      <span className="text-[10px] text-slate-500">SYSTEM_THREAD_EXCEPTION</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">System thread generated an unhandled kernel-mode exception (often GPU/audio driver).</p>
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                      💡 Fix: Safe Mode DDU driver wipe &amp; memory test
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                  <span>Includes 1-click batch script compilation &amp; DISM fix generation.</span>
                  <span className="text-amber-400 font-bold">Sign In to Use ➔</span>
                </div>
              </div>
            )}

            {/* PREVIEW 2: CHEAT SHEETS */}
            {activePreview === 'cheatsheets' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Bookmark className="w-4 h-4" />
                    <span>Printable Desk Cheat Sheets &amp; EZ Debug LEDs</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                    PDF &amp; Print Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-white font-bold">ASUS ROG / TUF</div>
                    <div className="text-[10px] text-amber-300">BIOS: Del or F2</div>
                    <div className="text-[10px] text-sky-300">Boot Menu: F8</div>
                  </div>

                  <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-white font-bold">Dell / Alienware</div>
                    <div className="text-[10px] text-amber-300">BIOS: F2</div>
                    <div className="text-[10px] text-sky-300">Boot Menu: F12 (ePSA)</div>
                  </div>

                  <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-white font-bold">Apple Mac</div>
                    <div className="text-[10px] text-purple-300">Recovery: Cmd + R</div>
                    <div className="text-[10px] text-teal-300">Hardware Test: Hold D</div>
                  </div>
                </div>

                {/* EZ Debug LED Preview */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">CPU (Red)</div>
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">DRAM (Yellow)</div>
                  <div className="p-2 rounded-xl bg-slate-200/20 border border-white/40 text-white">VGA (White)</div>
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">BOOT (Green)</div>
                </div>
              </div>
            )}

            {/* PREVIEW 3: SUBNET & BEEP TOOL */}
            {activePreview === 'subnet' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                    <Wrench className="w-4 h-4" />
                    <span>IPv4 Subnet Calculator &amp; Web Audio Beep Synthesizer</span>
                  </div>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/40">
                    Web Audio API
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Subnet Preview (192.168.1.0/24)</span>
                    <div className="text-white font-bold">Mask: 255.255.255.0</div>
                    <div className="text-[10px] text-emerald-400">Usable Hosts: 254 (192.168.1.1 - 254)</div>
                  </div>

                  <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">BIOS Beep Sound Generator</span>
                    <div className="text-amber-300 font-bold">1 Long + 2 Short Beeps</div>
                    <div className="text-[10px] text-slate-400">Synthesizes 880Hz square wave GPU fault</div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#181d29] rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  <span>Real-time DNS ping benchmark (Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9)</span>
                </div>
              </div>
            )}

            {/* PREVIEW 4: PINOUTS */}
            {activePreview === 'pinouts' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <CircuitBoard className="w-4 h-4" />
                    <span>Interactive 24-Pin ATX &amp; JFP1 Schematics</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40">
                    Wire Color &amp; Tolerances
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    <div className="font-bold">+12V Rail</div>
                    <div className="text-[10px] text-slate-400">11.4V - 12.6V</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
                    <div className="font-bold">+5V Rail</div>
                    <div className="text-[10px] text-slate-400">4.75V - 5.25V</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300">
                    <div className="font-bold">+3.3V Rail</div>
                    <div className="text-[10px] text-slate-400">3.14V - 3.47V</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                    <div className="font-bold">+5VSB Standby</div>
                    <div className="text-[10px] text-slate-400">Pin 9 Purple</div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#181d29] rounded-xl text-[11px] text-slate-300">
                  🔧 Includes interactive front panel 9-pin JFP1 jumper jump-start guide for screwdriver testing.
                </div>
              </div>
            )}

            {/* PREVIEW 5: TICKETING & INVOICES */}
            {activePreview === 'ticketing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ClipboardList className="w-4 h-4" />
                    <span>Job Ticketing, Customer Intake &amp; PDF Invoicing</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                    Full-Cycle Shop Workflow
                  </span>
                </div>

                <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Ticket #TKT-8842: Custom Liquid Loop Overheat</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">IN PROGRESS</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Customer: Liam Vance · Hardware: Ryzen 9 7950X3D + RTX 4090</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                    <span className="text-slate-400">Diagnostic Checklist: 4/5 Complete</span>
                    <span className="text-emerald-400 font-bold">Estimated: $285.00</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#181d29] rounded-xl text-[11px] text-slate-300 flex items-center justify-between">
                  <span>1-Click transfer from Job Ticket straight into Printable Itemized Work Orders &amp; Invoices.</span>
                </div>
              </div>
            )}

            {/* PREVIEW 6: SERIAL POST */}
            {activePreview === 'serial' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Cable className="w-4 h-4" />
                    <span>Web Serial POST &amp; Hardware Sensor Monitor</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40">
                    navigator.serial
                  </span>
                </div>

                <div className="bg-[#12161f] p-3 rounded-xl border border-white/5 font-mono text-[11px] space-y-1 text-emerald-400">
                  <div>[POST 00:00:01] AMI UEFI Core V5.22 Initializing...</div>
                  <div>[POST 00:00:02] CPU Socket LGA1718 OK · Microcode 0x12B Applied</div>
                  <div>[POST 00:00:03] DDR5 Memory Training Slot A2/B2 6000MT/s EXPO-I OK</div>
                  <div className="text-slate-500">[POST 00:00:04] Serial baud rate: 115200 8-N-1</div>
                </div>

                <div className="p-2.5 bg-[#181d29] rounded-xl text-[11px] text-slate-300">
                  Live serial streaming directly from Arduino, ESP32, Raspberry Pi Pico, or motherboard debug UART.
                </div>
              </div>
            )}

          </div>

          {/* Bottom Security / System Trust Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Client IP Telemetry Log</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Offline Field Cache PWA</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>AES-256 Technician Vault</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs font-mono text-slate-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workbench Diagnostics &amp; Software Repair Suite · Secured Technician Portal</span>
          <span>Role-Based Access Control · Client IP Verification · Offline Encrypted Storage</span>
        </div>
      </footer>

    </div>
  );
};
