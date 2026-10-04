import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import { PmSchedule, UnitMaster, PmStatus } from '../../types';
import { formatHmKm, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PmManagementViewProps {
  pmSchedules: PmSchedule[];
  units: UnitMaster[];
  onAddPm: (pm: Omit<PmSchedule, 'id'>) => void;
  onUpdatePm: (id: string, pm: Partial<PmSchedule>) => void;
  onDeletePm: (id: string) => void;
  onCompletePm: (id: string) => void;
}

const PM_INTERVALS_HM = [250, 500, 1000, 2000, 4000];
const PM_INTERVALS_KM = [5000, 10000, 20000];

export const PmManagementView: React.FC<PmManagementViewProps> = ({
  pmSchedules,
  units,
  onAddPm,
  onUpdatePm,
  onDeletePm,
  onCompletePm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPm, setEditingPm] = useState<PmSchedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    unitId: units[0]?.id || '',
    unitCode: units[0]?.unitCode || '',
    pmType: 'PM 250',
    interval: 250,
    lastPmHmKm: 14750,
    currentHmKm: 14850,
    nextPmHmKm: 15000,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    pic: 'Joko Prabowo',
    remarks: 'Pergantian oli mesin & filter reguler.'
  });

  const handleOpenAdd = () => {
    setEditingPm(null);
    const u = units[0];
    const isKm = u?.paramType === 'KM';
    const curVal = isKm ? u.kmCurrent : (u?.hmCurrent || 5000);
    const interval = isKm ? 10000 : 250;
    const nextVal = Math.ceil(curVal / interval) * interval;
    const lastVal = nextVal - interval;

    setFormData({
      unitId: u?.id || '',
      unitCode: u?.unitCode || '',
      pmType: isKm ? 'PM 10,000 KM' : 'PM 250',
      interval: interval,
      lastPmHmKm: lastVal,
      currentHmKm: curVal,
      nextPmHmKm: nextVal,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      pic: u?.mechanic || 'Mekanik Plant',
      remarks: 'Jadwal PM terencana rutin.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pm: PmSchedule) => {
    setEditingPm(pm);
    setFormData({
      unitId: pm.unitId,
      unitCode: pm.unitCode,
      pmType: pm.pmType,
      interval: pm.interval,
      lastPmHmKm: pm.lastPmHmKm,
      currentHmKm: pm.currentHmKm,
      nextPmHmKm: pm.nextPmHmKm,
      dueDate: pm.dueDate,
      pic: pm.pic,
      remarks: pm.remarks
    });
    setIsFormOpen(true);
  };

  const handleUnitSelect = (unitCode: string) => {
    const selected = units.find((u) => u.unitCode === unitCode);
    if (selected) {
      const isKm = selected.paramType === 'KM';
      const curVal = isKm ? selected.kmCurrent : selected.hmCurrent;
      const interval = isKm ? 10000 : 250;
      const nextVal = Math.ceil(curVal / interval) * interval;
      const lastVal = nextVal - interval;

      setFormData({
        ...formData,
        unitId: selected.id,
        unitCode: selected.unitCode,
        pmType: isKm ? `PM ${interval.toLocaleString('id-ID')} KM` : `PM ${interval}`,
        interval: interval,
        lastPmHmKm: lastVal,
        currentHmKm: curVal,
        nextPmHmKm: nextVal,
        pic: selected.mechanic || formData.pic
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = formData.nextPmHmKm - formData.currentHmKm;
    const selectedUnit = units.find((u) => u.unitCode === formData.unitCode);
    const isKm = selectedUnit?.paramType === 'KM';

    let status: PmStatus = 'SAFE';
    if (remaining <= 0) status = 'OVERDUE';
    else if (remaining <= (isKm ? 1000 : 50)) status = 'DUE SOON';

    if (editingPm) {
      onUpdatePm(editingPm.id, {
        ...formData,
        remaining,
        status
      });
    } else {
      onAddPm({
        ...formData,
        remaining,
        status
      });
    }
    setIsFormOpen(false);
  };

  const filteredPms = pmSchedules.filter((pm) => {
    const matchSearch =
      pm.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.pmType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pm.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus ? pm.status === selectedStatus : true;
    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    const exportRows = filteredPms.map((p) => ({
      UnitCode: p.unitCode,
      PMType: p.pmType,
      Interval: p.interval,
      LastPM: p.lastPmHmKm,
      CurrentMeter: p.currentHmKm,
      NextPM: p.nextPmHmKm,
      Remaining: p.remaining,
      DueDate: p.dueDate,
      PIC: p.pic,
      Status: p.status,
      Catatan: p.remarks
    }));
    exportToCsv('Jadwal_Preventive_Maintenance', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-400" />
            PM Management (Preventive Maintenance Planning)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengelolaan jadwal servis berkala berbasis HM (250/500/1000/2000) dan KM (5000/10000/20000).
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
            <span>Buat Jadwal PM</span>
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Terjadwal</span>
          <div className="text-2xl font-black text-white font-mono-nums mt-0.5">
            {pmSchedules.length}
          </div>
        </div>
        <div className="bg-[#111827] border border-emerald-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Safe (Dalam Batas)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono-nums mt-0.5">
            {pmSchedules.filter((p) => p.status === 'SAFE').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-amber-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Due Soon (Mendekati)</span>
          <div className="text-2xl font-black text-amber-400 font-mono-nums mt-0.5">
            {pmSchedules.filter((p) => p.status === 'DUE SOON').length}
          </div>
        </div>
        <div className="bg-[#111827] border border-rose-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-rose-400 uppercase font-semibold">Overdue (Terlambat)</span>
          <div className="text-2xl font-black text-rose-400 font-mono-nums mt-0.5">
            {pmSchedules.filter((p) => p.status === 'OVERDUE').length}
          </div>
        </div>
      </div>

      {/* Search & filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode unit, tipe PM, PIC mekanik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Status PM</option>
            <option value="SAFE">SAFE (Aman)</option>
            <option value="DUE SOON">DUE SOON (Mendekati)</option>
            <option value="OVERDUE">OVERDUE (Terlambat)</option>
          </select>
        </div>
        <div className="text-[11px] text-slate-400 font-mono-nums">
          {filteredPms.length} Jadwal PM
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Tipe PM</th>
                <th className="py-3 px-3 text-right">Interval</th>
                <th className="py-3 px-3 text-right">Last PM</th>
                <th className="py-3 px-3 text-right">Current Meter</th>
                <th className="py-3 px-3 text-right">Next PM</th>
                <th className="py-3 px-3 text-right">Sisa Meter</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">PIC Mekanik</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPms.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ada jadwal PM yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredPms.map((pm) => {
                  const unit = units.find((u) => u.unitCode === pm.unitCode);
                  const param = unit?.paramType || 'HM';

                  let statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      SAFE
                    </span>
                  );
                  if (pm.status === 'OVERDUE') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        OVERDUE
                      </span>
                    );
                  } else if (pm.status === 'DUE SOON') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DUE SOON
                      </span>
                    );
                  }

                  return (
                    <tr key={pm.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white font-mono-nums">
                        {pm.unitCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400">
                        {pm.pmType}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono-nums tabular-nums">
                        {formatHmKm(pm.interval, param)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono-nums tabular-nums">
                        {formatHmKm(pm.lastPmHmKm, param)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 font-bold font-mono-nums tabular-nums">
                        {formatHmKm(pm.currentHmKm, param)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300 font-mono-nums tabular-nums">
                        {formatHmKm(pm.nextPmHmKm, param)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums ${
                        pm.remaining <= 0 ? 'text-rose-400' : pm.status === 'DUE SOON' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {pm.remaining < 0 ? `-${Math.abs(pm.remaining).toLocaleString('id-ID')}` : pm.remaining.toLocaleString('id-ID')} {param}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono-nums">
                        {pm.dueDate}
                      </td>
                      <td className="py-2.5 px-3">
                        {statusBadge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {pm.pic}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setCompleteId(pm.id)}
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Selesaikan PM (Mark Complete)"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(pm)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(pm.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Hapus Jadwal"
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

      {/* Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPm ? 'Edit Jadwal PM' : 'Buat Jadwal Preventive Maintenance Baru'}
        subtitle="Interval servis otomatis mengkalkulasi Next PM dan status Safe/Due Soon/Overdue."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pilih Unit *</label>
              <select
                required
                value={formData.unitCode}
                onChange={(e) => handleUnitSelect(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.unitCode}>
                    {u.unitCode} ({u.type} - {u.paramType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Tipe PM *</label>
              <input
                required
                type="text"
                placeholder="PM 250, PM 500, PM 1000, PM 10,000 KM"
                value={formData.pmType}
                onChange={(e) => setFormData({ ...formData, pmType: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Interval Nilai *</label>
              <input
                required
                type="number"
                value={formData.interval}
                onChange={(e) => {
                  const interval = Number(e.target.value);
                  const nextVal = Math.ceil(formData.currentHmKm / interval) * interval;
                  setFormData({
                    ...formData,
                    interval,
                    nextPmHmKm: nextVal,
                    lastPmHmKm: nextVal - interval
                  });
                }}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Due Date *</label>
              <input
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Last PM Meter</label>
              <input
                type="number"
                value={formData.lastPmHmKm}
                onChange={(e) => setFormData({ ...formData, lastPmHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Meter Unit</label>
              <input
                type="number"
                value={formData.currentHmKm}
                onChange={(e) => setFormData({ ...formData, currentHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Next PM Target</label>
              <input
                type="number"
                value={formData.nextPmHmKm}
                onChange={(e) => setFormData({ ...formData, nextPmHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">PIC Mekanik</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan / Lingkup Servis</label>
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
              {editingPm ? 'Simpan Perubahan' : 'Buat Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete PM Confirmation */}
      <ConfirmDialog
        isOpen={!!completeId}
        onClose={() => setCompleteId(null)}
        onConfirm={() => {
          if (completeId) onCompletePm(completeId);
        }}
        title="Tandai PM Selesai (Mark Complete)"
        message="Apakah Anda yakin pekerjaan PM untuk unit ini telah rampung dilaksanakan? Sistem akan memperbarui meteran service terakhir dan mengalihkan status menjadi SAFE."
        confirmText="Ya, Selesai"
        isDestructive={false}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeletePm(deleteId);
        }}
        title="Hapus Jadwal PM"
        message="Apakah Anda yakin ingin menghapus jadwal preventive maintenance ini?"
      />
    </div>
  );
};
