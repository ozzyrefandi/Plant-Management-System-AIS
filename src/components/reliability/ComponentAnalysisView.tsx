import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { ComponentItem, UnitMaster } from '../../types';
import { calculateComponentPrediction } from '../../utils/calculations';
import { formatRupiah, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ComponentAnalysisViewProps {
  components: ComponentItem[];
  units: UnitMaster[];
  onAddComponent: (comp: Omit<ComponentItem, 'id'>) => void;
  onUpdateComponent: (id: string, comp: Partial<ComponentItem>) => void;
  onDeleteComponent: (id: string) => void;
}

export const ComponentAnalysisView: React.FC<ComponentAnalysisViewProps> = ({
  components,
  units,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<ComponentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    componentName: 'Main Hydraulic Pump',
    serialNumber: 'HP-99120',
    unitId: units[0]?.id || '',
    unitCode: units[0]?.unitCode || '',
    installDate: '2024-01-10',
    installHmKm: 6000,
    removeDate: '',
    removeHmKm: 0,
    actualLife: 8850,
    standardLife: 10000,
    cost: 450000000,
    vendor: 'PT United Tractors',
    partNumber: '708-2L-00400',
    failureCause: '',
    status: 'INSTALLED' as 'INSTALLED' | 'REMOVED' | 'SCRAPPED'
  });

  const handleOpenAdd = () => {
    setEditingComp(null);
    const u = units[0];
    const curVal = u?.paramType === 'KM' ? u.kmCurrent : (u?.hmCurrent || 10000);
    setFormData({
      componentName: 'Main Hydraulic Pump',
      serialNumber: `SN-COMP-${Date.now().toString().slice(-4)}`,
      unitId: u?.id || '',
      unitCode: u?.unitCode || '',
      installDate: '2024-01-15',
      installHmKm: Math.max(0, curVal - 4000),
      removeDate: '',
      removeHmKm: 0,
      actualLife: 4000,
      standardLife: 10000,
      cost: 350000000,
      vendor: 'Komatsu Remanufactured',
      partNumber: '708-2L-00400',
      failureCause: '',
      status: 'INSTALLED'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (comp: ComponentItem) => {
    setEditingComp(comp);
    setFormData({
      componentName: comp.componentName,
      serialNumber: comp.serialNumber,
      unitId: comp.unitId,
      unitCode: comp.unitCode,
      installDate: comp.installDate,
      installHmKm: comp.installHmKm,
      removeDate: comp.removeDate || '',
      removeHmKm: comp.removeHmKm || 0,
      actualLife: comp.actualLife,
      standardLife: comp.standardLife,
      cost: comp.cost,
      vendor: comp.vendor,
      partNumber: comp.partNumber,
      failureCause: comp.failureCause || '',
      status: comp.status
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = formData.removeHmKm > 0
      ? formData.removeHmKm - formData.installHmKm
      : formData.actualLife;

    const remaining = Math.max(0, formData.standardLife - actual);
    const achievement = formData.standardLife > 0 ? (actual / formData.standardLife) * 100 : 0;

    if (editingComp) {
      onUpdateComponent(editingComp.id, {
        ...formData,
        actualLife: actual,
        remainingLife: remaining,
        lifeAchievementPercent: Math.round(achievement * 10) / 10
      });
    } else {
      onAddComponent({
        ...formData,
        actualLife: actual,
        remainingLife: remaining,
        lifeAchievementPercent: Math.round(achievement * 10) / 10
      });
    }
    setIsFormOpen(false);
  };

  const filteredComponents = components.filter((c) => {
    const matchSearch =
      c.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus ? c.status === selectedStatus : true;
    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    const exportRows = filteredComponents.map((c) => ({
      Komponen: c.componentName,
      SerialNo: c.serialNumber,
      UnitCode: c.unitCode,
      PartNo: c.partNumber,
      TglPasang: c.installDate,
      InstallMeter: c.installHmKm,
      ActualLife: c.actualLife,
      StandardLife: c.standardLife,
      RemainingLife: c.remainingLife,
      Achievement: `${c.lifeAchievementPercent}%`,
      Status: c.status,
      Biaya: c.cost,
      Vendor: c.vendor
    }));
    exportToCsv('Analisis_Umur_Komponen_Mining', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            Component Life & Replacement Forecast (Analisis Umur Komponen)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: Actual Life = Remove - Install Meter · Achievement % = Actual / Standard × 100%
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
            <span>Pasang Komponen Baru</span>
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
              placeholder="Cari nama komponen, unit, serial number..."
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
            <option value="">Semua Status Komponen</option>
            <option value="INSTALLED">INSTALLED (Terpasang)</option>
            <option value="REMOVED">REMOVED (Dilepas)</option>
            <option value="SCRAPPED">SCRAPPED (Afkir)</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          {filteredComponents.length} Data Komponen
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Komponen</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Serial & Part No</th>
                <th className="py-3 px-3">Tgl Pasang</th>
                <th className="py-3 px-3 text-right">Actual Life</th>
                <th className="py-3 px-3 text-right">Standard Life</th>
                <th className="py-3 px-3 text-right">Sisa Umur</th>
                <th className="py-3 px-3 text-right">Achievement %</th>
                <th className="py-3 px-3">Prediksi Ganti</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data komponen yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredComponents.map((comp) => {
                  const unit = units.find((u) => u.unitCode === comp.unitCode);
                  const isKm = unit?.paramType === 'KM';
                  const dailyAvg = isKm ? 300 : 20;
                  const pred = calculateComponentPrediction(comp, dailyAvg);

                  let predBadge = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
                  if (pred.indicator === 'URGENT') predBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
                  else if (pred.indicator === 'PLAN') predBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                  else if (pred.indicator === 'WATCH') predBadge = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{comp.componentName}</div>
                        <div className="text-[10px] text-slate-400">{comp.vendor}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400 font-mono-nums">
                        {comp.unitCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-300 font-mono-nums">{comp.serialNumber}</div>
                        <div className="text-[10px] text-slate-400">{comp.partNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono-nums">
                        {comp.installDate}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200 font-mono-nums tabular-nums">
                        {comp.actualLife.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono-nums tabular-nums">
                        {comp.standardLife.toLocaleString('id-ID')}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums ${
                        comp.remainingLife < 500 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {comp.remainingLife.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums font-semibold text-amber-400">
                        {comp.lifeAchievementPercent}%
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${predBadge}`}>
                            {pred.indicator}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono-nums">
                            ~{pred.daysToReplace} hr ({pred.estimatedDateString})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          comp.status === 'INSTALLED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Edit Komponen"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(comp.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Hapus Rekaman"
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

      {/* Modal Add / Edit Component */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingComp ? 'Edit Data Komponen' : 'Pemasangan Komponen Baru'}
        subtitle="Pantau masa pakai komponen (Standard Life vs Actual Life)."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Komponen *</label>
              <input
                required
                type="text"
                placeholder="Main Hydraulic Pump, Engine, Final Drive"
                value={formData.componentName}
                onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Serial Number Komponen *</label>
              <input
                required
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit Pemasangan *</label>
              <select
                required
                value={formData.unitCode}
                onChange={(e) => {
                  const u = units.find((x) => x.unitCode === e.target.value);
                  setFormData({
                    ...formData,
                    unitId: u?.id || '',
                    unitCode: e.target.value
                  });
                }}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.unitCode}>
                    {u.unitCode} - {u.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Part Number Komponen</label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Pasang (Install Date) *</label>
              <input
                required
                type="date"
                value={formData.installDate}
                onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Meter Saat Pasang (HM/KM) *</label>
              <input
                required
                type="number"
                value={formData.installHmKm}
                onChange={(e) => setFormData({ ...formData, installHmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Standard Life Target (HM/KM) *</label>
              <input
                required
                type="number"
                value={formData.standardLife}
                onChange={(e) => setFormData({ ...formData, standardLife: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jam Terpakai Saat Ini (Actual Life)</label>
              <input
                type="number"
                value={formData.actualLife}
                onChange={(e) => setFormData({ ...formData, actualLife: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vendor / Rekondisi</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Biaya Komponen (Rp)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>
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
              {editingComp ? 'Simpan Perubahan' : 'Pasang Komponen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteComponent(deleteId);
        }}
        title="Hapus Rekaman Komponen"
        message="Yakin ingin menghapus data histori komponen ini?"
      />
    </div>
  );
};
