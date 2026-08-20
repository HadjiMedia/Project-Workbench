import React, { useState } from 'react';
import { TabId, User, JobTicket, SecurityAuditLog } from '../types';
import { 
  Users, ClipboardList, ShieldAlert, AlertTriangle, CheckCircle2, 
  ArrowRight, Clock, UserCheck, ShieldCheck, Terminal, Zap, 
  Bookmark, Wrench, FileCode2, Cable, LayoutGrid, Sparkles, 
  ExternalLink, Search, Globe, Filter, Laptop, Monitor, Server, 
  Layers, Lock, Eye, AlertCircle, FileText
} from 'lucide-react';

interface OverviewDashboardProps {
  currentUser: User | null;
  users: User[];
  tickets: JobTicket[];
  auditLogs: SecurityAuditLog[];
  onNavigateTab: (tab: TabId) => void;
  onOpenInvoice: (ticket: JobTicket) => void;
  isOnline: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentUser,
  users = [],
  tickets = [],
  auditLogs = [],
  onNavigateTab,
  onOpenInvoice,
  isOnline
}) => {
  const [auditFilter, setAuditFilter] = useState<'critical_warning' | 'critical_only' | 'all'>('critical_warning');
  const [ticketFilter, setTicketFilter] = useState<'all_active' | 'urgent_only'>('all_active');

  // Compute metrics defensively
  const pendingUsers = (users || []).filter(u => u && u.status === 'pending');
  const activeUsers = (users || []).filter(u => u && u.status === 'active');
  
  // Active tickets = any ticket not Completed or Cancelled
  const activeTickets = (tickets || []).filter(t => t && t.status !== 'Completed' && t.status !== 'Cancelled');
  const urgentTickets = activeTickets.filter(t => t && (t.priority === 'Urgent' || t.priority === 'Critical'));
  const completedTickets = (tickets || []).filter(t => t && t.status === 'Completed');

  // Critical / Warning Audit logs
  const criticalLogs = (auditLogs || []).filter(l => l && l.severity === 'critical');
  const warningLogs = (auditLogs || []).filter(l => l && l.severity === 'warning');
  const filteredAuditLogs = (auditLogs || []).filter(l => {
    if (!l) return false;
    if (auditFilter === 'critical_only') return l.severity === 'critical';
    if (auditFilter === 'critical_warning') return l.severity === 'critical' || l.severity === 'warning';
    return true;
  }).slice(0, 6);

  // Status breakdown for active tickets
  const inDiagCount = activeTickets.filter(t => t && t.status === 'In Diagnostics').length;
  const inRepairCount = activeTickets.filter(t => t && t.status === 'Repair In Progress').length;
  const awaitingPartsCount = activeTickets.filter(t => t && t.status === 'Awaiting Parts').length;
  const testingQaCount = activeTickets.filter(t => t && t.status === 'Testing / QA').length;
  const readyPickupCount = activeTickets.filter(t => t && t.status === 'Ready for Pickup').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Welcome & System Status Banner */}
      <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Workbench Operations Overview
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser?.role ? currentUser.role.toUpperCase() : 'TECHNICIAN'}
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10">
                Callsign: <strong className="text-white">{currentUser?.techCallsign || 'TECH-01'}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time summary of workbench registrations, repair queue lifecycle, and security telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181d29] border border-white/10 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>IP: <strong className="text-teal-300">{currentUser?.lastLoginIp || '127.0.0.1'}</strong></span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'System Online' : 'Offline Cache Mode'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* THREE CORE SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARD 1: PENDING USER REGISTRATIONS */}
        <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-['Space_Grotesk']">Pending Registrations</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Technician Access Requests</p>
                </div>
              </div>

              {pendingUsers.length > 0 ? (
                <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold animate-pulse">
                  Action Required
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  All Cleared
                </span>
              )}
            </div>

            {/* Big Metric Display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl font-bold font-mono text-white tracking-tight">
                {pendingUsers.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                applicant{pendingUsers.length === 1 ? '' : 's'} awaiting approval
              </span>
            </div>

            {/* Pending Applicants List or Empty State */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {pendingUsers.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pendingUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="p-2.5 rounded-xl bg-[#181d29] border border-white/5 font-mono text-xs flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-200 truncate">{user.fullName}</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-400 font-semibold">{user.techCallsign}</span>
                          <span>·</span>
                          <span className="text-slate-500 uppercase">{user.role}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                          {user.registeredIp.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <UserCheck className="w-8 h-8 text-emerald-400/60 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">No pending user registrations</p>
                  <p className="text-[11px] text-slate-500">All technician accounts are verified and active.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer Action */}
          <div className="pt-3 border-t border-white/10">
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => onNavigateTab('admin')}
                className="w-full py-2 px-3 rounded-xl font-mono text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-amber-400/10 transition-all cursor-pointer"
              >
                <span>Manage Approvals in Admin Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Active Techs: <strong className="text-white">{activeUsers.length}</strong></span>
                <span className="text-amber-400/80">Admin access required to approve</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: ACTIVE TICKETS IN PROGRESS */}
        <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-sky-400/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <div className="p-2 rounded-xl bg-sky-400/10 border border-sky-400/20">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-['Space_Grotesk']">Active Repair Tickets</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Bench Hardware &amp; OS Queue</p>
                </div>
              </div>

              {urgentTickets.length > 0 ? (
                <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                  {urgentTickets.length} Urgent / Critical
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold">
                  Normal Flow
                </span>
              )}
            </div>

            {/* Big Metric Display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl font-bold font-mono text-white tracking-tight">
                {activeTickets.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                active repair{activeTickets.length === 1 ? '' : 's'} on bench
              </span>
            </div>

            {/* Status Breakdown Pills */}
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <div className="p-1.5 rounded-lg bg-[#181d29] border border-white/5 text-center">
                <div className="text-amber-300 font-bold">{inDiagCount}</div>
                <div className="text-slate-500 truncate">Diagnostics</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#181d29] border border-white/5 text-center">
                <div className="text-sky-300 font-bold">{inRepairCount}</div>
                <div className="text-slate-500 truncate">In Repair</div>
              </div>
              <div className="p-1.5 rounded-lg bg-[#181d29] border border-white/5 text-center">
                <div className="text-purple-300 font-bold">{awaitingPartsCount}</div>
                <div className="text-slate-500 truncate">Parts Waiting</div>
              </div>
            </div>

            {/* Active Tickets List */}
            <div className="space-y-2 pt-1">
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {activeTickets.slice(0, 3).map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => onNavigateTab('tickets')}
                    className="p-2.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 font-mono text-xs cursor-pointer transition-all group/item"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{ticket.ticketNumber}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          ticket.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          ticket.priority === 'Urgent' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-400 truncate font-semibold">
                        {ticket.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 mt-1 truncate">
                      {ticket.customerName} · {ticket.deviceBrandModel}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {ticket.reportedIssue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Footer Action */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('tickets')}
              className="flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-sky-500/10 transition-all cursor-pointer"
            >
              <span>Open Ticket Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('invoice')}
              className="py-2 px-3 rounded-xl font-mono text-xs bg-[#181d29] hover:bg-[#202738] text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
              title="Work Orders & Invoices"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Invoices</span>
            </button>
          </div>
        </div>

        {/* CARD 3: CRITICAL AUDIT LOG ENTRIES */}
        <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-rose-400/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-400/10 border border-rose-400/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-['Space_Grotesk']">Security &amp; Audit Trail</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Critical Security Logs</p>
                </div>
              </div>

              <div className="flex gap-1 font-mono text-[9px]">
                <button
                  onClick={() => setAuditFilter('critical_warning')}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    auditFilter === 'critical_warning' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  Alerts ({criticalLogs.length + warningLogs.length})
                </button>
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    auditFilter === 'all' ? 'bg-white/10 text-white font-bold' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  All ({auditLogs.length})
                </button>
              </div>
            </div>

            {/* Big Metric Display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl font-bold font-mono text-white tracking-tight">
                {criticalLogs.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                critical incident{criticalLogs.length === 1 ? '' : 's'} flagged ({warningLogs.length} warnings)
              </span>
            </div>

            {/* Live Audit Log Feed */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
                {filteredAuditLogs.length > 0 ? (
                  filteredAuditLogs.map(log => (
                    <div 
                      key={log.id} 
                      className={`p-2.5 rounded-xl border transition-all ${
                        log.severity === 'critical' 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                          : log.severity === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-[#181d29] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-[11px] truncate flex items-center gap-1">
                          {log.severity === 'critical' && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {log.timestamp.slice(11, 19)}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {log.details || `Triggered by ${log.userEmail}`}
                      </div>

                      <div className="text-[9px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span className="truncate">{log.userEmail}</span>
                        <span className="font-mono text-teal-400">{log.ip}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No critical security incidents recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer Action */}
          <div className="pt-3 border-t border-white/10">
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => onNavigateTab('admin')}
                className="w-full py-2 px-3 rounded-xl font-mono text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Inspect Full Audit Log in Admin Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Total Audit Events: <strong className="text-white">{auditLogs.length}</strong></span>
                <span className="text-emerald-400">🛡️ Tamper-Evident</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* QUICK WORKBENCH TOOL LAUNCHPAD */}
      <div className="bg-[#12161f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Workbench Diagnostics Launchpad</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct access to hardware calculation engines, firmware decoders, and script generation.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 hidden sm:inline-block">
            Press <kbd className="bg-[#181d29] px-1.5 py-0.5 rounded border border-white/10 text-white">Ctrl + K</kbd> to search everything
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          
          <button
            onClick={() => onNavigateTab('errors')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-rose-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <Terminal className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-rose-300 transition-colors">
              Windows Error Matrix
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              25+ BSOD &amp; Update Hex Codes with 1-click SFC / DISM generators
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('cheatsheets')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <Bookmark className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
              Printable Cheat Sheets
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              ASUS/Dell/HP BIOS keys, EZ Debug LEDs, JFP1 jumpers &amp; PDF desk print
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('techsuite')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-teal-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-teal-400 mb-2">
              <Wrench className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-teal-300 transition-colors">
              Technician Multi-Tool
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              IPv4 Subnet CIDR calculator, Web Audio BIOS beepers &amp; DNS pings
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('psu')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <Zap className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
              PSU &amp; Rail Calculator
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              12V / 5V / 3.3V power budget &amp; Multimeter DMM tolerance testing
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('scripts')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-sky-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-sky-400 mb-2">
              <FileCode2 className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
              Script Generator
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Automated Batch (.bat) and PowerShell (.ps1) maintenance suites
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('serial')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <Cable className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
              Web Serial POST Monitor
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Live hardware UART monitor for debug cards &amp; microcontrollers
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('motherboard')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-purple-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <LayoutGrid className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
              Motherboard Blueprint
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Interactive PCB hotspots, Clear CMOS pins &amp; VRM power phases
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('admin')}
            className="p-3.5 rounded-xl bg-[#181d29] hover:bg-[#202738] border border-white/5 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
              Admin Command Center
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              User approvals, role promotions, and complete audit log export
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
