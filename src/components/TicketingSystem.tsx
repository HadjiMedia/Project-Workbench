import React, { useState, useEffect, useMemo } from 'react';
import { JobTicket, TicketStatus, TicketPriority } from '../types';
import { 
  Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, 
  Wrench, FileText, User, Smartphone, Laptop, Server, Trash2, Edit3, 
  CheckSquare, Square, MinusSquare, Sparkles, RefreshCw, AlertTriangle,
  ChevronDown, ArrowUpDown, Tag, CheckCheck, XCircle, ShieldCheck
} from 'lucide-react';

interface TicketingSystemProps {
  onOpenInvoice: (ticket: JobTicket) => void;
  tickets: JobTicket[];
  onUpdateTickets?: (tickets: JobTicket[]) => void;
  onSaveTicket?: (ticket: JobTicket) => Promise<void>;
  onDeleteTicket?: (ticketId: string) => Promise<void>;
  onDeleteTickets?: (ticketIds: string[]) => Promise<void>;
}

export const TicketingSystem: React.FC<TicketingSystemProps> = ({ 
  onOpenInvoice,
  tickets = [],
  onUpdateTickets,
  onSaveTicket,
  onDeleteTicket,
  onDeleteTickets
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  
  // Modal & Detail states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<JobTicket | null>(null);
  const [activeTicketDetail, setActiveTicketDetail] = useState<JobTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<JobTicket | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Bulk Selection State
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [isBulkStatusDropdownOpen, setIsBulkStatusDropdownOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [formState, setFormState] = useState<Partial<JobTicket>>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: 'Desktop PC',
    deviceBrandModel: '',
    serialNumber: '',
    passcodePin: '',
    physicalCondition: '',
    accessoriesIncluded: '',
    reportedIssue: '',
    status: 'Received',
    priority: 'Normal',
    assignedTechnician: 'Bench Tech',
    estimatedCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    internalNotes: ''
  });

  const [newNoteText, setNewNoteText] = useState('');

  const statusList: TicketStatus[] = [
    'Received',
    'In Diagnostics',
    'Awaiting Parts',
    'Repair In Progress',
    'Testing / QA',
    'Ready for Pickup',
    'Completed',
    'Cancelled'
  ];

  // Update active detail if tickets change from Cloud Firestore sync
  useEffect(() => {
    if (activeTicketDetail) {
      const refreshed = tickets.find(t => t.id === activeTicketDetail.id);
      if (refreshed) {
        setActiveTicketDetail(refreshed);
      } else {
        setActiveTicketDetail(null);
      }
    }
  }, [tickets]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Received': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'In Diagnostics': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Awaiting Parts': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Repair In Progress': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'Testing / QA': return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'Ready for Pickup': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Completed': return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      case 'Cancelled': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'Critical': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">CRITICAL</span>;
      case 'Urgent': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">URGENT</span>;
      case 'Normal': return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-400 border border-sky-500/30">NORMAL</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-500/15 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return (tickets || []).filter(t => {
      if (!t) return false;
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.customerPhone && t.customerPhone.toLowerCase().includes(q)) ||
        (t.deviceBrandModel && t.deviceBrandModel.toLowerCase().includes(q)) ||
        (t.serialNumber && t.serialNumber.toLowerCase().includes(q)) ||
        (t.reportedIssue && t.reportedIssue.toLowerCase().includes(q));

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, selectedStatus, selectedPriority, searchQuery]);

  // Bulk Selection Helpers
  const visibleTicketIds = useMemo(() => filteredTickets.map(t => t.id), [filteredTickets]);
  const isAllVisibleSelected = visibleTicketIds.length > 0 && visibleTicketIds.every(id => selectedTicketIds.has(id));
  const isSomeVisibleSelected = visibleTicketIds.some(id => selectedTicketIds.has(id)) && !isAllVisibleSelected;

  const handleToggleSelectTicket = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      setSelectedTicketIds(prev => {
        const next = new Set(prev);
        visibleTicketIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedTicketIds(prev => {
        const next = new Set(prev);
        visibleTicketIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedTicketIds(new Set());
  };

  // Quick Status Advance & Cloud Sync
  const handleQuickStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;

    const updated: JobTicket = {
      ...target,
      status: newStatus,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : target.completedAt
    };

    if (onSaveTicket) {
      await onSaveTicket(updated);
    } else if (onUpdateTickets) {
      onUpdateTickets(tickets.map(t => t.id === ticketId ? updated : t));
    }

    showToast(`Status updated to "${newStatus}" for ${target.ticketNumber}`);
  };

  // Checklist toggle & Cloud Sync
  const toggleChecklistItem = async (ticketId: string, itemKey: keyof JobTicket['diagnosticChecklist']) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;

    const currentChecklist = target.diagnosticChecklist || {
      postVerified: false,
      memTestPassed: false,
      thermalStressPassed: false,
      osIntegrityRepaired: false,
      chassisCleaned: false,
      backupCreated: false
    };

    const updated: JobTicket = {
      ...target,
      diagnosticChecklist: {
        ...currentChecklist,
        [itemKey]: !currentChecklist[itemKey]
      }
    };

    if (onSaveTicket) {
      await onSaveTicket(updated);
    } else if (onUpdateTickets) {
      onUpdateTickets(tickets.map(t => t.id === ticketId ? updated : t));
    }
  };

  // Add diagnostic note & Cloud Sync
  const handleAddNote = async (ticketId: string) => {
    if (!newNoteText.trim()) return;
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;

    const newNote = {
      id: 'dn_' + Date.now(),
      timestamp: new Date().toLocaleString(),
      technician: 'Technician',
      text: newNoteText.trim()
    };

    const updated: JobTicket = {
      ...target,
      diagnosticNotes: [...(target.diagnosticNotes || []), newNote]
    };

    if (onSaveTicket) {
      await onSaveTicket(updated);
    } else if (onUpdateTickets) {
      onUpdateTickets(tickets.map(t => t.id === ticketId ? updated : t));
    }

    setNewNoteText('');
    showToast('Diagnostic log entry saved to Cloud.');
  };

  // Open Create/Edit Modal
  const openModal = (ticket?: JobTicket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormState(ticket);
    } else {
      setEditingTicket(null);
      const nextNum = 'TICK-' + (1040 + tickets.length + Math.floor(Math.random() * 10));
      setFormState({
        ticketNumber: nextNum,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deviceType: 'Desktop PC',
        deviceBrandModel: '',
        serialNumber: '',
        passcodePin: '',
        physicalCondition: 'Good condition, no chassis damage.',
        accessoriesIncluded: 'Power supply cable',
        reportedIssue: '',
        status: 'Received',
        priority: 'Normal',
        assignedTechnician: 'Bench Tech',
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        internalNotes: '',
        diagnosticChecklist: {
          postVerified: false,
          memTestPassed: false,
          thermalStressPassed: false,
          osIntegrityRepaired: false,
          chassisCleaned: false,
          backupCreated: false
        },
        items: [
          { id: 'i1', type: 'labor', description: 'Hardware & OS Diagnostic Inspection', quantity: 1, unitPrice: 49.00 }
        ],
        diagnosticFeeCredit: 0,
        discountAmount: 0,
        taxRatePercent: 8.25
      });
    }
    setIsModalOpen(true);
  };

  // Save ticket form & Push to Cloud
  const handleSaveTicketForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerName || !formState.reportedIssue) {
      showToast('⚠️ Please provide Customer Name and Reported Issue.');
      return;
    }

    if (editingTicket) {
      const updated: JobTicket = {
        ...editingTicket,
        ...(formState as JobTicket)
      };

      if (onSaveTicket) {
        await onSaveTicket(updated);
      } else if (onUpdateTickets) {
        onUpdateTickets(tickets.map(t => t.id === editingTicket.id ? updated : t));
      }
      showToast(`Work order ${updated.ticketNumber} updated in Cloud!`);
    } else {
      const newTicket: JobTicket = {
        id: 'tick_' + Date.now(),
        ticketNumber: formState.ticketNumber || `TICK-${1040 + tickets.length}`,
        customerName: formState.customerName || '',
        customerPhone: formState.customerPhone || '',
        customerEmail: formState.customerEmail || '',
        deviceType: formState.deviceType || 'Desktop PC',
        deviceBrandModel: formState.deviceBrandModel || 'Generic System',
        serialNumber: formState.serialNumber || 'N/A',
        passcodePin: formState.passcodePin || 'None',
        physicalCondition: formState.physicalCondition || '',
        accessoriesIncluded: formState.accessoriesIncluded || 'None',
        reportedIssue: formState.reportedIssue || '',
        status: (formState.status as TicketStatus) || 'Received',
        priority: (formState.priority as TicketPriority) || 'Normal',
        assignedTechnician: formState.assignedTechnician || 'Bench Tech',
        createdAt: new Date().toISOString(),
        estimatedCompletionDate: formState.estimatedCompletionDate || new Date().toISOString().slice(0, 10),
        internalNotes: formState.internalNotes || '',
        diagnosticNotes: [],
        diagnosticChecklist: formState.diagnosticChecklist || {
          postVerified: false,
          memTestPassed: false,
          thermalStressPassed: false,
          osIntegrityRepaired: false,
          chassisCleaned: false,
          backupCreated: false
        },
        items: formState.items || [
          { id: 'i1', type: 'labor', description: 'Standard Diagnostic Inspection', quantity: 1, unitPrice: 49.00 }
        ],
        diagnosticFeeCredit: formState.diagnosticFeeCredit || 0,
        discountAmount: formState.discountAmount || 0,
        taxRatePercent: formState.taxRatePercent || 8.25
      };

      if (onSaveTicket) {
        await onSaveTicket(newTicket);
      } else if (onUpdateTickets) {
        onUpdateTickets([newTicket, ...tickets]);
      }
      showToast(`🎉 New ticket ${newTicket.ticketNumber} created and synced to all technicians!`);
    }

    setIsModalOpen(false);
  };

  // Single Ticket Delete with Cloud Deletion
  const handleConfirmSingleDelete = async () => {
    if (!ticketToDelete) return;
    const target = ticketToDelete;

    if (onDeleteTicket) {
      await onDeleteTicket(target.id);
    } else if (onUpdateTickets) {
      onUpdateTickets(tickets.filter(t => t.id !== target.id));
    }

    if (activeTicketDetail?.id === target.id) {
      setActiveTicketDetail(null);
    }

    setSelectedTicketIds(prev => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });

    setTicketToDelete(null);
    showToast(`🗑️ Ticket ${target.ticketNumber} permanently deleted from Cloud database.`);
  };

  // Bulk Ticket Delete with Cloud Deletion
  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedTicketIds);
    if (ids.length === 0) return;

    if (onDeleteTickets) {
      await onDeleteTickets(ids);
    } else if (onDeleteTicket) {
      for (const id of ids) await onDeleteTicket(id);
    } else if (onUpdateTickets) {
      onUpdateTickets(tickets.filter(t => !selectedTicketIds.has(t.id)));
    }

    if (activeTicketDetail && selectedTicketIds.has(activeTicketDetail.id)) {
      setActiveTicketDetail(null);
    }

    setIsBulkDeleteModalOpen(false);
    setSelectedTicketIds(new Set());
    showToast(`🗑️ Successfully deleted ${ids.length} tickets from Cloud database.`);
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus: TicketStatus) => {
    const ids = Array.from(selectedTicketIds);
    if (ids.length === 0) return;

    const updatedTickets = tickets.map(t => {
      if (selectedTicketIds.has(t.id)) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString() : t.completedAt
        };
      }
      return t;
    });

    if (onUpdateTickets) {
      onUpdateTickets(updatedTickets);
    }

    setIsBulkStatusDropdownOpen(false);
    setSelectedTicketIds(new Set());
    showToast(`Updated status to "${newStatus}" for ${ids.length} tickets.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Live Cloud Sync Animation */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
              </div>
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Job Ticketing &amp; Intake System
              </h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
                Real-Time Cloud Synced
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track customer intakes, hardware checklist verification, and seamlessly pass tickets to invoices. Deletions and updates synchronize instantly across all devices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal()}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Customer Intake
            </button>
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket # (TICK-1042), customer name, serial, or model..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
            >
              <option value="All">All Statuses ({tickets.length})</option>
              {statusList.map(s => (
                <option key={s} value={s}>{s} ({tickets.filter(t => t.status === s).length})</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global Feedback Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#181d29] border border-amber-400/50 text-slate-200 font-mono text-xs flex items-center justify-between gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* STICKY BULK ACTION BAR (Shows when tickets are selected) */}
      {selectedTicketIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-[#0f141f]/95 backdrop-blur-xl border-2 border-indigo-400/60 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.2)] animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckSquare className="w-4 h-4" />
                <span>{selectedTicketIds.size} Ticket{selectedTicketIds.size > 1 ? 's' : ''} Selected</span>
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
              {/* Advance Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBulkStatusDropdownOpen(!isBulkStatusDropdownOpen)}
                  className="px-3 py-2 rounded-xl text-xs font-mono bg-[#181d29] hover:bg-[#202738] text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Set Status</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isBulkStatusDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#141924] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                    {statusList.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleBulkStatusChange(s)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk Delete Trigger */}
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete ({selectedTicketIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Ticket Cards List on Left, Active Ticket Inspection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Ticket Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Header Select All Bar */}
          {filteredTickets.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1 text-xs font-mono text-slate-400">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 hover:text-white cursor-pointer"
              >
                {isAllVisibleSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                ) : isSomeVisibleSelected ? (
                  <MinusSquare className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Select All ({filteredTickets.length})</span>
              </button>
              <span>Showing {filteredTickets.length} of {tickets.length} total</span>
            </div>
          )}

          {filteredTickets.length === 0 ? (
            <div className="bg-[#12161f]/50 border border-white/5 rounded-2xl p-12 text-center space-y-3">
              <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-mono text-sm">No job tickets found.</p>
              <button
                onClick={() => openModal()}
                className="text-xs text-amber-400 hover:underline font-mono cursor-pointer"
              >
                + Create new intake ticket
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicketIds.has(ticket.id);
              const isActive = activeTicketDetail?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketDetail(ticket)}
                  className={`backdrop-blur-md rounded-2xl p-4 transition-all duration-200 cursor-pointer space-y-3 relative border ${
                    isActive
                      ? 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-[#181d29]'
                      : isSelected
                      ? 'border-indigo-500/60 bg-indigo-500/[0.04]'
                      : 'bg-[#12161f]/80 border-white/10 hover:border-white/25 hover:bg-[#151a24]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectTicket(ticket.id, e)}
                        className="mt-1 text-slate-400 hover:text-indigo-400 cursor-pointer p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                            {ticket.ticketNumber}
                          </span>
                          {getPriorityBadge(ticket.priority)}
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] pt-1">
                          {ticket.customerName}
                          <span className="text-xs font-normal text-slate-400 font-mono ml-2">({ticket.customerPhone || 'No Phone'})</span>
                        </h4>

                        <p className="text-xs text-sky-300 font-mono">
                          {ticket.deviceBrandModel || 'Hardware'} · <span className="text-slate-400">S/N: {ticket.serialNumber || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenInvoice(ticket)}
                        className="px-2.5 py-1 text-xs font-mono rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="Generate Printable Work Order & Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Invoice
                      </button>
                      <button
                        onClick={() => openModal(ticket)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                        title="Edit Ticket"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTicketToDelete(ticket)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                        title="Delete Ticket from Cloud"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#181d29]/80 border border-white/5 rounded-xl p-2.5 text-xs text-slate-300 line-clamp-2 font-sans">
                    <strong className="text-slate-400 font-mono uppercase text-[10px] block mb-0.5">Reported Issue:</strong>
                    {ticket.reportedIssue}
                  </div>

                  {/* Quick Status Dropdown & Checklist Summary */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <span>Status:</span>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value as TicketStatus)}
                        className="bg-black/40 border border-white/15 rounded-lg px-2 py-0.5 text-xs text-white focus:border-amber-400"
                      >
                        {statusList.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Tech: {ticket.assignedTechnician || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Active Ticket Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeTicketDetail ? (
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 sticky top-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-bold">{activeTicketDetail.ticketNumber}</span>
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    {activeTicketDetail.customerName}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenInvoice(activeTicketDetail)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Print Invoice
                </button>
              </div>

              {/* Device Specs & Passcode */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#181d29] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-500 text-[10px] block">DEVICE / MODEL</span>
                  <span className="text-white font-bold">{activeTicketDetail.deviceBrandModel || 'N/A'}</span>
                </div>
                <div className="bg-[#181d29] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-500 text-[10px] block">PIN / PASSCODE</span>
                  <span className="text-amber-300">{activeTicketDetail.passcodePin || 'None'}</span>
                </div>
              </div>

              {/* Hardware Quality & Diagnostic Checklist */}
              <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 font-bold">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Hardware QA Diagnostic Checklist
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.postVerified || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'postVerified')}
                      className="accent-amber-400 rounded"
                    />
                    <span>POST Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.memTestPassed || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'memTestPassed')}
                      className="accent-amber-400 rounded"
                    />
                    <span>MemTest Passed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.thermalStressPassed || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'thermalStressPassed')}
                      className="accent-amber-400 rounded"
                    />
                    <span>Thermal Stress</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.osIntegrityRepaired || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'osIntegrityRepaired')}
                      className="accent-amber-400 rounded"
                    />
                    <span>OS Repaired</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.chassisCleaned || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'chassisCleaned')}
                      className="accent-amber-400 rounded"
                    />
                    <span>Dust Cleaned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.backupCreated || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'backupCreated')}
                      className="accent-amber-400 rounded"
                    />
                    <span>Data Backup</span>
                  </label>
                </div>
              </div>

              {/* Real-time Diagnostic Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                  <span>Diagnostic Log / Notes</span>
                  <span className="text-[10px] text-slate-500">{(activeTicketDetail.diagnosticNotes || []).length} logs</span>
                </h4>
                
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(activeTicketDetail.diagnosticNotes || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No technician notes logged yet.</p>
                  ) : (
                    activeTicketDetail.diagnosticNotes?.map((n) => (
                      <div key={n.id} className="bg-[#181d29] p-2 rounded-lg border border-white/5 text-xs font-mono space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{n.technician}</span>
                          <span>{n.timestamp}</span>
                        </div>
                        <p className="text-slate-200">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote(activeTicketDetail.id)}
                    placeholder="Log technical finding or test result..."
                    className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 font-mono"
                  />
                  <button
                    onClick={() => handleAddNote(activeTicketDetail.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                  >
                    Log
                  </button>
                </div>
              </div>

              {/* Danger Zone: Delete Ticket */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Cloud ID: {activeTicketDetail.id}</span>
                <button
                  onClick={() => setTicketToDelete(activeTicketDetail)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#12161f]/50 border border-white/5 rounded-2xl p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-mono text-xs">Select any job ticket from the list to inspect diagnostic logs, checklist items, and specs.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f141f] border border-white/15 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                  {editingTicket ? `Edit Ticket ${editingTicket.ticketNumber}` : 'New Customer Intake Work Order'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Hardware repair diagnostics &amp; work order creation</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTicketForm} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerName || ''}
                    onChange={e => setFormState(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Customer Phone Number</label>
                  <input
                    type="text"
                    value={formState.customerPhone || ''}
                    onChange={e => setFormState(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="e.g. (555) 019-2834"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Device Brand &amp; Model *</label>
                  <input
                    type="text"
                    required
                    value={formState.deviceBrandModel || ''}
                    onChange={e => setFormState(prev => ({ ...prev, deviceBrandModel: e.target.value }))}
                    placeholder="e.g. Dell XPS 15 9520"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Serial Number / Service Tag</label>
                  <input
                    type="text"
                    value={formState.serialNumber || ''}
                    onChange={e => setFormState(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="e.g. SN-89218410"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Device PIN / Unlock Passcode</label>
                  <input
                    type="text"
                    value={formState.passcodePin || ''}
                    onChange={e => setFormState(prev => ({ ...prev, passcodePin: e.target.value }))}
                    placeholder="e.g. 1289 or User1234"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Priority Level</label>
                  <select
                    value={formState.priority || 'Normal'}
                    onChange={e => setFormState(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Reported Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formState.reportedIssue || ''}
                  onChange={e => setFormState(prev => ({ ...prev, reportedIssue: e.target.value }))}
                  placeholder="Describe failure symptoms, customer report, BSOD codes, liquid exposure, etc..."
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  {editingTicket ? 'Save Changes' : 'Create & Sync Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE TICKET DELETE CONFIRMATION MODAL */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Delete Ticket {ticketToDelete.ticketNumber}?
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                This will permanently remove the ticket for <strong className="text-white">{ticketToDelete.customerName}</strong> ({ticketToDelete.deviceBrandModel}) from the Cloud database. All other technicians will immediately see it removed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK TICKETS DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Delete {selectedTicketIds.size} Selected Tickets?
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                These records will be permanently purged from the shared Cloud Firestore database and removed across all connected devices.
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
                Delete All {selectedTicketIds.size}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
