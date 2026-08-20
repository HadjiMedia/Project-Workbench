import React from 'react';
import { TabId, User } from '../types';
import { 
  LayoutDashboard, Terminal, Zap, FileCode2, ClipboardList, FileText, 
  CircuitBoard, Cable, LayoutGrid, BookOpen, Keyboard, 
  Lock, Unlock, Database, Search, Wifi, WifiOff, ShieldCheck, 
  User as UserIcon, LogIn, LogOut, Wrench, ShieldAlert, Bookmark, Printer
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenCmdk: () => void;
  onOpenVault: () => void;
  onOpenBackup: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentUser: User | null;
  pendingUsersCount: number;
  isVaultUnlocked: boolean;
  isOnline: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenCmdk,
  onOpenVault,
  onOpenBackup,
  onOpenAuth,
  onLogout,
  currentUser,
  pendingUsersCount,
  isVaultUnlocked,
  isOnline
}) => {
  const tabs: { id: TabId; label: string; icon: any; adminOnly?: boolean }[] = [
    // Overview Dashboard
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },

    // Phase 1 Tabs
    { id: 'errors', label: 'Windows Error Matrix', icon: Terminal },
    { id: 'cheatsheets', label: 'Printable Cheat Sheets', icon: Bookmark },
    { id: 'psu', label: 'PSU & Rail Calculator', icon: Zap },
    { id: 'scripts', label: 'Script Builder', icon: FileCode2 },
    { id: 'techsuite', label: 'Tech Multi-Tool', icon: Wrench },
    
    // Phase 2 Tabs
    { id: 'tickets', label: 'Job Ticketing & Intake', icon: ClipboardList },
    { id: 'invoice', label: 'Invoices & Work Orders', icon: FileText },
    
    // Phase 3 & Core Tabs
    { id: 'pinouts', label: 'Header Pinouts', icon: CircuitBoard },
    { id: 'serial', label: 'Web Serial POST', icon: Cable },
    { id: 'motherboard', label: 'Motherboard Blueprint', icon: LayoutGrid },
    { id: 'kb', label: 'Repair Guides', icon: BookOpen },
    { id: 'shortcuts', label: 'Shortcut Suite', icon: Keyboard },
    
    // Admin Site (Only if admin role)
    ...(currentUser?.role === 'admin' ? [
      { id: 'admin' as TabId, label: 'Admin Center', icon: ShieldCheck, adminOnly: true }
    ] : [])
  ];

  return (
    <header className="no-print space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 font-['Space_Grotesk'] text-lg">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
                Workbench
              </h1>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                DIAGNOSTICS &amp; REPAIR SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400">Technical Console · Hardware &amp; OS Diagnostics</p>
          </div>
        </div>

        {/* Global Action Tools & User Profile */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#181d29] border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold">{currentUser.fullName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  currentUser.role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => onTabChange('admin')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                  {pendingUsersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                      {pendingUsersCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Technician Sign In</span>
            </button>
          )}

          {/* Offline / Online indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
            }`}
            title={isOnline ? 'Online - Service Worker Active' : 'Offline Field Mode - Fully Functional Offline'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={onOpenCmdk}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#181d29] hover:bg-[#202738] border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search</span>
            <kbd className="text-[10px]">Ctrl K</kbd>
          </button>

          <button
            onClick={onOpenVault}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              isVaultUnlocked
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25'
                : 'bg-[#181d29] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {isVaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-purple-400" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isVaultUnlocked ? 'Vault Open' : 'Vault Locked'}</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#181d29] hover:bg-[#202738] border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Import / Export Full System JSON Backup"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Backup</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="flex gap-1.5 overflow-x-auto pb-2 p-1.5 bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                  : tab.adminOnly
                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'admin' && pendingUsersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold ml-0.5">
                  {pendingUsersCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
