import React, { useState } from 'react';
import { User, UserRole, UserStatus, SecurityAuditLog } from '../types';
import { 
  ShieldCheck, Users, CheckCircle2, XCircle, AlertTriangle, 
  Search, Filter, Globe, Clock, KeyRound, UserCheck, UserX, 
  Trash2, Edit3, Download, RefreshCw, ShieldAlert, Activity, ArrowUpRight
} from 'lucide-react';

interface AdminCenterProps {
  currentUser: User | null;
  users: User[];
  auditLogs: SecurityAuditLog[];
  onUpdateUsers: (users: User[]) => void;
  onAddAuditLog: (log: SecurityAuditLog) => void;
}

export const AdminCenter: React.FC<AdminCenterProps> = ({
  currentUser,
  users,
  auditLogs,
  onUpdateUsers,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'audit' | 'settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');
  const suspendedUsers = users.filter(u => u.status === 'suspended');

  // Approve User
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

    // Audit Log
    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_APPROVED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Approved user ${targetUser.fullName} (${targetUser.email}) with role ${assignedRole || targetUser.role}. Registered IP: ${targetUser.registeredIp}`,
      severity: 'info'
    });
  };

  // Reject User
  const handleRejectUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => u.id === userId ? { ...u, status: 'rejected' as UserStatus } : u);
    onUpdateUsers(updated);

    onAddAuditLog({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'admin',
      action: 'USER_REJECTED',
      ip: currentUser?.lastLoginIp || '127.0.0.1',
      userAgent: navigator.userAgent,
      details: `Rejected registration for ${targetUser.fullName} (${targetUser.email}). Registered IP: ${targetUser.registeredIp}`,
      severity: 'warning'
    });
  };

  // Toggle Suspend / Active
  const handleToggleSuspend = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

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
  };

  // Change Role
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
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (confirm(`Permanently remove user ${targetUser.fullName} (${targetUser.email})?`)) {
      const updated = users.filter(u => u.id !== userId);
      onUpdateUsers(updated);
      if (selectedUser?.id === userId) setSelectedUser(null);

      onAddAuditLog({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: currentUser?.id,
        userEmail: currentUser?.email || 'admin',
        action: 'USER_DELETED',
        ip: currentUser?.lastLoginIp || '127.0.0.1',
        userAgent: navigator.userAgent,
        details: `Deleted user record for ${targetUser.fullName} (${targetUser.email})`,
        severity: 'critical'
      });
    }
  };

  // Export Audit Logs to CSV
  const handleExportAuditLogs = () => {
    let csv = 'Timestamp,Action,User,IP,Severity,Details\n';
    auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.action}","${l.userEmail}","${l.ip}","${l.severity}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Workbench_Security_Audit_Logs_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered users for master directory
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.techCallsign.toLowerCase().includes(q) ||
      u.registeredIp.toLowerCase().includes(q) ||
      (u.lastLoginIp || '').toLowerCase().includes(q);

    return matchesRole && matchesStatus && matchesQuery;
  });

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
      case 'pending': return <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">PENDING APPROVAL</span>;
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
              Manage technician authentication, approve new user registration requests with recorded IP addresses, assign roles, and audit security telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditLogs}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
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

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
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
          onClick={() => setActiveTab('users')}
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
          onClick={() => setActiveTab('audit')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-[#12161f]/80 backdrop-blur-md border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl relative"
                >
                  <div className="flex items-start justify-between gap-3">
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

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
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
                      <span className="text-teal-300 font-bold">{user.registeredIp}</span>
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
                      className="flex-1 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Access
                    </button>
                    <button
                      onClick={() => handleRejectUser(user.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

          {/* User Table */}
          <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4">TECHNICIAN</th>
                    <th className="py-3 px-4">ROLE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">REGISTERED IP</th>
                    <th className="py-3 px-4">LAST LOGIN IP</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
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
                        {user.registeredIp}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {user.lastLoginIp || 'Never logged in'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status === 'pending' ? (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              title="Approve User"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleSuspend(user.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
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
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & IP AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-[#0b0e14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
              <span className="text-slate-200 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Security Telemetry &amp; IP Access Log ({auditLogs.length} Events)
              </span>
              <button
                onClick={handleExportAuditLogs}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px]"
              >
                Download CSV
              </button>
            </div>

            <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto font-mono text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3.5 hover:bg-white/[0.02] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">[{log.timestamp}]</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        log.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-200 font-bold">{log.userEmail}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{log.details}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-teal-300 font-bold justify-end text-[11px]">
                      <Globe className="w-3 h-3" />
                      {log.ip}
                    </div>
                    <span className="text-[10px] text-slate-600 block max-w-[200px] truncate">{log.userAgent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
