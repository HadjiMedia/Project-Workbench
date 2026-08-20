import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onLock: () => void;
}

type ModalView = 'unlock' | 'setup' | 'change' | 'reset' | 'status';

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlockSuccess,
  onLock
}) => {
  const [savedPinHash, setSavedPinHash] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wb_vault_pin_hash');
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<ModalView>('unlock');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const simpleHash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return 'v_' + h.toString(36);
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      const hash = localStorage.getItem('wb_vault_pin_hash');
      setSavedPinHash(hash);

      if (!hash) {
        setView('setup');
      } else if (isUnlocked) {
        setView('status');
      } else {
        setView('unlock');
      }
    }
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  // Initial PIN Setup
  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPinInput.length < 4) {
      setErrorMsg('PIN must be at least 4 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setErrorMsg('PINs do not match.');
      return;
    }

    const hash = simpleHash(newPinInput);
    localStorage.setItem('wb_vault_pin_hash', hash);
    setSavedPinHash(hash);
    onUnlockSuccess();
    setSuccessMsg('Master Vault PIN created & unlocked!');
    setTimeout(() => onClose(), 1200);
  };

  // Unlock Vault
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!savedPinHash) {
      setView('setup');
      return;
    }

    if (simpleHash(currentPinInput) === savedPinHash) {
      onUnlockSuccess();
      setSuccessMsg('Vault unlocked successfully!');
      setTimeout(() => onClose(), 900);
    } else {
      setErrorMsg('Incorrect PIN. Access denied.');
    }
  };

  // Change PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (savedPinHash && simpleHash(currentPinInput) !== savedPinHash) {
      setErrorMsg('Current PIN is incorrect.');
      return;
    }

    if (newPinInput.length < 4) {
      setErrorMsg('New PIN must be at least 4 digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setErrorMsg('New PIN confirmation does not match.');
      return;
    }

    const newHash = simpleHash(newPinInput);
    localStorage.setItem('wb_vault_pin_hash', newHash);
    setSavedPinHash(newHash);
    setSuccessMsg('Master Vault PIN updated successfully!');
    setTimeout(() => {
      onUnlockSuccess();
      setView('status');
    }, 1200);
  };

  // Reset PIN
  const handleResetPin = () => {
    if (confirm('Are you sure you want to reset the Vault PIN? All restricted guides will remain locked until a new PIN is created.')) {
      localStorage.removeItem('wb_vault_pin_hash');
      setSavedPinHash(null);
      onLock();
      setView('setup');
      setSuccessMsg('Vault PIN reset. Please create a new PIN.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 mx-auto flex items-center justify-center text-xl">
          {view === 'status' ? <Unlock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
            {view === 'setup' && 'Create Master Vault PIN'}
            {view === 'unlock' && 'Unlock Restricted Vault'}
            {view === 'change' && 'Change Master Vault PIN'}
            {view === 'status' && 'Vault is Unlocked'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {view === 'setup' && 'Set a security PIN (4+ digits) to protect sensitive technician repair manuals and internal notes.'}
            {view === 'unlock' && 'Enter your technician security PIN to access restricted documentation.'}
            {view === 'change' && 'Verify your current PIN and enter a new master security PIN.'}
            {view === 'status' && 'Restricted knowledge base procedures and security notes are currently accessible.'}
          </p>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        {/* VIEW 1: UNLOCK FORM */}
        {view === 'unlock' && (
          <form onSubmit={handleUnlock} className="space-y-3 pt-1">
            <input
              type="password"
              autoFocus
              value={currentPinInput}
              onChange={e => setCurrentPinInput(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-lg font-mono text-white tracking-widest focus:border-purple-400"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20"
              >
                Unlock
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/5">
              <button
                type="button"
                onClick={() => setView('change')}
                className="text-purple-400 hover:underline"
              >
                Change PIN
              </button>
              <button
                type="button"
                onClick={handleResetPin}
                className="text-rose-400 hover:underline"
              >
                Forgot / Reset PIN
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: SETUP INITIAL PIN */}
        {view === 'setup' && (
          <form onSubmit={handleSetup} className="space-y-3 pt-1">
            <input
              type="password"
              autoFocus
              value={newPinInput}
              onChange={e => setNewPinInput(e.target.value)}
              placeholder="New PIN (4+ digits)"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-400"
            />
            <input
              type="password"
              value={confirmPinInput}
              onChange={e => setConfirmPinInput(e.target.value)}
              placeholder="Confirm New PIN"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-400"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20"
              >
                Save PIN
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: CHANGE PIN */}
        {view === 'change' && (
          <form onSubmit={handleChangePin} className="space-y-3 pt-1">
            <input
              type="password"
              autoFocus
              value={currentPinInput}
              onChange={e => setCurrentPinInput(e.target.value)}
              placeholder="Current Vault PIN"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-400"
            />
            <input
              type="password"
              value={newPinInput}
              onChange={e => setNewPinInput(e.target.value)}
              placeholder="New PIN (4+ digits)"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-400"
            />
            <input
              type="password"
              value={confirmPinInput}
              onChange={e => setConfirmPinInput(e.target.value)}
              placeholder="Confirm New PIN"
              className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-400"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView(isUnlocked ? 'status' : 'unlock')}
                className="flex-1 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20"
              >
                Update PIN
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: STATUS (ALREADY UNLOCKED) */}
        {view === 'status' && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setView('change')}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Change Master PIN
            </button>

            <button
              onClick={() => {
                onLock();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Lock Vault Now
            </button>

            <div className="flex justify-between items-center pt-2 text-[11px] font-mono border-t border-white/5">
              <button
                onClick={handleResetPin}
                className="text-rose-400 hover:underline"
              >
                Reset Vault PIN
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
