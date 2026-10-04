import React, { useState } from 'react';
import {
  History,
  Plus,
  Search,
  Download,
  Clock,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WoLog, WorkOrder } from '../../types';
import { exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';

interface WoLogViewProps {
  woLogs: WoLog[];
  workOrders: WorkOrder[];
  onAddLog: (log: Omit<WoLog, 'id'>) => void;
}

export const WoLogView: React.FC<WoLogViewProps> = ({
  woLogs,
  workOrders,
  onAddLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWo, setSelectedWo] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    woId: workOrders[0]?.id || '',
    woNumber: workOrders[0]?.woNumber || '',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    activity: 'Repair Completed',
    user: 'Irwan Setiawan (Supervisor)',
    notes: 'Unit telah lolos tes fungsi dan siap dilepas ke pit.'
  });

  const handleOpenAdd = () => {
    const wo = workOrders[0];
    setFormData({
      woId: wo?.id || '',
      woNumber: wo?.woNumber || '',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      activity: 'Inspection Update',
      user: 'Supervisor Lapangan',
      notes: 'Pemeriksaan lanjutan komponen.'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog(formData);
    setIsFormOpen(false);
  };

  const filteredLogs = woLogs.filter((log) => {
    const matchSearch =
      log.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchWo = selectedWo ? log.woNumber === selectedWo : true;
    return matchSearch && matchWo;
  });

  const handleExportCsv = () => {
    const exportRows = filteredLogs.map((l) => ({
      Timestamp: l.timestamp,
      NoWO: l.woNumber,
      Aktivitas: l.activity,
      User: l.user,
      Catatan: l.notes || ''
    }));
    exportToCsv('Work_Order_Activity_Audit_Log', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            WO Log & Timeline Histori Aktivitas Maintenance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail setiap tahapan penanganan unit mulai dari tiket dibuat hingga unit dirilis ke operasional tambang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-950 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Aktivitas Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aktivitas, user, nomor WO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedWo}
            onChange={(e) => setSelectedWo(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Dokumen WO</option>
            {workOrders.map((w) => (
              <option key={w.id} value={w.woNumber}>
                {w.woNumber} - {w.unitCode} ({w.failure})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          {filteredLogs.length} Catatan Histori
        </div>
      </div>

      {/* Interactive Timeline View */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-400 text-xs py-8">
              Belum ada riwayat aktivitas yang sesuai pencarian.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-4 border-[#111827] group-hover:scale-125 transition-transform"></div>

                <div className="bg-[#0f172a] border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        {log.activity}
                      </span>
                      <span className="px-2 py-0.2 bg-amber-950/60 border border-amber-800/60 text-amber-400 font-bold rounded text-[10px] font-mono-nums">
                        {log.woNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    {log.notes}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <User className="w-3 h-3" />
                    <span>Oleh: <strong className="text-slate-300">{log.user}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Activity */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Catat Riwayat Aktivitas WO"
        subtitle="Dokumentasikan tindakan teknis untuk audit trail dan pelaporan manajemen."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Work Order *</label>
            <select
              required
              value={formData.woNumber}
              onChange={(e) => {
                const wo = workOrders.find((w) => w.woNumber === e.target.value);
                setFormData({
                  ...formData,
                  woId: wo?.id || '',
                  woNumber: e.target.value
                });
              }}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {workOrders.map((w) => (
                <option key={w.id} value={w.woNumber}>
                  {w.woNumber} ({w.unitCode} - {w.failure})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Aktivitas / Milestones *</label>
            <input
              required
              type="text"
              placeholder="Unit Inspected, Part Arrived, Repair Started, Testing Completed"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Waktu Aktivitas *</label>
            <input
              required
              type="text"
              value={formData.timestamp}
              onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">User / Pelapor *</label>
            <input
              required
              type="text"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi Aktivitas & Hasil</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              Simpan Aktivitas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
