import React, { useState, useEffect, useCallback } from 'react';
import { TabId, JobTicket, User, SecurityAuditLog } from './types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/usersData';
import { INITIAL_TICKETS } from './data/sampleTickets';

import { Navigation } from './components/Navigation';
import { OverviewDashboard } from './components/OverviewDashboard';
import { QrCodeSuite } from './components/QrCodeSuite';
import { ErrorMatrix } from './components/ErrorMatrix';
import { PsuCalculator } from './components/PsuCalculator';
import { ScriptGenerator } from './components/ScriptGenerator';
import { TechSuite } from './components/TechSuite';
import { TicketingSystem } from './components/TicketingSystem';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { PinoutVisualizer } from './components/PinoutVisualizer';
import { SerialMonitor } from './components/SerialMonitor';
import { MotherboardCanvas } from './components/MotherboardCanvas';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ShortcutHub } from './components/ShortcutHub';
import { CheatSheetHub } from './components/CheatSheetHub';
import { AdminCenter } from './components/AdminCenter';
import { LoginPage } from './components/LoginPage';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { VaultModal } from './components/VaultModal';
import { BackupModal } from './components/BackupModal';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    try {
      const saved = localStorage.getItem('wb_active_tab');
      return (saved as TabId) || 'overview';
    } catch {
      return 'overview';
    }
  });

  // User Authentication & Directory State
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('wb_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('wb_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('wb_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Centralized Repair Job Tickets
  const [tickets, setTickets] = useState<JobTicket[]>(() => {
    try {
      const saved = localStorage.getItem('wb_repair_tickets');
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  // Persist State
  useEffect(() => {
    localStorage.setItem('wb_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wb_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('wb_repair_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wb_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wb_current_user');
    }
  }, [currentUser]);

  const [activeInvoiceTicket, setActiveInvoiceTicket] = useState<JobTicket | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync tab change
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    localStorage.setItem('wb_active_tab', tab);
  }, []);

  // Open ticket directly in Invoice Generator
  const handleOpenTicketInvoice = (ticket: JobTicket) => {
    setActiveInvoiceTicket(ticket);
    handleTabChange('invoice');
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));

    const log: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN_SUCCESS',
      ip: user.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Technician ${user.fullName} (${user.techCallsign}) logged in as ${user.role.toUpperCase()}`,
      severity: 'info'
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      const log: SecurityAuditLog = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: 'USER_LOGOUT',
        ip: currentUser.lastLoginIp || '127.0.0.1',
        userAgent: navigator.userAgent,
        details: `Technician ${currentUser.fullName} signed out`,
        severity: 'info'
      };
      setAuditLogs(prev => [log, ...prev]);
    }
    setCurrentUser(null);
  };

  const handleRegisterSubmit = (newUser: User, auditLog: SecurityAuditLog) => {
    setUsers(prev => [newUser, ...prev]);
    setAuditLogs(prev => [auditLog, ...prev]);
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
      const refreshed = updatedUsers.find(u => u.id === currentUser.id);
      if (refreshed) setCurrentUser(refreshed);
    }
  };

  const handleAddAuditLog = (log: SecurityAuditLog) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdkOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  // Strict Authentication Gate
  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSubmit={handleRegisterSubmit}
        isOnline={isOnline}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col lg:flex-row selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Sleek Left Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenCmdk={() => setIsCmdkOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        pendingUsersCount={pendingCount}
        openTicketsCount={openTicketsCount}
        isVaultUnlocked={isVaultUnlocked}
        isOnline={isOnline}
      />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Operations: Overview Dashboard */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              currentUser={currentUser}
              users={users}
              tickets={tickets}
              auditLogs={auditLogs}
              onNavigateTab={handleTabChange}
              onOpenInvoice={handleOpenTicketInvoice}
              isOnline={isOnline}
            />
          )}

          {/* Operations: Repair Job Tickets */}
          {activeTab === 'tickets' && (
            <TicketingSystem 
              onOpenInvoice={handleOpenTicketInvoice} 
              tickets={tickets}
              onUpdateTickets={setTickets}
            />
          )}

          {/* Operations: Work Order Invoice Generator */}
          {activeTab === 'invoice' && (
            <InvoiceGenerator
              initialTicket={activeInvoiceTicket}
              onBackToTickets={() => handleTabChange('tickets')}
            />
          )}

          {/* Tools & Utilities: QR Suite */}
          {activeTab === 'qr' && (
            <QrCodeSuite 
              tickets={tickets} 
              onOpenTicket={() => handleTabChange('tickets')} 
            />
          )}

          {/* Hardware & Diagnostics */}
          {activeTab === 'errors' && <ErrorMatrix />}
          {activeTab === 'psu' && <PsuCalculator />}
          {activeTab === 'serial' && <SerialMonitor />}
          {activeTab === 'motherboard' && <MotherboardCanvas />}
          {activeTab === 'pinouts' && <PinoutVisualizer />}

          {/* Tools & Knowledge */}
          {activeTab === 'scripts' && <ScriptGenerator />}
          {activeTab === 'techsuite' && <TechSuite />}
          {activeTab === 'cheatsheets' && <CheatSheetHub />}
          {activeTab === 'kb' && (
            <KnowledgeBase
              isVaultUnlocked={isVaultUnlocked}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
            />
          )}
          {activeTab === 'shortcuts' && <ShortcutHub />}

          {/* Administration & Security */}
          {activeTab === 'admin' && (
            <AdminCenter
              currentUser={currentUser}
              users={users}
              auditLogs={auditLogs}
              onUpdateUsers={handleUpdateUsers}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

        </main>

        {/* Global Clean Footer */}
        <footer className="no-print border-t border-white/5 py-4 px-6 text-xs font-mono text-slate-500 bg-[#0a0d13]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">WORKBENCH PRO</span>
            <span>·</span>
            <span>Hardware Diagnostics &amp; Electronics Repair Suite</span>
          </div>
          <div className="flex items-center gap-3">
            <span>ISO 27001 / NIST Audit Enabled</span>
            <span>·</span>
            <span className="text-cyan-400">Offline Cache Ready</span>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSubmit={handleRegisterSubmit}
      />

      <CommandPalette
        isOpen={isCmdkOpen}
        onClose={() => setIsCmdkOpen(false)}
        onNavigate={handleTabChange}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        isUnlocked={isVaultUnlocked}
        onUnlockSuccess={() => setIsVaultUnlocked(true)}
        onLock={() => setIsVaultUnlocked(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreComplete={() => {
          setIsBackupModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

export default App;
