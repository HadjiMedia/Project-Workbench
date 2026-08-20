import React, { useState, useEffect, useCallback } from 'react';
import { TabId, JobTicket, User, SecurityAuditLog } from './types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/usersData';
import { Navigation } from './components/Navigation';
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
      return (saved as TabId) || 'errors';
    } catch {
      return 'errors';
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

  // Persist Users & Logs
  useEffect(() => {
    localStorage.setItem('wb_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wb_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

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
    // Update last login in users state
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));

    // Audit log
    const log: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN_SUCCESS',
      ip: user.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `User ${user.fullName} logged in successfully with role ${user.role.toUpperCase()}`,
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
        details: `User ${currentUser.fullName} signed out`,
        severity: 'info'
      };
      setAuditLogs(prev => [log, ...prev]);
    }
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('errors');
    }
  };

  const handleRegisterSubmit = (newUser: User, auditLog: SecurityAuditLog) => {
    setUsers(prev => [newUser, ...prev]);
    setAuditLogs(prev => [auditLog, ...prev]);
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    // If current user modified, update session
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

  // Strict Authentication & Preview Gate
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
    <div className="min-h-screen bg-[#090c12] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Banner & Navigation Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
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
          isVaultUnlocked={isVaultUnlocked}
          isOnline={isOnline}
        />

        {/* Tab Viewport Routing */}
        <main className="transition-all duration-150">
          {activeTab === 'errors' && <ErrorMatrix />}
          {activeTab === 'cheatsheets' && <CheatSheetHub />}
          {activeTab === 'psu' && <PsuCalculator />}
          {activeTab === 'scripts' && <ScriptGenerator />}
          {activeTab === 'techsuite' && <TechSuite />}
          {activeTab === 'tickets' && <TicketingSystem onOpenInvoice={handleOpenTicketInvoice} />}
          {activeTab === 'invoice' && (
            <InvoiceGenerator
              initialTicket={activeInvoiceTicket}
              onBackToTickets={() => handleTabChange('tickets')}
            />
          )}
          {activeTab === 'pinouts' && <PinoutVisualizer />}
          {activeTab === 'serial' && <SerialMonitor />}
          {activeTab === 'motherboard' && <MotherboardCanvas />}
          {activeTab === 'kb' && (
            <KnowledgeBase
              isVaultUnlocked={isVaultUnlocked}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
            />
          )}
          {activeTab === 'shortcuts' && <ShortcutHub />}
          {activeTab === 'admin' && (
            currentUser?.role === 'admin' ? (
              <AdminCenter
                currentUser={currentUser}
                users={users}
                auditLogs={auditLogs}
                onUpdateUsers={handleUpdateUsers}
                onAddAuditLog={handleAddAuditLog}
              />
            ) : (
              <div className="bg-[#12161f]/80 border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <h3 className="text-lg font-bold text-white">Access Restricted</h3>
                <p className="text-xs text-slate-400">Admin privilege is required to access this portal.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 text-slate-950"
                >
                  Sign In as Administrator
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* App Footer */}
      <footer className="no-print border-t border-white/5 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workbench Diagnostics &amp; Software Repair Console · v3.2.0</span>
          <span>Role-Based Access Control · IP Telemetry · Web Serial · Subnet &amp; Beep Diagnostics</span>
        </div>
      </footer>

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
