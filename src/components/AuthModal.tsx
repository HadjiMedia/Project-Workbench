import React, { useState, useEffect } from 'react';
import { User, UserRole, SecurityAuditLog } from '../types';
import { getClientIp } from '../data/usersData';
import { 
  User as UserIcon, Lock, KeyRound, ShieldCheck, 
  CheckCircle2, AlertTriangle, Globe, Clock, UserPlus, LogIn, Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSubmit: (newUser: User, auditLog: SecurityAuditLog) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
  onRegisterSubmit
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCallsign, setRegCallsign] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('bench_tech');
  const [regPassword, setRegPassword] = useState('');
  const [regNotes, setRegNotes] = useState('');

  // Client IP & Environment Detection
  const [detectedIp, setDetectedIp] = useState<string>('Detecting IP...');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      getClientIp().then(ip => setDetectedIp(ip));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
      setErrorMsg(`Account status: PENDING APPROVAL. Your registered IP (${targetUser.registeredIp}) is logged. Please await Administrator approval.`);
      return;
    }

    if (targetUser.status === 'suspended') {
      setErrorMsg('Account has been SUSPENDED by Lab Administrator. Contact supervisor.');
      return;
    }

    if (targetUser.status === 'rejected') {
      setErrorMsg('Registration request was REJECTED by Lab Administrator.');
      return;
    }

    // Success
    const updatedUser: User = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: detectedIp
    };

    onLoginSuccess(updatedUser);
    setSuccessMsg(`Welcome back, ${targetUser.fullName}! (${targetUser.role.toUpperCase()})`);
    setTimeout(() => onClose(), 800);
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check duplicate email
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
      status: 'pending', // Requires admin approval!
      passwordHash: regPassword,
      registeredAt: new Date().toISOString(),
      registeredIp: detectedIp,
      notes: regNotes.trim() || 'Technician self-registration form.'
    };

    const newAuditLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'USER_REGISTER_REQUEST',
      ip: detectedIp,
      userAgent: navigator.userAgent,
      details: `New ${newUser.role} user registration submitted from IP ${detectedIp}. Pending approval.`,
      severity: 'info'
    };

    onRegisterSubmit(newUser, newAuditLog);
    setSuccessMsg('Registration submitted! Status: PENDING ADMIN APPROVAL. An Administrator can now review and activate your account.');
    setTimeout(() => {
      setTab('login');
      setSuccessMsg('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center font-['Space_Grotesk'] text-base">
              W
            </div>
            <div>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                Workbench Technician Portal
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Authentication &amp; Role-Based Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* IP Detector Banner */}
        <div className="bg-[#181d29] border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Detected Client IP:</span>
          </div>
          <span className="text-teal-300 font-bold">{detectedIp}</span>
        </div>

        {/* Tab Toggle (Sign In vs Register) */}
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login' ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register' ? 'bg-sky-400 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Register Technician
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Email or Tech Callsign</label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="e.g. admin@workbench.local or LEAD-OPS-01"
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Authenticate &amp; Access Suite
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Tech Callsign / ID</label>
                <input
                  type="text"
                  value={regCallsign}
                  onChange={e => setRegCallsign(e.target.value)}
                  placeholder="BENCH-08"
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Work Email Address *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="tech@service.com"
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
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
                  placeholder="Password (4+ chars)"
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Technician Notes / Specialties</label>
              <input
                type="text"
                value={regNotes}
                onChange={e => setRegNotes(e.target.value)}
                placeholder="e.g. Micro-soldering, BIOS flashing, OS recovery"
                className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              ℹ️ Notice: All new registrations require manual approval by the Lab Administrator. Your IP (<span className="font-bold text-white">{detectedIp}</span>) will be attached to your profile.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-mono font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg shadow-sky-400/20 transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Submit Registration for Approval
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
