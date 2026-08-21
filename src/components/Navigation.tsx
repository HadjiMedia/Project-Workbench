import React, { useState } from 'react';
import { TabId, User } from '../types';
import { 
  LayoutDashboard, Wrench, ShieldAlert, Zap, Terminal, FileCode2,
  Receipt, CircuitBoard, Cable, LayoutGrid, BookOpen, Keyboard,
  Bookmark, Lock, Unlock, Database, Search, LogOut, Menu, X,
  ShieldCheck, Wifi, WifiOff, ChevronRight, HardDrive, Cpu, AlertTriangle,
  QrCode, Sparkles
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
  openTicketsCount: number;
  isVaultUnlocked: boolean;
  isOnline: boolean;
}

interface NavSection {
  title: string;
  items: {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    roleRequired?: 'admin';
  }[];
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
  openTicketsCount,
  isVaultUnlocked,
  isOnline
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { 
          id: 'tickets', 
          label: 'Repair Tickets', 
          icon: Wrench, 
          badge: openTicketsCount > 0 ? openTicketsCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold'
        },
        { id: 'invoice', label: 'Invoice Generator', icon: Receipt },
      ]
    },
    {
      title: 'HARDWARE & DIAGNOSTICS',
      items: [
        { 
          id: 'manual', 
          label: 'DIY Repair Manual', 
          icon: BookOpen,
          badge: '300-PG',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px]'
        },
        { id: 'errors', label: 'Windows Error Matrix', icon: AlertTriangle },
        { id: 'psu', label: 'PSU Rail Calculator', icon: Zap },
        { id: 'serial', label: 'Web Serial POST', icon: Cable },
        { id: 'motherboard', label: 'Motherboard Blueprint', icon: LayoutGrid },
        { id: 'pinouts', label: 'Header Pinouts', icon: CircuitBoard },
      ]
    },
    {
      title: 'TOOLS & UTILITIES',
      items: [
        { 
          id: 'qr', 
          label: 'QR Scanner & Generator', 
          icon: QrCode,
          badge: 'TOOL',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px]'
        },
        { id: 'scripts', label: 'Script Builder', icon: FileCode2 },
        { id: 'techsuite', label: 'Tech Suite Multi-Tool', icon: Cpu },
        { id: 'cheatsheets', label: 'Quick Cheat Sheets', icon: Bookmark },
        { 
          id: 'kb', 
          label: 'Knowledge Base', 
          icon: BookOpen,
          badge: isVaultUnlocked ? 'UNLOCKED' : undefined,
          badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px]'
        },
        { id: 'shortcuts', label: 'Shortcut Suite', icon: Keyboard },
      ]
    },
    ...(currentUser?.role === 'admin' ? [{
      title: 'ADMINISTRATION',
      items: [
        { 
          id: 'admin' as TabId, 
          label: 'Admin & Security Center', 
          icon: ShieldCheck,
          badge: pendingUsersCount > 0 ? `${pendingUsersCount} PENDING` : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-pulse'
        },
      ]
    }] : [])
  ];

  const handleSelect = (tab: TabId) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };

  const roleDisplay = currentUser?.role ? currentUser.role.replace('_', ' ').toUpperCase() : 'TECHNICIAN';

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#0b0e14]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white font-['Space_Grotesk'] text-sm">Workbench Pro</span>
            <span className="text-[10px] block text-amber-400 font-mono">Hardware Diagnostics</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCmdk}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER BACKDROP */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        >
          <div 
            className="w-72 bg-[#090b10] border-r border-white/10 h-full flex flex-col justify-between p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white font-['Space_Grotesk'] text-sm">Workbench Pro</span>
                    <span className="text-[9px] block text-amber-400 font-mono">Diagnostics Suite</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <div className="space-y-5">
                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      {section.title}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shadow-sm shadow-amber-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Bottom Profile */}
            <div className="border-t border-white/10 pt-3 mt-4 space-y-2">
              <div className="bg-[#121622] p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-white font-bold text-xs truncate">{currentUser?.fullName || 'Technician'}</div>
                  <div className="text-[10px] text-amber-400 font-mono truncate">{currentUser?.techCallsign} · {roleDisplay}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SLEEK LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#090b10] border-r border-white/10 min-h-screen shrink-0 font-mono select-none sticky top-0 h-screen z-30">
        
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          
          {/* Header Brand */}
          <div className="p-4 border-b border-white/10 bg-[#0d1017]/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white font-['Space_Grotesk'] text-base tracking-tight leading-tight block">
                    Workbench Pro
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-mono block">
                    Hardware &amp; Repair Suite
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5" title={isOnline ? 'Online mode active' : 'Offline local cache active'}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
              </div>
            </div>

            {/* Quick Command Bar Search Button */}
            <button
              type="button"
              onClick={onOpenCmdk}
              className="mt-3.5 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#121622] hover:bg-[#181e2e] border border-white/10 hover:border-cyan-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Search tools &amp; codes</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-slate-400 font-mono font-bold">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Nav List (Scrollable Area) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  {section.title}
                </div>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shadow-md shadow-amber-500/5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400/80'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-mono ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Profile & Utility Actions */}
          <div className="p-3 border-t border-white/10 bg-[#0d1017]/90 space-y-2.5">
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenVault}
                className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isVaultUnlocked
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/10'
                    : 'bg-[#121622] hover:bg-[#181e2e] border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Protected Hardware Knowledge Vault"
              >
                {isVaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-purple-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isVaultUnlocked ? 'Vault Open' : 'Unlock Vault'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenBackup}
                className="py-1.5 px-2.5 rounded-xl bg-[#121622] hover:bg-[#181e2e] border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Backup & Restore Workbench Data"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backup</span>
              </button>
            </div>

            {/* User Details & Sign Out Card */}
            <div className="bg-[#121622] p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-xs truncate">
                    {currentUser?.fullName || 'Technician'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-amber-400 font-mono font-bold truncate">
                    {currentUser?.techCallsign || 'TECH-01'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                    {roleDisplay}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-colors cursor-pointer shrink-0"
                title="Sign Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </aside>
    </>
  );
};

