import React, { useState, useMemo } from 'react';
import { User, UserRole, UserStatus, SecurityAuditLog } from '../types';
import { 
  ShieldCheck, Users, CheckCircle2, XCircle, AlertTriangle, 
  Search, Filter, Globe, Clock, KeyRound, UserCheck, UserX, 
  Trash2, Edit3, Download, RefreshCw, ShieldAlert, Activity, ArrowUpRight,
  FileText, FileCode2, Check, Sparkles, CheckSquare, Square, MinusSquare,
  Shield, UserMinus, ShieldQuestion, ChevronDown, CheckCheck
} from 'lucide-react';

interface AdminCenterProps {
  currentUser: User | null;
  users: User[];
  auditLogs: SecurityAuditLog[];
  onUpdateUsers: (users: User[]) => void;
  onDeleteUsers?: (userIds: string[]) => void;
  onAddAuditLog: (log: SecurityAuditLog) => void;
}

export const AdminCenter: React.FC<AdminCenterProps> = ({
  currentUser,
  users,
  auditLogs,
  onUpdateUsers,
  onDeleteUsers,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'audit' | 'settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkRoleTarget, setBulkRoleTarget] = useState<UserRole>('bench_tech');
  const [isBulkRoleDropdownOpen, setIsBulkRoleDropdownOpen] = useState(false);

  // Modals & Feedback
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Security Verification Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 rounded-2xl bg-[#0e121a] border border-rose-500/30 text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">Access Restricted: Administrator Privileges Required</h2>
        <p className="text-xs text-slate-400 font-mono">
          Your current account ({currentUser?.fullName || 'Guest'} · {currentUser?.techCallsign || 'TECH-00'}) has role <span className="text-amber-400 font-bold uppercase">{currentUser?.role || 'BENCH_TECH'}</span>. Only authorized administrators can access user approval and security audit logs.
        </p>
      </div>
    );
  }

  // Audit Log State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('All');

  const pendingUsers = useMemo(() => users.filter(u => u.status === 'pending'), [users]);
  const activeUsers = useMemo(() => users.filter(u => u.status === 'active'), [users]);
  const suspendedUsers = useMemo(() => users.filter(u => u.status === 'suspended'), [users]);

  // Filtered users for master directory
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.techCallsign.toLowerCase().includes(q) ||
        (u.registeredIp && u.registeredIp.toLowerCase().includes(q)) ||
        (u.lastLoginIp && u.lastLoginIp.toLowerCase().includes(q));

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Bulk Selection Helpers
  const currentVisibleUserIds = useMemo(() => {
    if (activeTab === 'pending') {
      return pendingUsers.map(u => u.id);
    }
    return filteredUsers.map(u => u.id);
  }, [activeTab, pendingUsers, filteredUsers]);

  const isAllVisibleSelected = currentVisibleUserIds.length > 0 && currentVisibleUserIds.every(id => selectedUserIds.has(id));
  const isSomeVisibleSelected = currentVisibleUserIds.some(id => selectedUserIds.has(id)) && !isAllVisibleSelected;

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleToggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      setSelectedUserIds(prev => {
        const next = new Set(prev);
        currentVisibleUserIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedUserIds(prev => {
        const next = new Set(prev);
        currentVisibleUserIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const showToast = (message: string) => {
    setExportToast(message);
    setTimeout(() => setExportToast(null), 4000);
  };

  // --- Single User Actions ---
  const handleApproveUser = (userId: string, assignedRole?: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'active' as UserStatus,
          role: assignedRole || u.role,
          approvedBy: currentUser?.fullName || 'Lab Administrator',
          approvedAt: new Date().toISOString()
        };
      }
      return u;
    });

    onUpdateUsers(updated);
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_APPROVED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Approved technician ${targetUser.fullName} (${targetUser.email}) with role ${(assignedRole || targetUser.role).toUpperCase()}. IP: ${targetUser.registeredIp || 'N/A'}`,
      severity: 'info'
    });

    showToast(`Technician "${targetUser.fullName}" was approved successfully.`);
  };

  const handleRejectUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => u.id === userId ? { ...u, status: 'rejected' as UserStatus } : u);
    onUpdateUsers(updated);
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_REJECTED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Rejected registration for ${targetUser.fullName} (${targetUser.email}). IP: ${targetUser.registeredIp || 'N/A'}`,
      severity: 'warning'
    });

    showToast(`Registration for "${targetUser.fullName}" was rejected.`);
  };

  const handleToggleSuspend = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (currentUser && currentUser.id === userId) {
      showToast('⚠️ Cannot suspend your currently active administrator account.');
      return;
    }

    const newStatus: UserStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Changed status of ${targetUser.fullName} to ${newStatus.toUpperCase()}`,
      severity: newStatus === 'suspended' ? 'warning' : 'info'
    });

    showToast(`Account "${targetUser.fullName}" is now ${newStatus.toUpperCase()}.`);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_ROLE_CHANGED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Promoted/Changed role of ${targetUser.fullName} to ${newRole.toUpperCase()}`,
      severity: 'info'
    });

    showToast(`Updated role of "${targetUser.fullName}" to ${newRole.toUpperCase()}.`);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (currentUser && currentUser.id === userId) {
      showToast('⚠️ Security rule: You cannot delete your currently active administrator account.');
      return;
    }

    setUserToDelete(targetUser);
  };

  const handleConfirmSingleDelete = () => {
    if (!userToDelete) return;

    const target = userToDelete;
    if (onDeleteUsers) {
      onDeleteUsers([target.id]);
    } else {
      const updated = users.filter(u => u.id !== target.id);
      onUpdateUsers(updated);
    }
    
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
    setUserToDelete(null);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_DELETED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Permanently deleted technician profile ${target.fullName} (${target.email}, Callsign: ${target.techCallsign}, Role: ${target.role.toUpperCase()})`,
      severity: 'critical'
    });

    showToast(`Technician account "${target.fullName}" (${target.techCallsign}) was permanently deleted.`);
  };

  // --- Bulk Operations ---
  const selectedUsersList = useMemo(() => {
    return users.filter(u => selectedUserIds.has(u.id));
  }, [users, selectedUserIds]);

  const selectedPendingUsers = useMemo(() => {
    return selectedUsersList.filter(u => u.status === 'pending');
  }, [selectedUsersList]);

  // Bulk Approve
  const handleBulkApprove = (assignedRole?: UserRole) => {
    const targets = selectedUsersList.filter(u => u.status === 'pending' || u.status === 'rejected');
    if (targets.length === 0) {
      showToast('No pending or rejected accounts found in your selection.');
      return;
    }

    const targetIds = new Set(targets.map(u => u.id));
    const nowStr = new Date().toISOString();
    const approvedByName = currentUser?.fullName || 'Lab Administrator';

    const updated = users.map(u => {
      if (targetIds.has(u.id)) {
        return {
          ...u,
          status: 'active' as UserStatus,
          role: assignedRole || u.role,
          approvedBy: approvedByName,
          approvedAt: nowStr
        };
      }
      return u;
    });

    onUpdateUsers(updated);

    // Write batch audit log
    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: nowStr.replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'BULK_USERS_APPROVED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk approved ${targets.length} technician accounts: ${targets.map(t => `${t.fullName} (${t.techCallsign})`).join(', ')}`,
      severity: 'info'
    });

    setSelectedUserIds(new Set());
    showToast(`🎉 Successfully bulk approved ${targets.length} technician accounts!`);
  };

  // Bulk Reject
  const handleBulkReject = () => {
    const targets = selectedUsersList.filter(u => u.status === 'pending');
    if (targets.length === 0) {
      showToast('No pending registrations found in current selection.');
      return;
    }

    const targetIds = new Set(targets.map(u => u.id));
    const updated = users.map(u => targetIds.has(u.id) ? { ...u, status: 'rejected' as UserStatus } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'BULK_USERS_REJECTED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk rejected ${targets.length} registrations: ${targets.map(t => `${t.fullName} (${t.email})`).join(', ')}`,
      severity: 'warning'
    });

    setSelectedUserIds(new Set());
    showToast(`Bulk rejected ${targets.length} pending registration requests.`);
  };

  // Bulk Change Role
  const handleBulkChangeRole = (newRole: UserRole) => {
    if (selectedUsersList.length === 0) return;

    const targetIds = new Set(selectedUsersList.map(u => u.id));
    const updated = users.map(u => targetIds.has(u.id) ? { ...u, role: newRole } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'BULK_ROLE_CHANGED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk updated role to ${newRole.toUpperCase()} for ${selectedUsersList.length} users: ${selectedUsersList.map(u => u.techCallsign).join(', ')}`,
      severity: 'info'
    });

    setIsBulkRoleDropdownOpen(false);
    setSelectedUserIds(new Set());
    showToast(`Updated role to ${newRole.toUpperCase()} for ${selectedUsersList.length} accounts.`);
  };

  // Bulk Suspend / Activate
  const handleBulkSetStatus = (newStatus: UserStatus) => {
    // Filter out current active admin from suspension
    const targets = selectedUsersList.filter(u => !(newStatus === 'suspended' && currentUser && u.id === currentUser.id));
    if (targets.length === 0) {
      showToast('⚠️ No eligible accounts to update in selection.');
      return;
    }

    const targetIds = new Set(targets.map(u => u.id));
    const updated = users.map(u => targetIds.has(u.id) ? { ...u, status: newStatus } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: newStatus === 'suspended' ? 'BULK_USERS_SUSPENDED' : 'BULK_USERS_ACTIVATED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk changed status to ${newStatus.toUpperCase()} for ${targets.length} users: ${targets.map(u => u.techCallsign).join(', ')}`,
      severity: newStatus === 'suspended' ? 'warning' : 'info'
    });

    setSelectedUserIds(new Set());
    showToast(`Bulk updated status to ${newStatus.toUpperCase()} for ${targets.length} accounts.`);
  };

  // Bulk Delete Confirmation & Execution
  const handleConfirmBulkDelete = () => {
    // Exclude current logged in admin account for safety
    const targetsToDelete = selectedUsersList.filter(u => !(currentUser && u.id === currentUser.id));
    if (targetsToDelete.length === 0) {
      showToast('⚠️ Cannot delete your own active administrator account.');
      setIsBulkDeleteModalOpen(false);
      return;
    }

    const idsToDelete = targetsToDelete.map(u => u.id);
    if (onDeleteUsers) {
      onDeleteUsers(idsToDelete);
    } else {
      const updated = users.filter(u => !idsToDelete.includes(u.id));
      onUpdateUsers(updated);
    }

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'BULK_USERS_DELETED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk deleted ${targetsToDelete.length} technician records: ${targetsToDelete.map(t => `${t.fullName} (${t.email})`).join(', ')}`,
      severity: 'critical'
    });

    setIsBulkDeleteModalOpen(false);
    setSelectedUserIds(new Set());
    showToast(`Permanently deleted ${targetsToDelete.length} technician profiles from database.`);
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSeverity = auditSeverityFilter === 'All' || log.severity === auditSeverityFilter;
      const q = auditSearchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        log.action.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        log.timestamp.toLowerCase().includes(q);

      return matchesSeverity && matchesQuery;
    });
  }, [auditLogs, auditSeverityFilter, auditSearchQuery]);

  // Export Audit Logs to CSV
  const handleExportAuditLogsCSV = (exportFilteredOnly = false) => {
    const targetLogs = exportFilteredOnly ? filteredAuditLogs : auditLogs;
    if (targetLogs.length === 0) {
      showToast('No audit logs available to export.');
      return;
    }

    let csv = 'Log_ID,Timestamp,Severity,Action,User_Email,User_ID,IP_Address,User_Agent,Details\n';
    targetLogs.forEach(l => {
      csv += `"${l.id}","${l.timestamp}","${l.severity.toUpperCase()}","${l.action}","${l.userEmail}","${l.userId || ''}","${l.ip}","${(l.userAgent || '').replace(/"/g, '""')}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Workbench_Audit_Logs_${dateStr}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Successfully exported ${targetLogs.length} audit log records as CSV!`);
  };

  // Export Audit Logs to JSON
  const handleExportAuditLogsJSON = (exportFilteredOnly = false) => {
    const targetLogs = exportFilteredOnly ? filteredAuditLogs : auditLogs;
    if (targetLogs.length === 0) {
      showToast('No audit logs available to export.');
      return;
    }

    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.email || 'admin',
        exporterRole: currentUser?.role || 'admin',
        complianceStandard: 'NIST SP 800-92 / ISO 27001 Log Management',
        totalSystemRecords: auditLogs.length,
        exportedRecordCount: targetLogs.length,
        isFilteredSubset: exportFilteredOnly,
        activeFilters: exportFilteredOnly ? {
          severity: auditSeverityFilter,
          searchQuery: auditSearchQuery || 'none'
        } : 'None (Full System Export)'
      },
      auditLogs: targetLogs
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Workbench_Audit_Logs_${dateStr}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Successfully exported ${targetLogs.length} audit log records as JSON!`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">ADMIN</span>;
      case 'lead_tech': return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">LEAD TECH</span>;
      case 'bench_tech': return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">BENCH TECH</span>;
      default: return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-500/15 text-slate-400 border border-slate-500/30">TRAINEE</span>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">ACTIVE</span>;
      case 'pending': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">PENDING</span>;
      case 'suspended': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40">SUSPENDED</span>;
      default: return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-slate-500/15 text-slate-500 border border-slate-500/30">REJECTED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Admin Command Center &amp; User Access Authority
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                Admin Privilege Active
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Manage technician authentication, approve new user registration requests in bulk with recorded IP addresses, assign roles, and audit security telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExportAuditLogsCSV(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
              title="Download full audit log history as CSV"
            >
              <FileText className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => handleExportAuditLogsJSON(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
              title="Download full audit log history as JSON"
            >
              <FileCode2 className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">PENDING APPROVALS</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{pendingUsers.length}</span>
              {pendingUsers.length > 0 && (
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Action Req</span>
              )}
            </div>
          </div>

          <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">ACTIVE TECHNICIANS</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">{activeUsers.length}</div>
          </div>

          <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">TOTAL REGISTERED</span>
            <div className="text-2xl font-bold font-mono text-white">{users.length}</div>
          </div>

          <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">SECURITY EVENTS</span>
            <div className="text-2xl font-bold font-mono text-sky-400">{auditLogs.length}</div>
          </div>
        </div>
      </div>

      {/* Global Admin Feedback Toast */}
      {exportToast && (
        <div className="p-3.5 rounded-2xl bg-[#181d29] border border-amber-400/40 text-slate-200 font-mono text-xs flex items-center justify-between gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{exportToast}</span>
          </div>
          <button 
            onClick={() => setExportToast(null)}
            className="text-slate-400 hover:text-white font-bold px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => { setActiveTab('pending'); handleClearSelection(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Pending Approvals ({pendingUsers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('users'); handleClearSelection(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory &amp; Roles</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); handleClearSelection(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security &amp; IP Audit Log</span>
        </button>
      </div>

      {/* STICKY / FLOATING BULK ACTIONS TOOLBAR (Appears when 1+ users are selected) */}
      {selectedUserIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-[#0f141f]/95 backdrop-blur-xl border-2 border-amber-400/60 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Left: Count Badge & Deselect */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckSquare className="w-4 h-4" />
                <span>{selectedUserIds.size} Technician{selectedUserIds.size > 1 ? 's' : ''} Selected</span>
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            {/* Right: Bulk Operations */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Bulk Approve (Shows when any pending selected or in pending tab) */}
              {(selectedPendingUsers.length > 0 || activeTab === 'pending') && (
                <button
                  type="button"
                  onClick={() => handleBulkApprove()}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  title="Approve all selected pending technician accounts"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Bulk Approve ({selectedPendingUsers.length > 0 ? selectedPendingUsers.length : selectedUserIds.size})</span>
                </button>
              )}

              {/* Bulk Reject (Pending Tab or pending selected) */}
              {(selectedPendingUsers.length > 0 || activeTab === 'pending') && (
                <button
                  type="button"
                  onClick={handleBulkReject}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reject selected pending registrations"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Bulk Reject</span>
                </button>
              )}

              {/* Bulk Role Assign Dropdown (Directory View) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBulkRoleDropdownOpen(!isBulkRoleDropdownOpen)}
                  className="px-3 py-2 rounded-xl text-xs font-mono bg-[#181d29] hover:bg-[#202738] text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Role</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isBulkRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#141924] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleBulkChangeRole('trainee')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                    >
                      Assign: Trainee
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeRole('bench_tech')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 text-sky-300 transition-colors"
                    >
                      Assign: Bench Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeRole('lead_tech')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-500/20 text-purple-300 transition-colors"
                    >
                      Assign: Lead Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkChangeRole('admin')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 text-amber-300 font-bold transition-colors"
                    >
                      Assign: Admin
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Status Toggles (Suspend / Activate) */}
              <button
                type="button"
                onClick={() => handleBulkSetStatus('active')}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
                title="Set status of all selected accounts to Active"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkSetStatus('suspended')}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
                title="Suspend all selected accounts"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>

              {/* Bulk Delete Trigger */}
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Permanently purge selected technician profiles"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete ({selectedUserIds.size})</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING REGISTRATIONS APPROVAL QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">No Pending Registration Requests</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All registered technicians have been reviewed. When a new technician signs up, their profile and captured IP address will appear here for verification.
              </p>
            </div>
          ) : (
            <>
              {/* Batch Action Header for Pending Users */}
              <div className="bg-[#12161f]/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllVisible}
                    className="flex items-center gap-2 font-mono text-xs text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : isSomeVisibleSelected ? (
                      <MinusSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Select All Pending ({pendingUsers.length})</span>
                  </button>
                  {selectedUserIds.size > 0 && (
                    <span className="text-xs font-mono text-slate-400">
                      · {selectedUserIds.size} checked
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Select all pending and immediately approve
                      const allPendingIds = new Set(pendingUsers.map(u => u.id));
                      setSelectedUserIds(allPendingIds);
                      handleBulkApprove();
                    }}
                    className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Approve All Pending ({pendingUsers.length})</span>
                  </button>
                </div>
              </div>

              {/* Pending Users Grid with Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map(user => {
                  const isSelected = selectedUserIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`bg-[#12161f]/80 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl relative transition-all border ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-500/[0.04] shadow-amber-500/10' 
                          : 'border-amber-500/40 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Checkbox + User Info */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectUser(user.id)}
                            className="mt-0.5 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            aria-label={`Select ${user.fullName}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-amber-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                {user.techCallsign}
                              </span>
                              {getRoleBadge(user.role)}
                            </div>
                            <h4 className="text-base font-bold text-white font-['Space_Grotesk']">{user.fullName}</h4>
                            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                          Awaiting Action
                        </span>
                      </div>

                      {/* Captured IP & Environment Metadata */}
                      <div className="bg-[#181d29] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-teal-400" />
                            Registration IP:
                          </span>
                          <span className="text-teal-300 font-bold">{user.registeredIp || '127.0.0.1'}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Timestamp:
                          </span>
                          <span className="text-slate-300">{new Date(user.registeredAt).toLocaleString()}</span>
                        </div>

                        {user.notes && (
                          <div className="pt-1 text-[11px] text-slate-300 border-t border-white/5">
                            <span className="text-slate-500 block">Applicant Notes:</span>
                            {user.notes}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve Access
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="px-3 py-2 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                          title="Mark application as rejected"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Permanently purge application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: MASTER USER DIRECTORY & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search technician directory by name, email, callsign, or IP..."
                className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
              >
                <option value="All">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="lead_tech">Lead Techs</option>
                <option value="bench_tech">Bench Techs</option>
                <option value="trainee">Trainees</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* User Table with Bulk Checkboxes */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4 w-12 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllVisible}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title={isAllVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
                      >
                        {isAllVisibleSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : isSomeVisibleSelected ? (
                          <MinusSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">TECHNICIAN</th>
                    <th className="py-3 px-4">ROLE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">REGISTERED IP</th>
                    <th className="py-3 px-4">LAST LOGIN IP</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUserIds.has(user.id);
                    return (
                      <tr 
                        key={user.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-amber-500/[0.07] hover:bg-amber-500/[0.12]' 
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectUser(user.id)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                            aria-label={`Select ${user.fullName}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm font-['Space_Grotesk']">{user.fullName}</div>
                          <div className="text-[11px] text-slate-400">{user.email} · <span className="text-amber-400">{user.techCallsign}</span></div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={e => handleChangeRole(user.id, e.target.value as UserRole)}
                            className="bg-[#181d29] border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-400"
                          >
                            <option value="trainee">Trainee</option>
                            <option value="bench_tech">Bench Tech</option>
                            <option value="lead_tech">Lead Tech</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="py-3 px-4 text-teal-300">
                          {user.registeredIp || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {user.lastLoginIp || 'Never logged in'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer"
                                title="Approve User"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleSuspend(user.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
                                  user.status === 'suspended'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                }`}
                                title={user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                              >
                                {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-colors cursor-pointer"
                              title="Delete User Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                No technicians match the current search or filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & IP AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Controls & Export Bar */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search & Severity Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={e => setAuditSearchQuery(e.target.value)}
                  placeholder="Filter by action, user email, IP address, or details..."
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono"
                />
              </div>

              <select
                value={auditSeverityFilter}
                onChange={e => setAuditSeverityFilter(e.target.value)}
                className="w-full sm:w-auto bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
              >
                <option value="All">All Severities ({auditLogs.length})</option>
                <option value="critical">Critical Only ({auditLogs.filter(l => l.severity === 'critical').length})</option>
                <option value="warning">Warnings ({auditLogs.filter(l => l.severity === 'warning').length})</option>
                <option value="info">Informational ({auditLogs.filter(l => l.severity === 'info').length})</option>
              </select>
            </div>

            {/* Export Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="flex items-center rounded-xl bg-[#181d29] p-1 border border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleExportAuditLogsCSV(auditSearchQuery !== '' || auditSeverityFilter !== 'All')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all font-bold cursor-pointer"
                  title="Download as CSV spreadsheet format"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>

                <div className="h-4 w-px bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={() => handleExportAuditLogsJSON(auditSearchQuery !== '' || auditSeverityFilter !== 'All')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all font-bold cursor-pointer"
                  title="Download as JSON raw data structure"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              {(auditSearchQuery !== '' || auditSeverityFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setAuditSearchQuery(''); setAuditSeverityFilter('All'); }}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono border border-white/10 transition-all cursor-pointer"
                  title="Reset search and filters"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Audit Logs Table / Feed */}
          <div className="bg-[#0b0e14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-mono gap-2">
              <span className="text-slate-200 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Historical Security Telemetry &amp; IP Access Log</span>
                <span className="text-slate-400 text-[11px] font-normal">
                  (Showing {filteredAuditLogs.length} of {auditLogs.length} Records)
                </span>
              </span>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  🛡️ NIST / ISO 27001 Ready
                </span>
                <span>Tamper-Evident Real-time Sync</span>
              </div>
            </div>

            {filteredAuditLogs.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto font-mono text-xs">
                {filteredAuditLogs.map(log => (
                  <div key={log.id} className="p-3.5 hover:bg-white/[0.02] flex items-start justify-between gap-4 transition-colors">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-500 text-[10px]">[{log.timestamp}]</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-slate-200 font-bold truncate">{log.userEmail}</span>
                        {log.userId && (
                          <span className="text-slate-500 text-[10px]">({log.userId})</span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed break-words">{log.details}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-teal-300 font-bold justify-end text-[11px]">
                        <Globe className="w-3 h-3" />
                        <span>{log.ip}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block max-w-[220px] truncate mt-0.5" title={log.userAgent}>
                        {log.userAgent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3 font-mono">
                <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">No matching audit records found</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your search keywords or severity filters to view historical security events.
                </p>
                <button
                  type="button"
                  onClick={() => { setAuditSearchQuery(''); setAuditSeverityFilter('All'); }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Bottom Footer Info */}
            <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <span>All administrative actions, authentication attempts, role changes, and IP addresses are recorded chronologically.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportAuditLogsCSV(false)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export Full History (CSV)
                </button>
                <span>·</span>
                <button
                  onClick={() => handleExportAuditLogsJSON(false)}
                  className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export Full History (JSON)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SINGLE USER DELETION CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Permanently Delete Technician Profile?
                </h3>
                <p className="text-xs text-slate-400">
                  This action cannot be undone. All access credentials and technician identity records will be purged.
                </p>
              </div>
            </div>

            <div className="bg-[#181d29] p-4 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Technician:</span>
                <span className="text-white font-bold">{userToDelete.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{userToDelete.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Callsign:</span>
                <span className="text-amber-400 font-bold">{userToDelete.techCallsign}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="text-slate-300 uppercase">{userToDelete.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registered IP:</span>
                <span className="text-teal-400">{userToDelete.registeredIp || '127.0.0.1'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>A tamper-evident critical audit log entry will be permanently written to the system ledger.</span>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK USERS DELETION CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Bulk Delete {selectedUserIds.size} Technician Profiles?
                </h3>
                <p className="text-xs text-slate-400">
                  This irreversible action will permanently purge {selectedUserIds.size} user records and their access credentials from the cloud database.
                </p>
              </div>
            </div>

            {/* List of target users */}
            <div className="bg-[#181d29] p-3 rounded-xl border border-white/10 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
              {selectedUsersList.map(u => (
                <div key={u.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-white font-bold">{u.fullName}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({u.email})</span>
                  </div>
                  <span className="text-amber-400 font-semibold">{u.techCallsign}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Your active administrator session is protected and will not be deleted.</span>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Selected ({selectedUserIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
