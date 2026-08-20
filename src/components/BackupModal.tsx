import React, { useState } from 'react';
import { Download, Upload, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onRestoreComplete }) => {
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    try {
      const backupData = {
        app: 'Workbench Diagnostics & Repair Console',
        version: '3.0.0',
        exportedAt: new Date().toISOString(),
        tickets: JSON.parse(localStorage.getItem('wb_repair_tickets') || '[]'),
        shopSettings: JSON.parse(localStorage.getItem('wb_shop_settings') || '{}'),
        kbArticles: JSON.parse(localStorage.getItem('wb_kb_articles') || '[]'),
        customBoardImg: localStorage.getItem('wb_custom_board_img') || null
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Workbench_Full_Backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'ok', text: 'Backup JSON downloaded successfully!' });
    } catch (e: any) {
      setStatusMsg({ type: 'err', text: `Export failed: ${e.message}` });
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.tickets) localStorage.setItem('wb_repair_tickets', JSON.stringify(data.tickets));
        if (data.shopSettings) localStorage.setItem('wb_shop_settings', JSON.stringify(data.shopSettings));
        if (data.kbArticles) localStorage.setItem('wb_kb_articles', JSON.stringify(data.kbArticles));
        if (data.customBoardImg) localStorage.setItem('wb_custom_board_img', data.customBoardImg);

        setStatusMsg({ type: 'ok', text: 'All data, tickets, and knowledge bases restored!' });
        onRestoreComplete();
      } catch (err: any) {
        setStatusMsg({ type: 'err', text: 'Invalid JSON backup file structure.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white">
            System Data Backup &amp; Synchronization
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="text-slate-400">
          Export your entire customer job ticketing database, diagnostic logs, custom knowledge base articles, and shop configurations into an offline JSON archive.
        </p>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleExportJson}
            className="w-full py-3 rounded-xl font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
          >
            <Download className="w-4 h-4" /> Download Complete System JSON Backup
          </button>

          <label className="w-full py-3 rounded-xl font-mono font-bold bg-[#181d29] hover:bg-[#202738] text-white border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-sky-400" /> Restore from JSON Backup
            <input
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl font-mono text-[11px] ${statusMsg.type === 'ok' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-mono bg-white/5 text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
