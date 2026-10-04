import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Sliders,
  Filter
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { PdmRecord, UnitMaster, PdmStatus } from '../../types';
import { exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PdmManagementViewProps {
  pdmRecords: PdmRecord[];
  units: UnitMaster[];
  onAddPdm: (pdm: Omit<PdmRecord, 'id'>) => void;
  onUpdatePdm: (id: string, pdm: Partial<PdmRecord>) => void;
  onDeletePdm: (id: string) => void;
}

const PDM_PARAMETERS = [
  'Engine Oil Fe/Cu/Soot (SOS)',
  'Hydraulic System Temperature',
  'Differential Oil Cu Particle',
  'Track Roller Vibration RMS',
  'Coolant Glycol pH',
  'Pump Bearing Velocity Peak',
  'Transmission Filter Differential Pressure',
  'Final Drive Wear Metal Fe',
  'Battery CCA & Voltage'
];

export const PdmManagementView: React.FC<PdmManagementViewProps> = ({
  pdmRecords,
  units,
  onAddPdm,
  onUpdatePdm,
  onDeletePdm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPdm, setEditingPdm] = useState<PdmRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingTrend, setViewingTrend] = useState<PdmRecord | null>(pdmRecords[0] || null);

  const [formData, setFormData] = useState({
    unitId: units[0]?.id || '',
    unitCode: units[0]?.unitCode || '',
    component: 'Engine Oil',
    inspectionDate: new Date().toISOString().split('T')[0],
    hmKm: 14800,
    parameter: 'Engine Oil Fe/Cu/Soot (SOS)',
    actualValue: 28,
    normalRange: '< 40 ppm',
    warningLimit: 40,
    criticalLimit: 75,
    unitOfMeasure: 'ppm',
    trend: 'STABLE' as 'STABLE' | 'INCREASING' | 'DECREASING',
    recommendation: 'Kondisi keausan normal. Pertahankan interval sampling.',
    pic: 'Laboratorium SOS Trakindo'
  });

  const handleOpenAdd = () => {
    setEditingPdm(null);
    const u = units[0];
    const curVal = u?.paramType === 'KM' ? u.kmCurrent : (u?.hmCurrent || 5000);
    setFormData({
      unitId: u?.id || '',
      unitCode: u?.unitCode || '',
      component: 'Engine Oil',
      inspectionDate: new Date().toISOString().split('T')[0],
      hmKm: curVal,
      parameter: 'Engine Oil Fe/Cu/Soot (SOS)',
      actualValue: 25,
      normalRange: '< 40 ppm',
      warningLimit: 40,
      criticalLimit: 75,
      unitOfMeasure: 'ppm',
      trend: 'STABLE',
      recommendation: 'Kondisi keausan normal.',
      pic: 'Laboratorium SOS'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record: PdmRecord) => {
    setEditingPdm(record);
    setFormData({
      unitId: record.unitId,
      unitCode: record.unitCode,
      component: record.component,
      inspectionDate: record.inspectionDate,
      hmKm: record.hmKm,
      parameter: record.parameter,
      actualValue: record.actualValue,
      normalRange: record.normalRange,
      warningLimit: record.warningLimit,
      criticalLimit: record.criticalLimit,
      unitOfMeasure: record.unitOfMeasure,
      trend: record.trend,
      recommendation: record.recommendation,
      pic: record.pic
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let status: PdmStatus = 'NORMAL';
    if (formData.actualValue >= formData.criticalLimit) status = 'CRITICAL';
    else if (formData.actualValue >= formData.warningLimit) status = 'WARNING';

    if (editingPdm) {
      onUpdatePdm(editingPdm.id, {
        ...formData,
        status
      });
    } else {
      onAddPdm({
        ...formData,
        status
      });
    }
    setIsFormOpen(false);
  };

  const filteredRecords = pdmRecords.filter((rec) => {
    const matchSearch =
      rec.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus ? rec.status === selectedStatus : true;
    const matchComp = selectedComponent ? rec.component === selectedComponent : true;
    return matchSearch && matchStatus && matchComp;
  });

  const componentsList = Array.from(new Set(pdmRecords.map((r) => r.component)));

  // Simulated historical trend for viewing record
  const selectedTrendRecord = viewingTrend || pdmRecords[0];
  const trendHistoryLabels = ['T-4 Bulan', 'T-3 Bulan', 'T-2 Bulan', 'T-1 Bulan', 'Inspeksi Terakhir'];
  const baseVal = selectedTrendRecord?.actualValue || 20;
  const trendHistoryValues = [
    Math.round(baseVal * 0.65),
    Math.round(baseVal * 0.75),
    Math.round(baseVal * 0.85),
    Math.round(baseVal * 0.92),
    baseVal
  ];

  const trendChartData = {
    labels: trendHistoryLabels,
    datasets: [
      {
        label: `Nilai Riil (${selectedTrendRecord?.unitOfMeasure || ''})`,
        data: trendHistoryValues,
        borderColor: selectedTrendRecord?.status === 'CRITICAL' ? '#ef4444' : selectedTrendRecord?.status === 'WARNING' ? '#f59e0b' : '#10b981',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5
      },
      {
        label: 'Warning Limit',
        data: Array(5).fill(selectedTrendRecord?.warningLimit || 40),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false
      },
      {
        label: 'Critical Limit',
        data: Array(5).fill(selectedTrendRecord?.criticalLimit || 75),
        borderColor: '#ef4444',
        borderDash: [2, 2],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const handleExportCsv = () => {
    const exportRows = filteredRecords.map((r) => ({
      UnitCode: r.unitCode,
      Komponen: r.component,
      Parameter: r.parameter,
      Tanggal: r.inspectionDate,
      HM_KM: r.hmKm,
      NilaiRiil: `${r.actualValue} ${r.unitOfMeasure}`,
      NormalRange: r.normalRange,
      WarningLimit: r.warningLimit,
      CriticalLimit: r.criticalLimit,
      Trend: r.trend,
      Status: r.status,
      Rekomendasi: r.recommendation,
      PIC: r.pic
    }));
    exportToCsv('PDM_Oil_SOS_Vibration_Records', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            PDM Management (Predictive Maintenance · Oil / SOS / Vibration)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis kondisi fluida, getaran bearing, dan profil keausan metal sebelum terjadinya breakdown fatal.
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
            <span>Input Sampel PDM</span>
          </button>
        </div>
      </div>

      {/* PDM Trend Chart Spotlight */}
      {selectedTrendRecord && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono-nums">
                  {selectedTrendRecord.unitCode}
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Grafik Tren Parameter: {selectedTrendRecord.component} · {selectedTrendRecord.parameter}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nilai Terakhir: {selectedTrendRecord.actualValue} {selectedTrendRecord.unitOfMeasure} (Normal: {selectedTrendRecord.normalRange})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                selectedTrendRecord.status === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : selectedTrendRecord.status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                STATUS: {selectedTrendRecord.status}
              </span>
            </div>
          </div>

          <div className="h-56">
            <Line
              data={trendChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 10, padding: 8 } }
                },
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                }
              }}
            />
          </div>

          {selectedTrendRecord.recommendation && (
            <div className="mt-3 p-2.5 bg-[#0a0f1d] border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2">
              <span className="font-bold text-amber-400 shrink-0">Rekomendasi Ahli:</span>
              <span className="leading-relaxed">{selectedTrendRecord.recommendation}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari unit, komponen, parameter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Komponen</option>
            {componentsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Kondisi</option>
            <option value="NORMAL">NORMAL</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          {filteredRecords.length} Data Uji PDM
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Komponen</th>
                <th className="py-3 px-3">Parameter Uji</th>
                <th className="py-3 px-3">Tgl Uji</th>
                <th className="py-3 px-3 text-right">Nilai Riil</th>
                <th className="py-3 px-3">Batas Normal</th>
                <th className="py-3 px-3 text-right">Batas Kritis</th>
                <th className="py-3 px-3">Tren</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Lab / PIC</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ditemukan riwayat uji PDM yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  let statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      NORMAL
                    </span>
                  );
                  if (record.status === 'CRITICAL') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        CRITICAL
                      </span>
                    );
                  } else if (record.status === 'WARNING') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        WARNING
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setViewingTrend(record)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        viewingTrend?.id === record.id ? 'bg-amber-400/5 border-l-2 border-l-amber-400' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white font-mono-nums">
                        {record.unitCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {record.component}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {record.parameter}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono-nums">
                        {record.inspectionDate}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums text-white">
                        {record.actualValue} {record.unitOfMeasure}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {record.normalRange}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400 font-mono-nums tabular-nums">
                        &gt; {record.criticalLimit} {record.unitOfMeasure}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          record.trend === 'INCREASING'
                            ? 'text-rose-400 bg-rose-950/40'
                            : record.trend === 'DECREASING'
                            ? 'text-blue-400 bg-blue-950/40'
                            : 'text-slate-400 bg-slate-800/40'
                        }`}>
                          {record.trend}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {statusBadge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[130px]">
                        {record.pic}
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingTrend(record)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Tampilkan Tren"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(record.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                            title="Hapus Data"
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

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPdm ? 'Edit Catatan PDM' : 'Input Hasil Inspeksi PDM / Oil Sampling'}
        subtitle="Masukkan parameter riil laboratorium untuk evaluasi limit normal/warning/kritis."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    hmKm: u?.paramType === 'KM' ? u.kmCurrent : (u?.hmCurrent || 5000)
                  });
                }}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.unitCode}>
                    {u.unitCode} ({u.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Komponen Yang Diuji *</label>
              <input
                required
                type="text"
                placeholder="Engine Oil, Hydraulic System, Differential, Vibration"
                value={formData.component}
                onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Parameter Uji *</label>
              <input
                required
                type="text"
                value={formData.parameter}
                onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Sampling / Uji *</label>
              <input
                required
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">HM / KM Saat Uji *</label>
              <input
                required
                type="number"
                value={formData.hmKm}
                onChange={(e) => setFormData({ ...formData, hmKm: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Satuan Pengukuran</label>
              <input
                type="text"
                placeholder="ppm, °C, mm/s, bar"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nilai Riil Uji *</label>
              <input
                required
                type="number"
                step="any"
                value={formData.actualValue}
                onChange={(e) => setFormData({ ...formData, actualValue: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batas Normal (Range Text)</label>
              <input
                type="text"
                placeholder="misal: < 40 ppm"
                value={formData.normalRange}
                onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Warning Limit Value</label>
              <input
                type="number"
                step="any"
                value={formData.warningLimit}
                onChange={(e) => setFormData({ ...formData, warningLimit: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-300 font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Critical Limit Value</label>
              <input
                type="number"
                step="any"
                value={formData.criticalLimit}
                onChange={(e) => setFormData({ ...formData, criticalLimit: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-rose-400 font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tren Nilai</label>
              <select
                value={formData.trend}
                onChange={(e) => setFormData({ ...formData, trend: e.target.value as any })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="STABLE">STABLE (Stabil)</option>
                <option value="INCREASING">INCREASING (Meningkat)</option>
                <option value="DECREASING">DECREASING (Menurun)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Laboratorium / PIC</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rekomendasi Tindakan</label>
            <textarea
              rows={2}
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
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
              {editingPdm ? 'Simpan Perubahan' : 'Simpan Data PDM'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeletePdm(deleteId);
        }}
        title="Hapus Rekaman PDM"
        message="Yakin ingin menghapus data pengujian kondisi ini?"
      />
    </div>
  );
};
