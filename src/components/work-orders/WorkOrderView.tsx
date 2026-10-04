import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Eye,
  AlertTriangle,
  Clock,
  DollarSign,
  UserCheck,
  Package
} from 'lucide-react';
import {
  WorkOrder,
  UnitMaster,
  WoType,
  WoPriority,
  WoStatus,
  WoPartItem
} from '../../types';
import { formatRupiah, formatHmKm, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface WorkOrderViewProps {
  workOrders: WorkOrder[];
  units: UnitMaster[];
  onAddWo: (wo: Omit<WorkOrder, 'id'>) => void;
  onUpdateWo: (id: string, wo: Partial<WorkOrder>) => void;
  onDeleteWo: (id: string) => void;
  onLogActivity?: (woId: string, woNumber: string, activity: string, notes?: string) => void;
}

const WO_TYPES: WoType[] = [
  'Breakdown',
  'Corrective Maintenance',
  'Preventive Maintenance',
  'Predictive Maintenance',
  'Inspection',
  'Modification',
  'Campaign',
  'Tyre',
  'Electrical',
  'Lubrication'
];

const WO_PRIORITIES: WoPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

const WO_STATUSES: WoStatus[] = [
  'OPEN',
  'IN PROGRESS',
  'WAITING PART',
  'WAITING MANPOWER',
  'COMPLETED',
  'CLOSED'
];

export const WorkOrderView: React.FC<WorkOrderViewProps> = ({
  workOrders,
  units,
  onAddWo,
  onUpdateWo,
  onDeleteWo,
  onLogActivity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWo, setEditingWo] = useState<WorkOrder | null>(null);
  const [viewingWo, setViewingWo] = useState<WorkOrder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    woNumber: `WO-2026-${(workOrders.length + 1001).toString()}`,
    date: new Date().toISOString().split('T')[0],
    unitId: units[0]?.id || '',
    unitCode: units[0]?.unitCode || '',
    type: 'Breakdown' as WoType,
    component: 'Hydraulic System',
    failure: 'Kebocoran Tekanan Pompa',
    problem: 'Sistem hidrolik tidak mampu mengangkat boom beban penuh.',
    cause: 'Seal wear & valve leakage.',
    action: 'Ganti seal kit & kalibrasi relief valve pressure.',
    mechanic: 'Joko Prabowo',
    supervisor: 'Irwan Setiawan',
    priority: 'HIGH' as WoPriority,
    startTime: `${new Date().toISOString().split('T')[0]} 08:00`,
    finishTime: '',
    downtimeHours: 4.0,
    hmKmAtFailure: 14850,
    partsUsed: [] as WoPartItem[],
    laborHours: 6,
    totalCost: 15000000,
    status: 'IN PROGRESS' as WoStatus,
    remarks: 'Mekanik sedang melakukan penggantian di pit.'
  });

  const handleOpenAdd = () => {
    setEditingWo(null);
    const u = units[0];
    const curVal = u ? (u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent) : 10000;
    setFormData({
      woNumber: `WO-2026-${(workOrders.length + 1001).toString()}`,
      date: new Date().toISOString().split('T')[0],
      unitId: u?.id || '',
      unitCode: u?.unitCode || '',
      type: 'Breakdown',
      component: 'Hydraulic System',
      failure: 'Tekanan Oli Drop',
      problem: 'Alat mengalami penurunan tenaga silinder boom.',
      cause: 'Kerusakan o-ring relief valve.',
      action: 'Penggantian o-ring dan flushing oli.',
      mechanic: u?.mechanic || 'Mekanik Plant',
      supervisor: 'Irwan Setiawan',
      priority: 'HIGH',
      startTime: `${new Date().toISOString().split('T')[0]} 08:00`,
      finishTime: '',
      downtimeHours: 3.5,
      hmKmAtFailure: curVal,
      partsUsed: [],
      laborHours: 5,
      totalCost: 8500000,
      status: 'OPEN',
      remarks: 'Work order baru diterbitkan oleh pengawas.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wo: WorkOrder) => {
    setEditingWo(wo);
    setFormData({
      woNumber: wo.woNumber,
      date: wo.date,
      unitId: wo.unitId,
      unitCode: wo.unitCode,
      type: wo.type,
      component: wo.component,
      failure: wo.failure,
      problem: wo.problem,
      cause: wo.cause,
      action: wo.action,
      mechanic: wo.mechanic,
      supervisor: wo.supervisor,
      priority: wo.priority,
      startTime: wo.startTime,
      finishTime: wo.finishTime || '',
      downtimeHours: wo.downtimeHours,
      hmKmAtFailure: wo.hmKmAtFailure,
      partsUsed: wo.partsUsed || [],
      laborHours: wo.laborHours,
      totalCost: wo.totalCost,
      status: wo.status,
      remarks: wo.remarks
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWo) {
      onUpdateWo(editingWo.id, formData);
      if (onLogActivity) {
        onLogActivity(editingWo.id, formData.woNumber, `WO Diperbarui (${formData.status})`, `Status diubah menjadi ${formData.status}`);
      }
    } else {
      onAddWo(formData);
      if (onLogActivity) {
        onLogActivity(`wo-${Date.now()}`, formData.woNumber, 'WO Created', formData.problem);
      }
    }
    setIsFormOpen(false);
  };

  const filteredWos = workOrders.filter((wo) => {
    const matchSearch =
      wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.failure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.mechanic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = selectedType ? wo.type === selectedType : true;
    const matchStatus = selectedStatus ? wo.status === selectedStatus : true;
    const matchPriority = selectedPriority ? wo.priority === selectedPriority : true;

    return matchSearch && matchType && matchStatus && matchPriority;
  });

  const totalPages = Math.ceil(filteredWos.length / pageSize) || 1;
  const paginatedWos = filteredWos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    const exportRows = filteredWos.map((w) => ({
      NoWO: w.woNumber,
      Tanggal: w.date,
      UnitCode: w.unitCode,
      JenisWO: w.type,
      Komponen: w.component,
      Kerusakan: w.failure,
      Prioritas: w.priority,
      Status: w.status,
      DowntimeJam: w.downtimeHours,
      TotalBiaya: w.totalCost,
      Mekanik: w.mechanic,
      Supervisor: w.supervisor,
      Tindakan: w.action
    }));
    exportToCsv('Work_Order_Mining_Log', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            Work Order Management (WO Tambang)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen tiket perbaikan Breakdown, PM, PDM, inspeksi, spare parts & kalkulasi biaya downtime.
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
            <span>Buat WO Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No WO, unit, kerusakan, mekanik..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Jenis WO</option>
            {WO_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Prioritas</option>
            {WO_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Status WO</option>
            {WO_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          {filteredWos.length} Work Orders
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">No WO</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Jenis WO</th>
                <th className="py-3 px-3">Deskripsi Kerusakan</th>
                <th className="py-3 px-3">Prioritas</th>
                <th className="py-3 px-3 text-right">Downtime</th>
                <th className="py-3 px-3 text-right">Estimasi Biaya</th>
                <th className="py-3 px-3">Mekanik PIC</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedWos.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ada Work Order yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedWos.map((wo) => {
                  let priorityColor = 'text-slate-300 bg-slate-800';
                  if (wo.priority === 'EMERGENCY') priorityColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
                  else if (wo.priority === 'HIGH') priorityColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                  else if (wo.priority === 'MEDIUM') priorityColor = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';

                  let statusColor = 'bg-slate-800 text-slate-300';
                  if (wo.status === 'OPEN') statusColor = 'bg-rose-950/60 text-rose-300 border border-rose-800/60';
                  else if (wo.status === 'IN PROGRESS') statusColor = 'bg-amber-950/60 text-amber-300 border border-amber-800/60';
                  else if (wo.status === 'WAITING PART') statusColor = 'bg-purple-950/60 text-purple-300 border border-purple-800/60';
                  else if (wo.status === 'COMPLETED' || wo.status === 'CLOSED') statusColor = 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60';

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => setViewingWo(wo)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-bold text-amber-400 font-mono-nums">
                        {wo.woNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono-nums">
                        {wo.date}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white font-mono-nums">
                        {wo.unitCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {wo.type}
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="font-semibold text-slate-200 truncate">{wo.failure}</div>
                        <div className="text-[10px] text-slate-400 truncate">{wo.component}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityColor}`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-slate-300">
                        {wo.downtimeHours} jam
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-amber-400 font-semibold">
                        {formatRupiah(wo.totalCost)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[120px]">
                        {wo.mechanic}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingWo(wo)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Detail WO"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(wo)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
                            title="Edit WO"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(wo.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Hapus WO"
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail WO */}
      {viewingWo && (
        <Modal
          isOpen={!!viewingWo}
          onClose={() => setViewingWo(null)}
          title={`Detail Work Order: ${viewingWo.woNumber} · ${viewingWo.unitCode}`}
          subtitle={`Jenis: ${viewingWo.type} · Prioritas: ${viewingWo.priority} · Tanggal: ${viewingWo.date}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0f1d] p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Status WO</span>
                <div className="text-sm font-bold text-amber-400 uppercase mt-0.5">
                  {viewingWo.status}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Downtime</span>
                <div className="text-sm font-bold text-white font-mono-nums mt-0.5">
                  {viewingWo.downtimeHours} Jam
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Tenaga Kerja</span>
                <div className="text-sm font-bold text-slate-300 font-mono-nums mt-0.5">
                  {viewingWo.laborHours} Man-Hour
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Biaya</span>
                <div className="text-sm font-bold text-emerald-400 font-mono-nums mt-0.5">
                  {formatRupiah(viewingWo.totalCost)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-white uppercase text-[11px] block mb-1">
                  1. Problem / Deskripsi Gejala
                </span>
                <p className="text-slate-300">{viewingWo.problem}</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-amber-400 uppercase text-[11px] block mb-1">
                  2. Penyebab Kerusakan (Cause)
                </span>
                <p className="text-slate-300">{viewingWo.cause}</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-emerald-400 uppercase text-[11px] block mb-1">
                  3. Tindakan Perbaikan (Corrective Action)
                </span>
                <p className="text-slate-300">{viewingWo.action}</p>
              </div>
            </div>

            {/* Parts used */}
            {viewingWo.partsUsed && viewingWo.partsUsed.length > 0 && (
              <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg">
                <span className="font-bold text-white uppercase text-[11px] block mb-2">
                  Spare Parts Yang Digunakan:
                </span>
                <div className="space-y-1">
                  {viewingWo.partsUsed.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/40">
                      <span>{p.partNumber} - {p.partName} ({p.qty} pcs)</span>
                      <span className="font-mono-nums text-amber-400">{formatRupiah(p.unitCost * p.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingWo(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Add / Edit WO */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingWo ? `Edit Work Order: ${editingWo.woNumber}` : 'Penerbitan Work Order (WO) Baru'}
        subtitle="Lengkapi failure mode, tindakan teknis, dan alokasi mekanik penanggung jawab."
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor WO *</label>
              <input
                required
                type="text"
                value={formData.woNumber}
                onChange={(e) => setFormData({ ...formData, woNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Terbit *</label>
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
                onChange={(e) => {
                  const u = units.find((x) => x.unitCode === e.target.value);
                  setFormData({
                    ...formData,
                    unitId: u?.id || '',
                    unitCode: e.target.value,
                    hmKmAtFailure: u?.paramType === 'KM' ? u.kmCurrent : (u?.hmCurrent || 10000)
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
              <label className="block text-slate-300 font-semibold mb-1">Jenis Pekerjaan (Type) *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WoType })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {WO_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Komponen Kritis *</label>
              <input
                required
                type="text"
                placeholder="Hydraulic System, Engine, Transmission"
                value={formData.component}
                onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Failure / Gejala Utama *</label>
              <input
                required
                type="text"
                placeholder="Hose Rupture, Low Oil Pressure, No Power"
                value={formData.failure}
                onChange={(e) => setFormData({ ...formData, failure: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prioritas *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as WoPriority })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {WO_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status WO *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WoStatus })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {WO_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Downtime (Jam) *</label>
              <input
                required
                type="number"
                step="0.5"
                value={formData.downtimeHours}
                onChange={(e) => setFormData({ ...formData, downtimeHours: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mekanik Lead</label>
              <input
                type="text"
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supervisor Plant</label>
              <input
                type="text"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimasi Total Biaya (Rp)</label>
              <input
                type="number"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-emerald-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi Problem / Indikasi Awal</label>
            <textarea
              rows={2}
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Penyebab Kerusakan (Root Cause)</label>
            <textarea
              rows={2}
              value={formData.cause}
              onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tindakan Perbaikan (Action Done / Planned)</label>
            <textarea
              rows={2}
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
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
              {editingWo ? 'Simpan Perubahan' : 'Terbitkan WO'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteWo(deleteId);
        }}
        title="Hapus Work Order"
        message="Yakin ingin menghapus dokumen Work Order ini dari database?"
      />
    </div>
  );
};
