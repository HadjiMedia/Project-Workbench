import React, { useState, useEffect } from 'react';
import { JobTicket, ShopSettings, InvoiceItem } from '../types';
import { DEFAULT_SHOP_SETTINGS, INITIAL_TICKETS } from '../data/sampleTickets';
import { Printer, Plus, Trash2, Settings, FileText, CheckCircle2, Shield, DollarSign, ArrowLeft } from 'lucide-react';

interface InvoiceGeneratorProps {
  initialTicket?: JobTicket | null;
  onBackToTickets?: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ initialTicket, onBackToTickets }) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem('wb_shop_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SHOP_SETTINGS;
    } catch {
      return DEFAULT_SHOP_SETTINGS;
    }
  });

  const [ticket, setTicket] = useState<JobTicket>(() => {
    return initialTicket || INITIAL_TICKETS[0];
  });

  const [documentMode, setDocumentMode] = useState<'invoice' | 'work_order'>('invoice');
  const [isShopSettingsOpen, setIsShopSettingsOpen] = useState(false);

  useEffect(() => {
    if (initialTicket) {
      setTicket(initialTicket);
    }
  }, [initialTicket]);

  const saveShopSettings = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
    localStorage.setItem('wb_shop_settings', JSON.stringify(newSettings));
    setIsShopSettingsOpen(false);
  };

  // Add line item
  const addItem = (type: 'part' | 'labor') => {
    const newItem: InvoiceItem = {
      id: 'item_' + Date.now(),
      type,
      description: type === 'part' ? 'New Hardware Component' : 'Technical Diagnostic & Repair Labor',
      partNumber: type === 'part' ? 'HW-GEN-01' : undefined,
      quantity: 1,
      unitPrice: type === 'part' ? 49.99 : 65.00
    };
    setTicket(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove line item
  const removeItem = (id: string) => {
    setTicket(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Update line item
  const updateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setTicket(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  // Calculations
  const partsSubtotal = ticket.items
    .filter(i => i.type === 'part')
    .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const laborSubtotal = ticket.items
    .filter(i => i.type === 'labor' || i.type === 'fee')
    .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const grossSubtotal = partsSubtotal + laborSubtotal;
  const taxableAmount = Math.max(0, partsSubtotal - (ticket.discountAmount || 0));
  const taxAmount = (taxableAmount * (ticket.taxRatePercent || shopSettings.defaultTaxRate)) / 100;
  const finalTotal = Math.max(0, grossSubtotal + taxAmount - (ticket.diagnosticFeeCredit || 0) - (ticket.discountAmount || 0));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print bg-[#12161f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onBackToTickets && (
            <button
              onClick={onBackToTickets}
              className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tickets
            </button>
          )}

          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setDocumentMode('invoice')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                documentMode === 'invoice' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer Invoice
            </button>
            <button
              onClick={() => setDocumentMode('work_order')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                documentMode === 'work_order' ? 'bg-sky-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bench Work Order
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsShopSettingsOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            Shop Branding
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="print-only-container bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 max-w-4xl mx-auto space-y-8 font-sans">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500" />
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-slate-950 tracking-tight">
                {shopSettings.shopName}
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">{shopSettings.shopAddress}</p>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Phone: {shopSettings.shopPhone} · Email: {shopSettings.shopEmail}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">Tax ID / License: {shopSettings.taxId}</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded bg-slate-900 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              {documentMode === 'invoice' ? 'TAX INVOICE & RECEIPT' : 'BENCH DIAGNOSTIC WORK ORDER'}
            </span>
            <div className="text-lg font-bold font-mono text-slate-900">
              #{ticket.ticketNumber}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Date: {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Status: <strong>{ticket.status.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Hardware Details Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">CLIENT DETAILS</span>
            <div className="font-bold text-sm text-slate-900">{ticket.customerName}</div>
            <div className="text-slate-600 font-mono">Phone: {ticket.customerPhone || 'N/A'}</div>
            <div className="text-slate-600 font-mono">Email: {ticket.customerEmail || 'N/A'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">EQUIPMENT SPECS</span>
            <div className="font-bold text-sm text-slate-900">{ticket.deviceBrandModel}</div>
            <div className="text-slate-600 font-mono">Serial / IMEI: {ticket.serialNumber}</div>
            <div className="text-slate-600 font-mono">
              Tech: {ticket.assignedTechnician} {documentMode === 'work_order' && `· PIN: ${ticket.passcodePin}`}
            </div>
          </div>
        </div>

        {/* Reported Complaint & Diagnostic Scope */}
        <div className="space-y-1 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">REPORTED ISSUE &amp; DIAGNOSTIC FINDINGS</span>
          <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans">
            {ticket.reportedIssue}
          </p>
        </div>

        {/* Itemized Table (Parts & Labor) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider">ITEMIZED BILLING BREAKDOWN</span>
            <div className="no-print flex gap-2">
              <button
                onClick={() => addItem('labor')}
                className="px-2.5 py-1 text-xs font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              >
                + Add Labor
              </button>
              <button
                onClick={() => addItem('part')}
                className="px-2.5 py-1 text-xs font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              >
                + Add Part
              </button>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-mono text-[11px]">
                <th className="py-2 px-2">TYPE</th>
                <th className="py-2 px-2">DESCRIPTION / PART #</th>
                <th className="py-2 px-2 text-center w-16">QTY</th>
                <th className="py-2 px-2 text-right w-24">RATE</th>
                <th className="py-2 px-2 text-right w-24">AMOUNT</th>
                <th className="no-print py-2 px-1 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ticket.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-2 font-mono text-[10px] uppercase font-bold text-slate-600">
                    {item.type}
                  </td>
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-0 font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded p-1"
                    />
                    {item.partNumber && (
                      <span className="text-[10px] font-mono text-slate-500 block pl-1">Part #: {item.partNumber}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-12 text-center font-mono bg-transparent border border-slate-200 rounded py-0.5"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-20 text-right font-mono bg-transparent border border-slate-200 rounded py-0.5 px-1"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                  <td className="no-print py-2.5 px-1 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Calculation Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t-2 border-slate-200">
          <div className="max-w-xs space-y-2 text-[11px] text-slate-500">
            <span className="font-mono uppercase font-bold text-slate-700 block">WARRANTY &amp; SERVICE TERMS</span>
            <p className="leading-relaxed">{shopSettings.warrantyDisclaimer}</p>
          </div>

          <div className="w-full sm:w-72 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Parts Subtotal:</span>
              <span>${partsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Labor &amp; Diagnostics:</span>
              <span>${laborSubtotal.toFixed(2)}</span>
            </div>
            {ticket.diagnosticFeeCredit > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Diagnostic Fee Credit:</span>
                <span>-${ticket.diagnosticFeeCredit.toFixed(2)}</span>
              </div>
            )}
            {ticket.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Applied:</span>
                <span>-${ticket.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax ({ticket.taxRatePercent || shopSettings.defaultTaxRate}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold font-mono text-slate-950 pt-2 border-t-2 border-slate-900">
              <span>TOTAL DUE:</span>
              <span className="text-slate-950">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Sign-off Block */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-6">
            <p className="text-[11px] text-slate-500">
              I authorize the diagnostic / repair work and acknowledge receipt of equipment:
            </p>
            <div className="border-b border-slate-400 pt-6"></div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Customer Signature</span>
              <span>Date</span>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[11px] text-slate-500">
              Certified Technician Verification &amp; Final Hardware Burn-In QA:
            </p>
            <div className="border-b border-slate-400 pt-6"></div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Technician Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>

      </div>

      {/* Shop Settings Modal */}
      {isShopSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white">Shop Branding &amp; Invoice Settings</h3>
              <button onClick={() => setIsShopSettingsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Repair Shop / Business Name</label>
                <input
                  type="text"
                  value={shopSettings.shopName}
                  onChange={e => setShopSettings(p => ({ ...p, shopName: e.target.value }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={shopSettings.shopPhone}
                    onChange={e => setShopSettings(p => ({ ...p, shopPhone: e.target.value }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Email</label>
                  <input
                    type="text"
                    value={shopSettings.shopEmail}
                    onChange={e => setShopSettings(p => ({ ...p, shopEmail: e.target.value }))}
                    className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={shopSettings.shopAddress}
                  onChange={e => setShopSettings(p => ({ ...p, shopAddress: e.target.value }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Warranty Disclaimer Text</label>
                <textarea
                  rows={3}
                  value={shopSettings.warrantyDisclaimer}
                  onChange={e => setShopSettings(p => ({ ...p, warrantyDisclaimer: e.target.value }))}
                  className="w-full bg-[#181d29] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsShopSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => saveShopSettings(shopSettings)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 text-slate-950"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
