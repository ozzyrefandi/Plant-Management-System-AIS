import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { RcaRecord, WorkOrder } from '../../types';
import { exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface RcaViewProps {
  rcaRecords: RcaRecord[];
  workOrders: WorkOrder[];
  onAddRca: (rca: Omit<RcaRecord, 'id'>) => void;
  onUpdateRca: (id: string, rca: Partial<RcaRecord>) => void;
  onDeleteRca: (id: string) => void;
}

export const RcaView: React.FC<RcaViewProps> = ({
  rcaRecords,
  workOrders,
  onAddRca,
  onUpdateRca,
  onDeleteRca
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRca, setEditingRca] = useState<RcaRecord | null>(null);
  const [viewingRca, setViewingRca] = useState<RcaRecord | null>(rcaRecords[0] || null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    woNumber: workOrders[0]?.woNumber || 'WO-2026-1001',
    unitCode: workOrders[0]?.unitCode || 'EX-203',
    failure: 'Pecah Selang Hidrolik Utama',
    symptom: 'Semburan oli hidrolik masif di kompartemen pompa.',
    why1: 'Mengapa selang pecah? Karena terjadi keretakan kawat anyam.',
    why2: 'Mengapa kawat anyam retak? Karena gesekan terus-menerus dengan bracket.',
    why3: 'Mengapa bergesekan? Karena klem selang kendur.',
    why4: 'Mengapa klem kendur? Karena torsi pengencangan baut kurang tepat saat PM.',
    why5: 'Mengapa torsi kurang tepat? Karena teknisi tidak menggunakan torque wrench terkalibrasi.',
    fishboneMan: 'Kurang disiplin penggunaan alat ukur torsi.',
    fishboneMachine: 'Vibrasi tinggi pada saluran hidrolik excavator besar.',
    fishboneMethod: 'Checklist PM belum memuat nilai torsi baut spesifik.',
    fishboneMaterial: 'Klem kotor tercampur lumpur.',
    fishboneEnvironment: 'Area kerja pit berdebu dan suhu oli 85°C.',
    rootCause: 'Ketiadaan SOP nilai torsi spesifik pada form PM checklist.',
    correctiveAction: 'Pasang selang baru dengan spiral sleeve pelindung gesekan.',
    preventiveAction: 'Revisi SOP PM 1000 HM wajib mencantumkan inspeksi torsi klem.',
    pic: 'Rahmat Hidayat & Irwan Setiawan',
    dueDate: '2026-10-25',
    status: 'IN PROGRESS' as 'OPEN' | 'IN PROGRESS' | 'IMPLEMENTED' | 'VERIFIED'
  });

  const handleOpenAdd = () => {
    setEditingRca(null);
    const wo = workOrders[0];
    setFormData({
      woNumber: wo?.woNumber || 'WO-2026-1001',
      unitCode: wo?.unitCode || 'EX-203',
      failure: wo?.failure || 'Kerusakan Komponen Kritis',
      symptom: wo?.problem || 'Gejala kerusakan terdeteksi di pit.',
      why1: '',
      why2: '',
      why3: '',
      why4: '',
      why5: '',
      fishboneMan: 'Faktor kompetensi / kelelahan operator atau teknisi',
      fishboneMachine: 'Faktor desain atau keausan mekanis mesin',
      fishboneMethod: 'Faktor SOP instruksi kerja atau prosedur perawatan',
      fishboneMaterial: 'Faktor kualitas suku cadang atau fluida oli',
      fishboneEnvironment: 'Faktor debu, hujan, lumpur atau kondisi jalan',
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      pic: 'Tim Reliability & Maintenance',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'OPEN'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rca: RcaRecord) => {
    setEditingRca(rca);
    setFormData({
      woNumber: rca.woNumber,
      unitCode: rca.unitCode,
      failure: rca.failure,
      symptom: rca.symptom,
      why1: rca.why1,
      why2: rca.why2,
      why3: rca.why3,
      why4: rca.why4,
      why5: rca.why5,
      fishboneMan: rca.fishboneMan,
      fishboneMachine: rca.fishboneMachine,
      fishboneMethod: rca.fishboneMethod,
      fishboneMaterial: rca.fishboneMaterial,
      fishboneEnvironment: rca.fishboneEnvironment,
      rootCause: rca.rootCause,
      correctiveAction: rca.correctiveAction,
      preventiveAction: rca.preventiveAction,
      pic: rca.pic,
      dueDate: rca.dueDate,
      status: rca.status
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRca) {
      onUpdateRca(editingRca.id, formData);
    } else {
      onAddRca(formData);
    }
    setIsFormOpen(false);
  };

  const filteredRca = rcaRecords.filter((r) => {
    const matchSearch =
      r.failure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rootCause.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus ? r.status === selectedStatus : true;
    return matchSearch && matchStatus;
  });

  const handleExportCsv = () => {
    const exportRows = filteredRca.map((r) => ({
      NoWO: r.woNumber,
      UnitCode: r.unitCode,
      Kegagalan: r.failure,
      RootCause: r.rootCause,
      TindakanKorektif: r.correctiveAction,
      TindakanPreventif: r.preventiveAction,
      PIC: r.pic,
      TargetSelesai: r.dueDate,
      Status: r.status
    }));
    exportToCsv('Laporan_Root_Cause_Analysis_RCA', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            Root Cause Analysis (RCA · 5-Why & Diagram Tulang Ikan / Fishbone)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis akar penyebab kegagalan alat berat untuk mencegah kerusakan berulang (recurring breakdowns).
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
            <span>Buat Investigasi RCA</span>
          </button>
        </div>
      </div>

      {/* Featured Spotlight Card: 5-Why & Fishbone Interactive Viewer */}
      {viewingRca && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs font-bold font-mono-nums rounded">
                  {viewingRca.woNumber} · {viewingRca.unitCode}
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Investigasi: {viewingRca.failure}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Gejala: {viewingRca.symptom}</p>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
              viewingRca.status === 'VERIFIED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : viewingRca.status === 'IMPLEMENTED'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              STATUS: {viewingRca.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 5-Why Ladder */}
            <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <HelpCircle className="w-3.5 h-3.5" />
                Metodologi 5-Why (Tangga Akar Masalah)
              </h4>

              <div className="space-y-1.5 text-xs">
                {viewingRca.why1 && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 block">Why #1:</span>
                    <p className="text-slate-300">{viewingRca.why1}</p>
                  </div>
                )}
                {viewingRca.why2 && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 block">Why #2:</span>
                    <p className="text-slate-300">{viewingRca.why2}</p>
                  </div>
                )}
                {viewingRca.why3 && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 block">Why #3:</span>
                    <p className="text-slate-300">{viewingRca.why3}</p>
                  </div>
                )}
                {viewingRca.why4 && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 block">Why #4:</span>
                    <p className="text-slate-300">{viewingRca.why4}</p>
                  </div>
                )}
                {viewingRca.why5 && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 block">Why #5 (Root Cause Teridentifikasi):</span>
                    <p className="text-slate-200 font-semibold">{viewingRca.why5}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fishbone 5M + 1E Diagram Cards */}
            <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Layers className="w-3.5 h-3.5" />
                Fishbone Diagram Kategori (Ishikawa 5M + 1E)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">1. MAN (Manusia)</span>
                  <p className="text-slate-300">{viewingRca.fishboneMan || '-'}</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">2. MACHINE (Mesin)</span>
                  <p className="text-slate-300">{viewingRca.fishboneMachine || '-'}</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">3. METHOD (Metode / SOP)</span>
                  <p className="text-slate-300">{viewingRca.fishboneMethod || '-'}</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">4. MATERIAL (Part / Oli)</span>
                  <p className="text-slate-300">{viewingRca.fishboneMaterial || '-'}</p>
                </div>
                <div className="sm:col-span-2 p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">5. ENVIRONMENT (Lingkungan Tambang)</span>
                  <p className="text-slate-300">{viewingRca.fishboneEnvironment || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corrective and Preventive Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-400 uppercase text-[11px] block">
                Tindakan Korektif Langsung (Corrective Action):
              </span>
              <p className="text-slate-200">{viewingRca.correctiveAction}</p>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs space-y-1">
              <span className="font-bold text-emerald-400 uppercase text-[11px] block">
                Tindakan Pencegahan Sistemik (Preventive Action):
              </span>
              <p className="text-slate-200">{viewingRca.preventiveAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table of RCA Records */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari investigasi failure, unit, akar masalah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Semua Status Investigasi</option>
              <option value="OPEN">OPEN</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="IMPLEMENTED">IMPLEMENTED</option>
              <option value="VERIFIED">VERIFIED</option>
            </select>
          </div>
          <div className="text-[11px] text-slate-400 font-mono-nums">
            {filteredRca.length} Laporan RCA
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0a0f1d] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">No WO & Unit</th>
                <th className="py-3 px-3">Kerusakan Utama</th>
                <th className="py-3 px-3">Akar Masalah (Root Cause)</th>
                <th className="py-3 px-3">Tindakan Pencegahan</th>
                <th className="py-3 px-3">PIC Investigasi</th>
                <th className="py-3 px-3">Target Selesai</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRca.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setViewingRca(r)}
                  className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    viewingRca?.id === r.id ? 'bg-amber-400/5 border-l-2 border-l-amber-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-amber-400 font-mono-nums">{r.woNumber}</div>
                    <div className="text-white font-mono-nums font-bold">{r.unitCode}</div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200 max-w-[200px] truncate">
                    {r.failure}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-[240px] truncate">
                    {r.rootCause}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-[220px] truncate">
                    {r.preventiveAction}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {r.pic}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono-nums">
                    {r.dueDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      r.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : r.status === 'IMPLEMENTED'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewingRca(r)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                        title="Tampilkan Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                        title="Edit RCA"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                        title="Hapus RCA"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit RCA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRca ? 'Edit Investigasi RCA' : 'Buat Analisis Akar Masalah (RCA)'}
        subtitle="Analisis 5-Why dan Fishbone 5M+1E untuk mitigasi kegagalan permanen."
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pilih Work Order *</label>
              <select
                required
                value={formData.woNumber}
                onChange={(e) => {
                  const wo = workOrders.find((w) => w.woNumber === e.target.value);
                  setFormData({
                    ...formData,
                    woNumber: e.target.value,
                    unitCode: wo?.unitCode || formData.unitCode,
                    failure: wo?.failure || formData.failure,
                    symptom: wo?.problem || formData.symptom
                  });
                }}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {workOrders.map((w) => (
                  <option key={w.id} value={w.woNumber}>
                    {w.woNumber} - {w.unitCode} ({w.failure})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kode Unit *</label>
              <input
                required
                type="text"
                value={formData.unitCode}
                onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status Investigasi *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="IMPLEMENTED">IMPLEMENTED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deskripsi Kerusakan / Kegagalan *</label>
            <input
              required
              type="text"
              value={formData.failure}
              onChange={(e) => setFormData({ ...formData, failure: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 5 Why inputs */}
          <div className="bg-[#0a0f1d] p-3 rounded-lg border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 uppercase text-[11px] block">
              Metodologi 5-Why Analysis
            </span>
            <input
              type="text"
              placeholder="Why 1: Mengapa masalah terjadi?"
              value={formData.why1}
              onChange={(e) => setFormData({ ...formData, why1: e.target.value })}
              className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
            <input
              type="text"
              placeholder="Why 2: Mengapa hal itu bisa terjadi?"
              value={formData.why2}
              onChange={(e) => setFormData({ ...formData, why2: e.target.value })}
              className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
            <input
              type="text"
              placeholder="Why 3: Mengapa hal tersebut tidak terdeteksi?"
              value={formData.why3}
              onChange={(e) => setFormData({ ...formData, why3: e.target.value })}
              className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
            <input
              type="text"
              placeholder="Why 4: Mengapa sistem/SOP mengizinkan kondisi itu?"
              value={formData.why4}
              onChange={(e) => setFormData({ ...formData, why4: e.target.value })}
              className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
            <input
              type="text"
              placeholder="Why 5: Akar penyebab mendasar (Root Cause)"
              value={formData.why5}
              onChange={(e) => setFormData({ ...formData, why5: e.target.value })}
              className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1 text-rose-300 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Akar Masalah Akhir (Root Cause) *</label>
            <input
              required
              type="text"
              value={formData.rootCause}
              onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tindakan Korektif (Corrective)</label>
              <textarea
                rows={2}
                value={formData.correctiveAction}
                onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tindakan Pencegahan (Preventive)</label>
              <textarea
                rows={2}
                value={formData.preventiveAction}
                onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">PIC Investigasi</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Penyelesaian</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
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
              Simpan Investigasi RCA
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteRca(deleteId);
        }}
        title="Hapus Laporan RCA"
        message="Yakin ingin menghapus dokumen analisis kegagalan ini?"
      />
    </div>
  );
};
