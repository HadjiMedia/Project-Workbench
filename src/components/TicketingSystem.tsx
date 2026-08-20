import React, { useState, useEffect } from 'react';
import { JobTicket, TicketStatus, TicketPriority } from '../types';
import { INITIAL_TICKETS } from '../data/sampleTickets';
import { 
  Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, 
  Wrench, FileText, User, Smartphone, Laptop, Server, Trash2, Edit3, MessageSquare, CheckSquare
} from 'lucide-react';

interface TicketingSystemProps {
  onOpenInvoice: (ticket: JobTicket) => void;
}

export const TicketingSystem: React.FC<TicketingSystemProps> = ({ onOpenInvoice }) => {
  const [tickets, setTickets] = useState<JobTicket[]>(() => {
    try {
      const saved = localStorage.getItem('wb_repair_tickets');
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<JobTicket | null>(null);
  const [activeTicketDetail, setActiveTicketDetail] = useState<JobTicket | null>(null);

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
    assignedTechnician: 'Lead Technician',
    estimatedCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    internalNotes: ''
  });

  const [newNoteText, setNewNoteText] = useState('');

  // Persist tickets
  useEffect(() => {
    try {
      localStorage.setItem('wb_repair_tickets', JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed to save tickets', e);
    }
  }, [tickets]);

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
      case 'Critical': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">CRITICAL</span>;
      case 'Urgent': return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">URGENT</span>;
      case 'Normal': return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-400 border border-sky-500/30">NORMAL</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-500/15 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  // Quick Status Advance
  const handleQuickStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString() : t.completedAt
        };
      }
      return t;
    }));
    if (activeTicketDetail?.id === ticketId) {
      setActiveTicketDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Checklist toggle
  const toggleChecklistItem = (ticketId: string, itemKey: keyof JobTicket['diagnosticChecklist']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          diagnosticChecklist: {
            ...t.diagnosticChecklist,
            [itemKey]: !t.diagnosticChecklist[itemKey]
          }
        };
        if (activeTicketDetail?.id === ticketId) {
          setActiveTicketDetail(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Add diagnostic note
  const handleAddNote = (ticketId: string) => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: 'dn_' + Date.now(),
      timestamp: new Date().toLocaleString(),
      technician: 'Technician',
      text: newNoteText.trim()
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          diagnosticNotes: [...(t.diagnosticNotes || []), newNote]
        };
        if (activeTicketDetail?.id === ticketId) {
          setActiveTicketDetail(updated);
        }
        return updated;
      }
      return t;
    }));
    setNewNoteText('');
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
        physicalCondition: 'Good condition, no cracks.',
        accessoriesIncluded: 'Unit only',
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

  // Save ticket form
  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerName || !formState.reportedIssue) {
      alert('Please provide Customer Name and Reported Issue.');
      return;
    }

    if (editingTicket) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...(formState as JobTicket) } : t));
    } else {
      const newTicket: JobTicket = {
        id: 'tick_' + Date.now(),
        ticketNumber: formState.ticketNumber || `TICK-${1040 + tickets.length}`,
        customerName: formState.customerName || '',
        customerPhone: formState.customerPhone || '',
        customerEmail: formState.customerEmail || '',
        deviceType: formState.deviceType || 'Desktop PC',
        deviceBrandModel: formState.deviceBrandModel || 'Generic PC',
        serialNumber: formState.serialNumber || 'N/A',
        passcodePin: formState.passcodePin || 'None',
        physicalCondition: formState.physicalCondition || '',
        accessoriesIncluded: formState.accessoriesIncluded || 'None',
        reportedIssue: formState.reportedIssue || '',
        status: (formState.status as TicketStatus) || 'Received',
        priority: (formState.priority as TicketPriority) || 'Normal',
        assignedTechnician: formState.assignedTechnician || 'Technician',
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
      setTickets(prev => [newTicket, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete ticket
  const handleDeleteTicket = (id: string) => {
    if (confirm('Delete this ticket record?')) {
      setTickets(prev => prev.filter(t => t.id !== id));
      if (activeTicketDetail?.id === id) setActiveTicketDetail(null);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerPhone.toLowerCase().includes(q) ||
      t.deviceBrandModel.toLowerCase().includes(q) ||
      t.serialNumber.toLowerCase().includes(q) ||
      t.reportedIssue.toLowerCase().includes(q);

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)] animate-pulse" />
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Job Ticketing &amp; Customer Intake System
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                Phase 2 Workflow Suite
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track customer repair intakes, diagnostic logs, hardware checklist verification, and seamlessly pass tickets to invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Customer Intake
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket # (TICK-1042), customer name, serial, or model..."
              className="w-full bg-[#181d29] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 font-mono"
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
          </div>
        </div>
      </div>

      {/* Main Grid: Ticket Cards List on Left, Active Ticket Inspection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Ticket Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-[#12161f]/50 border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-slate-400 font-mono text-sm">No job tickets found.</p>
              <button
                onClick={() => openModal()}
                className="mt-3 text-xs text-amber-400 hover:underline font-mono"
              >
                + Create new intake ticket
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setActiveTicketDetail(ticket)}
                className={`bg-[#12161f]/80 backdrop-blur-md border rounded-2xl p-4 transition-all cursor-pointer space-y-3 ${
                  activeTicketDetail?.id === ticket.id
                    ? 'border-amber-500/70 shadow-lg shadow-amber-500/5 bg-[#181d29]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                      <span className="text-xs font-normal text-slate-400 font-mono ml-2">({ticket.customerPhone})</span>
                    </h4>

                    <p className="text-xs text-sky-300 font-mono">
                      {ticket.deviceBrandModel} · <span className="text-slate-400">S/N: {ticket.serialNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenInvoice(ticket)}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
                      title="Generate Printable Work Order & Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice
                    </button>
                    <button
                      onClick={() => openModal(ticket)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="Edit Ticket"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#181d29]/80 border border-white/5 rounded-xl p-2.5 text-xs text-slate-300 line-clamp-2">
                  <strong className="text-slate-400 font-mono uppercase text-[10px] block mb-0.5">Reported Issue:</strong>
                  {ticket.reportedIssue}
                </div>

                {/* Quick Status Dropdown & Checklist Summary */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <span>Advance Status:</span>
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
                    <span className="text-[10px] text-slate-500">Tech: {ticket.assignedTechnician}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Active Ticket Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeTicketDetail ? (
            <div className="bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-bold">{activeTicketDetail.ticketNumber}</span>
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    {activeTicketDetail.customerName}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenInvoice(activeTicketDetail)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Print Work Order / Invoice
                </button>
              </div>

              {/* Device Specs & Passcode */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#181d29] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-500 text-[10px] block">DEVICE / MODEL</span>
                  <span className="text-white font-bold">{activeTicketDetail.deviceBrandModel}</span>
                </div>
                <div className="bg-[#181d29] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-500 text-[10px] block">PIN / PASSCODE</span>
                  <span className="text-amber-300">{activeTicketDetail.passcodePin || 'None'}</span>
                </div>
              </div>

              {/* Hardware Quality & Diagnostic Checklist */}
              <div className="bg-[#181d29] p-3.5 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Hardware QA Diagnostic Checklist
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.postVerified || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'postVerified')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>POST Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.memTestPassed || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'memTestPassed')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>MemTest86 Pass</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.thermalStressPassed || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'thermalStressPassed')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>Thermal Stress OK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.osIntegrityRepaired || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'osIntegrityRepaired')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>OS Files Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.chassisCleaned || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'chassisCleaned')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>Chassis Cleaned</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={activeTicketDetail.diagnosticChecklist?.backupCreated || false}
                      onChange={() => toggleChecklistItem(activeTicketDetail.id, 'backupCreated')}
                      className="accent-emerald-400 rounded"
                    />
                    <span>Data Backup Done</span>
                  </label>
                </div>
              </div>

              {/* Technician Diagnostic Notes Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  Technician Notes &amp; Repair Log
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(activeTicketDetail.diagnosticNotes || []).map(note => (
                    <div key={note.id} className="bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span className="text-sky-400">{note.technician}</span>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote(activeTicketDetail.id)}
                    placeholder="Add timestamped bench note..."
                    className="flex-1 bg-[#181d29] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    onClick={() => handleAddNote(activeTicketDetail.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#12161f]/40 border border-white/5 rounded-2xl p-8 text-center text-slate-500 font-mono text-xs">
              Select any ticket on the left to inspect diagnostics, checklists, and notes.
            </div>
          )}
        </div>

      </div>

      {/* Intake / Edit Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                {editingTicket ? `Edit Ticket ${editingTicket.ticketNumber}` : 'New Customer Intake Work Order'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-4 text-xs">
              {/* Customer Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerName}
                    onChange={e => setFormState(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formState.customerPhone}
                    onChange={e => setFormState(p => ({ ...p, customerPhone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formState.customerEmail}
                    onChange={e => setFormState(p => ({ ...p, customerEmail: e.target.value }))}
                    placeholder="customer@email.com"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Device Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Device Form Factor</label>
                  <select
                    value={formState.deviceType}
                    onChange={e => setFormState(p => ({ ...p, deviceType: e.target.value as any }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Desktop PC">Desktop PC</option>
                    <option value="Gaming Rig">Gaming Rig</option>
                    <option value="Laptop">Laptop</option>
                    <option value="MacBook / iMac">MacBook / iMac</option>
                    <option value="Server / NAS">Server / NAS</option>
                    <option value="Console / Other">Console / Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Make &amp; Model Specs</label>
                  <input
                    type="text"
                    value={formState.deviceBrandModel}
                    onChange={e => setFormState(p => ({ ...p, deviceBrandModel: e.target.value }))}
                    placeholder="e.g. Dell XPS 15 9520"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Serial Number / Asset Tag</label>
                  <input
                    type="text"
                    value={formState.serialNumber}
                    onChange={e => setFormState(p => ({ ...p, serialNumber: e.target.value }))}
                    placeholder="SN-123456"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* PIN, Status, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Device PIN / Password</label>
                  <input
                    type="text"
                    value={formState.passcodePin}
                    onChange={e => setFormState(p => ({ ...p, passcodePin: e.target.value }))}
                    placeholder="e.g. 1234 or 'No password'"
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Initial Status</label>
                  <select
                    value={formState.status}
                    onChange={e => setFormState(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Priority Level</label>
                  <select
                    value={formState.priority}
                    onChange={e => setFormState(p => ({ ...p, priority: e.target.value as any }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical (Expedited)</option>
                  </select>
                </div>
              </div>

              {/* Reported Issue */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Customer Reported Issue / Complaint *</label>
                <textarea
                  required
                  rows={3}
                  value={formState.reportedIssue}
                  onChange={e => setFormState(p => ({ ...p, reportedIssue: e.target.value }))}
                  placeholder="Detail symptoms, error codes, when it crashes, data backup requirements..."
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl p-3 text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
                >
                  {editingTicket ? 'Save Changes' : 'Create Job Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
