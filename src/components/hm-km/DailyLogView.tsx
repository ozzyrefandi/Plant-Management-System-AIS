import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Gauge,
  Calendar,
  Clock,
  User,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { DailyHmKmLog, UnitMaster } from '../../types';
import { formatHmKm, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DailyLogViewProps {
  logs: DailyHmKmLog[];
  units: UnitMaster[];
  onAddLog: (log: Omit<DailyHmKmLog, 'id'>) => void;
  onUpdateLog: (id: string, log: Partial<DailyHmKmLog>) => void;
  onDeleteLog: (id: string) => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  logs,
  units,
  onAddLog,
  onUpdateLog,
  onDeleteLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyHmKmLog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    unitId: units[0]?.id || '',
    unitCode: units[0]?.unitCode || '',
    openingHmKm: 14800,
    closingHmKm: 14822,
    operator: 'Bambang Sudarsono',
    location: 'Pit Barat',
    shift: 'Shift 1 (Day)' as 'Shift 1 (Day)' | 'Shift 2 (Night)',
    remarks: 'Operasi lancar, tidak ada kendala.'
  });

  const dailyUsage = Math.max(0, formData.closingHmKm - formData.openingHmKm);

  const handleOpenAdd = () => {
    setEditingLog(null);
    const u = units[0];
    const curVal = u ? (u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent) : 1000;
    setFormData({
      date: new Date().toISOString().split('T')[0],
      unitId: u?.id || '',
      unitCode: u?.unitCode || '',
      openingHmKm: curVal,
      closingHmKm: curVal + (u?.paramType === 'KM' ? 250 : 20),
      operator: u?.operator || 'Operator Tambang',
      location: u?.location || 'Pit Barat',
      shift: 'Shift 1 (Day)',
      remarks: 'Pencatatan harian jam kerja / jarak tempuh.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (log: DailyHmKmLog) => {
    setEditingLog(log);
    setFormData({
      date: log.date,
      unitId: log.unitId,
      unitCode: log.unitCode,
      openingHmKm: log.openingHmKm,
      closingHmKm: log.closingHmKm,
      operator: log.operator,
      location: log.location,
      shift: log.shift,
      remarks: log.remarks
    });
    setIsFormOpen(true);
  };

  const handleUnitChange = (unitCode: string) => {
    const selected = units.find((u) => u.unitCode === unitCode);
    if (selected) {
      const curVal = selected.paramType === 'KM' ? selected.kmCurrent : selected.hmCurrent;
      setFormData({
        ...formData,
        unitId: selected.id,
        unitCode: selected.unitCode,
        openingHmKm: curVal,
        closingHmKm: curVal + (selected.paramType === 'KM' ? 300 : 22),
        operator: selected.operator || formData.operator,
        location: selected.location || formData.location
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usage = Math.max(0, formData.closingHmKm - formData.openingHmKm);

    if (editingLog) {
      onUpdateLog(editingLog.id, {
        ...formData,
        dailyUsage: usage
      });
    } else {
      onAddLog({
        ...formData,
        dailyUsage: usage
      });
    }
    setIsFormOpen(false);
  };

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUnit = selectedUnit ? l.unitCode === selectedUnit : true;
    return matchSearch && matchUnit;
  });

  const handleExportCsv = () => {
    const exportRows = filteredLogs.map((l) => ({
      Tanggal: l.date,
      UnitCode: l.unitCode,
      Shift: l.shift,
      Opening: l.openingHmKm,
      Closing: l.closingHmKm,
      DailyUsage: l.dailyUsage,
      Operator: l.operator,
      Lokasi: l.location,
      Catatan: l.remarks
    }));
    exportToCsv('Daily_HM_KM_Log_Mining', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            Daily HM / KM Log & Monitoring Pemakaian Harian
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan opening, closing, dan daily usage untuk kalkulasi PM & utilitas armada.
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
            <span>Input Log Harian</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari unit, operator, lokasi pit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Unit Armada</option>
            {units.map((u) => (
              <option key={u.id} value={u.unitCode}>
                {u.unitCode} ({u.type})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          Total {filteredLogs.length} Catatan Log
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3 text-right">Opening Meter</th>
                <th className="py-3 px-3 text-right">Closing Meter</th>
                <th className="py-3 px-3 text-right">Daily Usage</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3">Lokasi Pit</th>
                <th className="py-3 px-3">Catatan</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Belum ada data log harian yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const unit = units.find((u) => u.unitCode === log.unitCode);
                  const param = unit?.paramType || 'HM';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-300 font-mono-nums">
                        {log.date}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400 font-mono-nums">
                        {log.unitCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.shift.includes('Day') ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40' : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                        }`}>
                          {log.shift}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono-nums tabular-nums">
                        {formatHmKm(log.openingHmKm, param)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 font-mono-nums tabular-nums font-semibold">
                        {formatHmKm(log.closingHmKm, param)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold font-mono-nums tabular-nums">
                        +{formatHmKm(log.dailyUsage, param)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.operator}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.location}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[200px] truncate">
                        {log.remarks}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(log)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Edit Log"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(log.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Hapus Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Log */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingLog ? 'Edit Log Pemakaian Harian' : 'Input Log HM / KM Harian'}
        subtitle="Formula: Daily Usage = Closing HM/KM - Opening HM/KM dihitung otomatis."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pilih Unit *</label>
              <select
                required
                value={formData.unitCode}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.unitCode}>
                    {u.unitCode} - {u.type} ({u.paramType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Shift Kerja *</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Shift 1 (Day)">Shift 1 (Day)</option>
                <option value="Shift 2 (Night)">Shift 2 (Night)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operator *</label>
              <input
                required
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Opening Meter *</label>
              <input
                required
                type="number"
                value={formData.openingHmKm}
                onChange={(e) => setFormData({ ...formData, openingHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Closing Meter *</label>
              <input
                required
                type="number"
                value={formData.closingHmKm}
                onChange={(e) => setFormData({ ...formData, closingHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Auto Usage Banner */}
          <div className="bg-[#0a0f1d] p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Pemakaian Harian (Daily Usage):</span>
            <span className="text-base font-bold text-emerald-400 font-mono-nums">
              +{dailyUsage.toLocaleString('id-ID')}
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Lokasi Kerja Pit</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Operasi</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              {editingLog ? 'Simpan Perubahan' : 'Simpan Log'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteLog(deleteId);
        }}
        title="Hapus Catatan Log Harian"
        message="Yakin ingin menghapus catatan log ini? Hal ini dapat mempengaruhi perhitungan jam kerja harian."
      />
    </div>
  );
};
