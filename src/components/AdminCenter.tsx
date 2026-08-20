import React, { useState, useMemo } from 'react';
import { User, UserRole, UserStatus, SecurityAuditLog } from '../types';
import { 
  ShieldCheck, Users, CheckCircle2, XCircle, AlertTriangle, 
  Search, Filter, Globe, Clock, KeyRound, UserCheck, UserX, 
  Trash2, Edit3, Download, RefreshCw, ShieldAlert, Activity, ArrowUpRight,
  FileText, FileCode2, Check, Sparkles, CheckSquare, Square, MinusSquare,
  Shield, UserMinus, ShieldQuestion, ChevronDown, CheckCheck, Wrench,
  Radio, Zap, Award, Send, Key, HardDrive
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
  users = [],
  auditLogs = [],
  onUpdateUsers,
  onDeleteUsers,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'audit'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkRoleDropdownOpen, setIsBulkRoleDropdownOpen] = useState(false);

  // Modals & Feedback
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Dedicated Admin Approval Action Modal
  const [approvalTargetUser, setApprovalTargetUser] = useState<User | null>(null);
  const [approvalRole, setApprovalRole] = useState<UserRole>('bench_tech');
  const [approvalCallsign, setApprovalCallsign] = useState('');
  const [approvalStation, setApprovalStation] = useState('Bench Station #1 (Diagnostics)');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalBadgeAnimation, setApprovalBadgeAnimation] = useState<string | null>(null);

  // Audit Log State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('All');

  const pendingUsers = useMemo(() => (users || []).filter(u => u && u.status === 'pending'), [users]);
  const activeUsers = useMemo(() => (users || []).filter(u => u && u.status === 'active'), [users]);
  const suspendedUsers = useMemo(() => (users || []).filter(u => u && u.status === 'suspended'), [users]);

  // Filtered users for master directory
  const filteredUsers = useMemo(() => {
    return (users || []).filter(u => {
      if (!u) return false;
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.techCallsign && u.techCallsign.toLowerCase().includes(q)) ||
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
  const isSomeVisibleSelected = currentVisibleUserIds.length > 0 && currentVisibleUserIds.some(id => selectedUserIds.has(id)) && !isAllVisibleSelected;

  // Security Verification Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 rounded-2xl bg-[#0e121a] border border-rose-500/30 text-center space-y-4 max-w-2xl mx-auto my-8 animate-in fade-in zoom-in-95">
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

  // Open Approval Actions Modal
  const openApprovalModal = (user: User) => {
    setApprovalTargetUser(user);
    setApprovalRole(user.role || 'bench_tech');
    setApprovalCallsign(user.techCallsign || `TECH-${Math.floor(10 + Math.random() * 89)}`);
    setApprovalStation('Bench Station #1 (Diagnostics)');
    setApprovalNotes('Account identity and bench clearances approved.');
  };

  // Execute Custom Admin Approval
  const handleExecuteApproval = () => {
    if (!approvalTargetUser) return;
    const targetUser = approvalTargetUser;
    const nowStr = new Date().toISOString();
    const approvedByName = currentUser?.fullName || 'Lab Administrator';

    const updated = users.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          status: 'active' as UserStatus,
          role: approvalRole,
          techCallsign: approvalCallsign.trim() || targetUser.techCallsign,
          approvedBy: approvedByName,
          approvedAt: nowStr,
          notes: `${u.notes || ''} | Station: ${approvalStation}. ${approvalNotes}`.trim()
        };
      }
      return u;
    });

    onUpdateUsers(updated);

    // Trigger celebration stamp animation
    setApprovalBadgeAnimation(targetUser.id);
    setTimeout(() => setApprovalBadgeAnimation(null), 3000);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: nowStr.replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_APPROVED_ACTION',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Admin approved technician ${targetUser.fullName} as ${approvalRole.toUpperCase()} (Callsign: ${approvalCallsign}, Station: ${approvalStation}). Notes: ${approvalNotes}`,
      severity: 'info'
    });

    setSelectedUserIds(prev => {
      const next = new Set(prev);
      next.delete(targetUser.id);
      return next;
    });

    setApprovalTargetUser(null);
    showToast(`🎉 Technician "${targetUser.fullName}" successfully commissioned as ${approvalRole.toUpperCase()}!`);
  };

  // --- Quick One-Click Approval Actions ---
  const handleQuickApprove = (userId: string, roleToAssign: UserRole = 'bench_tech') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const nowStr = new Date().toISOString();
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'active' as UserStatus,
          role: roleToAssign,
          approvedBy: currentUser?.fullName || 'Lab Administrator',
          approvedAt: nowStr
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

    setApprovalBadgeAnimation(userId);
    setTimeout(() => setApprovalBadgeAnimation(null), 3000);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: nowStr.replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_QUICK_APPROVED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Quick approved ${targetUser.fullName} with role ${roleToAssign.toUpperCase()}. Callsign: ${targetUser.techCallsign}`,
      severity: 'info'
    });

    showToast(`⚡ Quick Approved "${targetUser.fullName}" as ${roleToAssign.toUpperCase()}.`);
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
  const handleBulkApprove = (assignedRole: UserRole = 'bench_tech') => {
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
          role: assignedRole,
          approvedBy: approvedByName,
          approvedAt: nowStr
        };
      }
      return u;
    });

    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: nowStr.replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'BULK_USERS_APPROVED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Bulk approved ${targets.length} technician accounts as ${assignedRole.toUpperCase()}: ${targets.map(t => `${t.fullName} (${t.techCallsign})`).join(', ')}`,
      severity: 'info'
    });

    setSelectedUserIds(new Set());
    showToast(`🎉 Successfully bulk approved ${targets.length} accounts as ${assignedRole.toUpperCase()}!`);
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
    showToast(`Permanently deleted ${targetsToDelete.length} technician profiles from Cloud.`);
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      if (!log) return false;
      const matchesSeverity = auditSeverityFilter === 'All' || log.severity === auditSeverityFilter;
      const q = auditSearchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.ip && log.ip.toLowerCase().includes(q)) ||
        ((log.details || '').toLowerCase().includes(q)) ||
        (log.timestamp && log.timestamp.toLowerCase().includes(q));

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
        isFilteredSubset: exportFilteredOnly
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
      case 'active': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">ACTIVE</span>;
      case 'pending': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">PENDING</span>;
      case 'suspended': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40">SUSPENDED</span>;
      default: return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-slate-500/15 text-slate-500 border border-slate-500/30">REJECTED</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Live Pulse */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                <span className="absolute w-4 h-4 rounded-full bg-amber-400/40 animate-ping" />
              </div>
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Admin Command Center &amp; User Access Authority
              </h2>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                Admin Clearance Active
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time Firestore user registration approval, customized technician role assignments, station allocation, and tamper-evident audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExportAuditLogsCSV(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => handleExportAuditLogsJSON(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">PENDING APPROVALS</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{pendingUsers.length}</span>
              {pendingUsers.length > 0 && (
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">Action Req</span>
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
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'bg-[#181d29] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security &amp; IP Audit Log</span>
        </button>
      </div>

      {/* STICKY BULK ACTIONS TOOLBAR */}
      {selectedUserIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-[#0f141f]/95 backdrop-blur-xl border-2 border-amber-400/60 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

            <div className="flex items-center gap-2 flex-wrap">
              {(selectedPendingUsers.length > 0 || activeTab === 'pending') && (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkApprove('bench_tech')}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Approve as Bench Tech ({selectedPendingUsers.length > 0 ? selectedPendingUsers.length : selectedUserIds.size})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkApprove('lead_tech')}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Approve as Lead Tech</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkReject}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}

              {/* Set Role Dropdown */}
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

              {/* Status Toggles */}
              <button
                type="button"
                onClick={() => handleBulkSetStatus('active')}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkSetStatus('suspended')}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>

              {/* Bulk Delete */}
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete ({selectedUserIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING REGISTRATIONS APPROVAL QUEUE WITH ADMIN APPROVAL ACTIONS */}
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
                      const allPendingIds = new Set(pendingUsers.map(u => u.id));
                      setSelectedUserIds(allPendingIds);
                      handleBulkApprove('bench_tech');
                    }}
                    className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Approve All Pending ({pendingUsers.length})</span>
                  </button>
                </div>
              </div>

              {/* Pending Users Grid with Enhanced Admin Approval Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map(user => {
                  const isSelected = selectedUserIds.has(user.id);
                  const isJustApproved = approvalBadgeAnimation === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`bg-[#12161f]/80 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl relative transition-all border ${
                        isJustApproved
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-500/[0.08]'
                          : isSelected 
                          ? 'border-amber-400 bg-amber-500/[0.04] shadow-amber-500/10' 
                          : 'border-amber-500/40 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectUser(user.id)}
                            className="mt-0.5 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
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
                            <span className="text-slate-500 block">Applicant Specialization:</span>
                            {user.notes}
                          </div>
                        )}
                      </div>

                      {/* ADMIN APPROVAL ACTIONS BAR */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Zap className="w-3 h-3" />
                            Admin Approval Actions:
                          </span>
                        </div>

                        {/* Quick Role Direct Approval Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleQuickApprove(user.id, 'bench_tech')}
                            className="py-2 px-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.02]"
                            title="Approve immediately as standard Bench Technician"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>⚡ Bench Tech</span>
                          </button>

                          <button
                            onClick={() => handleQuickApprove(user.id, 'lead_tech')}
                            className="py-2 px-2.5 rounded-xl text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10 cursor-pointer transition-all hover:scale-[1.02]"
                            title="Approve and promote to Lead Technician"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>⚡ Lead Tech</span>
                          </button>
                        </div>

                        {/* Advanced Custom Approval & Reject / Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openApprovalModal(user)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-mono bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Custom Clearance...</span>
                          </button>

                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                            title="Mark application as rejected"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Permanently purge application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{user.fullName}</span>
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {user.techCallsign}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                            className="bg-[#181d29] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-400"
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

                        <td className="py-3 px-4 text-slate-300 font-bold">
                          {user.registeredIp || '127.0.0.1'}
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {user.lastLoginIp || 'Never'}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleSuspend(user.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                              user.status === 'suspended'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            }`}
                          >
                            {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Delete User Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                placeholder="Search audit trail by event action, email, IP address, or details..."
                className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono"
              />
            </div>

            <select
              value={auditSeverityFilter}
              onChange={e => setAuditSeverityFilter(e.target.value)}
              className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
            >
              <option value="All">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">SEVERITY</th>
                    <th className="py-3 px-4">ACTION</th>
                    <th className="py-3 px-4">USER / EMAIL</th>
                    <th className="py-3 px-4">SOURCE IP</th>
                    <th className="py-3 px-4">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          log.severity === 'critical' 
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                      <td className="py-3 px-4 text-slate-300">{log.userEmail}</td>
                      <td className="py-3 px-4 text-teal-300 font-bold">{log.ip}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ADMIN APPROVAL ACTIONS MODAL */}
      {approvalTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141f] border border-amber-400/40 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    Technician Commissioning &amp; Approval
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Commissioning {approvalTargetUser.fullName} ({approvalTargetUser.email})</p>
                </div>
              </div>

              <button
                onClick={() => setApprovalTargetUser(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Assigned Clearance Role</label>
                  <select
                    value={approvalRole}
                    onChange={(e) => setApprovalRole(e.target.value as UserRole)}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  >
                    <option value="bench_tech">Bench Technician</option>
                    <option value="lead_tech">Lead Technician</option>
                    <option value="trainee">Apprentice / Trainee</option>
                    <option value="admin">Full Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Assigned Tech Callsign</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={approvalCallsign}
                      onChange={(e) => setApprovalCallsign(e.target.value)}
                      placeholder="TECH-01"
                      className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-bold focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setApprovalCallsign(`TECH-${Math.floor(10 + Math.random() * 89)}`)}
                      className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                      title="Generate random callsign"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Assigned Bench / Workstation</label>
                <select
                  value={approvalStation}
                  onChange={(e) => setApprovalStation(e.target.value)}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                >
                  <option value="Bench Station #1 (Hardware Diagnostics)">Bench Station #1 (Hardware Diagnostics)</option>
                  <option value="Bench Station #2 (SMD Micro-Soldering & Board Repair)">Bench Station #2 (SMD Micro-Soldering & Board Repair)</option>
                  <option value="Bench Station #3 (OS, Firmware & BIOS Flashing)">Bench Station #3 (OS, Firmware & BIOS Flashing)</option>
                  <option value="Bench Station #4 (Data Recovery & Storage)">Bench Station #4 (Data Recovery & Storage)</option>
                  <option value="Mobile / Remote Diagnostics Dispatch">Mobile / Remote Diagnostics Dispatch</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Administrator Approval Statement &amp; Clearance Notes</label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Identity and ESD certifications verified. Access granted to diagnostic equipment."
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400 font-sans"
                />
              </div>

              <div className="bg-[#181d29] p-3 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Key className="w-3.5 h-3.5" />
                  <span>Security Token Provisioned</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Upon confirmation, technician's status will switch to ACTIVE in Cloud Firestore. They can immediately log in from any browser.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setApprovalTargetUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteApproval}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize &amp; Commission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SINGLE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Permanently Delete Technician?
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                This will delete <strong className="text-white">{userToDelete.fullName}</strong> ({userToDelete.email}, Callsign: {userToDelete.techCallsign}) from the Cloud database.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Delete {selectedUserIds.size} Selected Accounts?
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                These technician records will be permanently removed from Cloud Firestore across all devices.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Delete All {selectedUserIds.size}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
