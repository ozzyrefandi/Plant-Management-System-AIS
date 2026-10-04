import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import {
  UnitMaster,
  WorkOrder,
  PmSchedule,
  PdmRecord,
  ComponentItem,
  PartMaster
} from '../../types';
import { calculateFleetKpis, calculatePartForecast, calculatePareto } from '../../utils/calculations';
import { exportToCsv, formatRupiah, formatHmKm } from '../../utils/storage';

interface ReportCenterViewProps {
  units: UnitMaster[];
  workOrders: WorkOrder[];
  pmSchedules: PmSchedule[];
  pdmRecords: PdmRecord[];
  components: ComponentItem[];
  parts: PartMaster[];
}

type ReportType =
  | 'daily_maintenance'
  | 'weekly_maintenance'
  | 'monthly_maintenance'
  | 'pm_compliance'
  | 'pdm_report'
  | 'breakdown_report'
  | 'wo_report'
  | 'pareto_report'
  | 'component_life'
  | 'part_forecast'
  | 'stock_report'
  | 'availability_report'
  | 'mtbf_mttr_report';

export const ReportCenterView: React.FC<ReportCenterViewProps> = ({
  units,
  workOrders,
  pmSchedules,
  pdmRecords,
  components,
  parts
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_maintenance');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const kpis = calculateFleetKpis(units, workOrders, pmSchedules, pdmRecords);

  const reportList: { id: ReportType; title: string; category: string; description: string }[] = [
    {
      id: 'daily_maintenance',
      title: '1. Daily Maintenance Report',
      category: 'Operasional Harian',
      description: 'Laporan status unit harian, breakdown aktif, dan aktivitas service workshop hari ini.'
    },
    {
      id: 'weekly_maintenance',
      title: '2. Weekly Maintenance Summary',
      category: 'Periodik',
      description: 'Rekap mingguan pencapaian jam operasi, pemakaian oli, dan eksekusi PM.'
    },
    {
      id: 'monthly_maintenance',
      title: '3. Monthly Maintenance Review',
      category: 'Periodik',
      description: 'Evaluasi bulanan performa ketersediaan armada, downtime, dan anggaran perawatan.'
    },
    {
      id: 'pm_compliance',
      title: '4. PM Compliance Report',
      category: 'Preventive',
      description: 'Rincian kepatuhan servis berkala on-time vs overdue, breakdown per tipe alat & site.'
    },
    {
      id: 'pdm_report',
      title: '5. PDM & Oil SOS Analysis Report',
      category: 'Predictive',
      description: 'Hasil uji keausan oli laboratorium, limit peringatan, dan tren vibrasi bearing.'
    },
    {
      id: 'breakdown_report',
      title: '6. Breakdown & Unscheduled Downtime',
      category: 'Kerusakan',
      description: 'Daftar kegagalan mendadak alat berat di pit, respon time, dan penanganan mekanik.'
    },
    {
      id: 'wo_report',
      title: '7. Work Order Execution Report',
      category: 'Work Order',
      description: 'Audit log seluruh status tiket WO, realisasi jam kerja, serta biaya suku cadang.'
    },
    {
      id: 'pareto_report',
      title: '8. Pareto Failure 80/20 Analysis',
      category: 'Reliability',
      description: 'Daftar 20% penyebab terbesar yang menyumbang 80% downtime dan biaya perbaikan.'
    },
    {
      id: 'component_life',
      title: '9. Component Life & Achievement Report',
      category: 'Komponen',
      description: 'Evaluasi umur aktual komponen utama (Engine, Pump, Transmission) vs standar pabrikan.'
    },
    {
      id: 'part_forecast',
      title: '10. Spare Part Forecast & Order Plan',
      category: 'Supply Chain',
      description: 'Rekomendasi order PO suku cadang 1, 3, 6, dan 12 bulan ke depan berdasarkan lead time.'
    },
    {
      id: 'stock_report',
      title: '11. Warehouse Inventory & Stock Valuation',
      category: 'Gudang',
      description: 'Laporan saldo fisik gudang, barang slow-moving, buffer safety stock, dan total nilai aset.'
    },
    {
      id: 'availability_report',
      title: '12. Fleet Availability (PA · MA · UA)',
      category: 'KPI',
      description: 'Matriks Physical Availability, Mechanical Availability, dan Utilisasi armada tambang.'
    },
    {
      id: 'mtbf_mttr_report',
      title: '13. Reliability MTBF & MTTR Report',
      category: 'KPI',
      description: 'Statistik Mean Time Between Failures dan Mean Time to Repair per unit dan tipe alat.'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCurrent = () => {
    if (selectedReport === 'daily_maintenance' || selectedReport === 'availability_report') {
      const rows = units.map((u) => ({
        Unit: u.unitCode,
        Tipe: u.type,
        Brand: u.brand,
        Model: u.model,
        Status: u.status,
        Lokasi: u.location,
        MeterSaatIni: u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent,
        NextService: u.nextServiceHmKm,
        HealthScore: u.healthScore
      }));
      exportToCsv(`Report_${selectedReport}_${reportDate}`, rows);
    } else if (selectedReport === 'pm_compliance') {
      const rows = pmSchedules.map((p) => ({
        Unit: p.unitCode,
        TipePM: p.pmType,
        Interval: p.interval,
        LastPM: p.lastPmHmKm,
        CurrentMeter: p.currentHmKm,
        NextPM: p.nextPmHmKm,
        Sisa: p.remaining,
        Status: p.status,
        DueDate: p.dueDate,
        PIC: p.pic
      }));
      exportToCsv(`Report_PM_Compliance_${reportDate}`, rows);
    } else if (selectedReport === 'part_forecast') {
      const rows = parts.map((p) => {
        const f = calculatePartForecast(p);
        return {
          PartNo: p.partNumber,
          PartName: p.partName,
          Group: p.group,
          StokSaatIni: p.currentStock,
          SafetyStock: p.safetyStock,
          Forecast3M: f.forecast3Months,
          RekomendasiOrder: f.recommendedOrderQty,
          Status: f.stockStatus
        };
      });
      exportToCsv(`Report_Part_Forecast_${reportDate}`, rows);
    } else {
      const rows = workOrders.map((w) => ({
        NoWO: w.woNumber,
        Tanggal: w.date,
        Unit: w.unitCode,
        Tipe: w.type,
        Kerusakan: w.failure,
        Downtime: w.downtimeHours,
        TotalBiaya: w.totalCost,
        Status: w.status,
        Mekanik: w.mechanic
      }));
      exportToCsv(`Report_Work_Orders_${reportDate}`, rows);
    }
  };

  const currentReportMeta = reportList.find((r) => r.id === selectedReport);

  return (
    <div className="space-y-4">
      {/* Top Header Card (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            Report Center & Laporan Manajemen Tambang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            13 Format laporan resmi siap cetak (Print PDF) dan ekspor data tabular Excel / CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          />

          <button
            onClick={handleExportCurrent}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-950 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Report Selector & Preview Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Report Menu List (Hidden on Print) */}
        <div className="no-print lg:col-span-1 bg-[#111827] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Daftar Jenis Laporan:
          </span>

          <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
            {reportList.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedReport === rep.id
                    ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="font-bold line-clamp-1">{rep.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {rep.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Printable Document Preview Canvas */}
        <div className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl print-card print:border-none print:shadow-none print:p-0">
          {/* Document Official Header */}
          <div className="border-b-2 border-slate-700 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center font-black text-black text-xs">
                  PMS
                </div>
                <span className="text-base font-extrabold text-white tracking-wide uppercase">
                  PLANT MANAGEMENT SYSTEM · MINING DIVISION
                </span>
              </div>
              <h3 className="text-sm font-bold text-amber-400 mt-1 uppercase">
                {currentReportMeta?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentReportMeta?.description}</p>
            </div>

            <div className="text-right text-xs text-slate-300 font-mono-nums">
              <div>Tanggal Cetak: <strong>{reportDate}</strong></div>
              <div>Klasifikasi: <strong>INTERNAL CONFIDENTIAL</strong></div>
              <div>Status Armada: <strong>{kpis.runningUnits} / {kpis.totalUnits} RUNNING</strong></div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0f1d] border border-slate-800 p-3 rounded-lg mb-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">Fleet Availability (PA)</span>
              <div className="text-base font-black text-amber-400 font-mono-nums">{kpis.physicalAvailability}%</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">PM Compliance %</span>
              <div className="text-base font-black text-emerald-400 font-mono-nums">{kpis.pmComplianceRate}%</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">Mean Time to Repair</span>
              <div className="text-base font-black text-slate-200 font-mono-nums">{kpis.mttrHours} Jam</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase">Total Biaya Perbaikan</span>
              <div className="text-base font-black text-emerald-400 font-mono-nums">{formatRupiah(kpis.totalRepairCost)}</div>
            </div>
          </div>

          {/* Dynamic Table based on selected report */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-800">
              <thead className="bg-[#0f172a] text-slate-300 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
                {selectedReport === 'daily_maintenance' || selectedReport === 'availability_report' ? (
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Kode Unit</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Tipe & Model</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Status</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Meter Saat Ini</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Next Service</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Lokasi Tambang</th>
                    <th className="py-2.5 px-3 text-center">Health</th>
                  </tr>
                ) : selectedReport === 'pm_compliance' ? (
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Unit</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Tipe PM</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Interval</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Current Meter</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Sisa Meter</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                ) : selectedReport === 'part_forecast' ? (
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Part No & Deskripsi</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Group</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Safety Stock</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Forecast 3 Bulan</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Rekomendasi Order</th>
                    <th className="py-2.5 px-3">Status Stok</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">No WO</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Unit</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Jenis & Kerusakan</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Downtime</th>
                    <th className="py-2.5 px-3 border-r border-slate-800 text-right">Biaya Perbaikan</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Mekanik Lead</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-800">
                {selectedReport === 'daily_maintenance' || selectedReport === 'availability_report' ? (
                  units.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-white font-mono-nums border-r border-slate-800">{u.unitCode}</td>
                      <td className="py-2 px-3 text-slate-300 border-r border-slate-800">{u.type} · {u.brand} {u.model}</td>
                      <td className="py-2 px-3 border-r border-slate-800">
                        <span className="font-bold text-[10px]">{u.status}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800 text-amber-400">
                        {u.paramType === 'KM' ? `${u.kmCurrent.toLocaleString('id-ID')} KM` : `${u.hmCurrent.toLocaleString('id-ID')} HM`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800 text-slate-300">
                        {u.nextServiceHmKm.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-slate-300 border-r border-slate-800">{u.location} ({u.site})</td>
                      <td className="py-2 px-3 text-center font-bold font-mono-nums">{u.healthScore}</td>
                    </tr>
                  ))
                ) : selectedReport === 'pm_compliance' ? (
                  pmSchedules.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-white font-mono-nums border-r border-slate-800">{p.unitCode}</td>
                      <td className="py-2 px-3 text-slate-300 border-r border-slate-800">{p.pmType}</td>
                      <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800">{p.interval}</td>
                      <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800">{p.currentHmKm.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-right font-mono-nums font-bold border-r border-slate-800 text-amber-400">{p.remaining.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 font-mono-nums border-r border-slate-800">{p.dueDate}</td>
                      <td className="py-2 px-3 font-bold text-[10px]">{p.status}</td>
                    </tr>
                  ))
                ) : selectedReport === 'part_forecast' ? (
                  parts.map((part) => {
                    const f = calculatePartForecast(part);
                    return (
                      <tr key={part.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 border-r border-slate-800">
                          <div className="font-bold text-amber-400 font-mono-nums">{part.partNumber}</div>
                          <div className="text-slate-300 truncate max-w-[200px]">{part.partName}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-300 border-r border-slate-800">{part.group}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono-nums border-r border-slate-800">{part.currentStock} pcs</td>
                        <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800">{part.safetyStock} pcs</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-400 font-mono-nums border-r border-slate-800">{f.forecast3Months} pcs</td>
                        <td className="py-2 px-3 text-right font-black font-mono-nums border-r border-slate-800 text-rose-400">{f.recommendedOrderQty} pcs</td>
                        <td className="py-2 px-3 font-bold text-[10px]">{f.stockStatus}</td>
                      </tr>
                    );
                  })
                ) : (
                  workOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-amber-400 font-mono-nums border-r border-slate-800">{wo.woNumber}</td>
                      <td className="py-2 px-3 font-bold text-white font-mono-nums border-r border-slate-800">{wo.unitCode}</td>
                      <td className="py-2 px-3 text-slate-300 border-r border-slate-800">
                        <div>{wo.type}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{wo.failure}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono-nums border-r border-slate-800">{wo.downtimeHours} jam</td>
                      <td className="py-2 px-3 text-right font-mono-nums font-bold text-emerald-400 border-r border-slate-800">{formatRupiah(wo.totalCost)}</td>
                      <td className="py-2 px-3 text-slate-300 border-r border-slate-800">{wo.mechanic}</td>
                      <td className="py-2 px-3 font-bold text-[10px]">{wo.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signature Signoff Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-center text-xs text-slate-300">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Dibuat Oleh:</div>
              <div className="h-14"></div>
              <div className="font-bold underline text-white">Maintenance Planner</div>
              <div className="text-[10px] text-slate-400">Plant Dept</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Diperiksa Oleh:</div>
              <div className="h-14"></div>
              <div className="font-bold underline text-white">Maintenance Superintendent</div>
              <div className="text-[10px] text-slate-400">Engineering & Reliability</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Disetujui Oleh:</div>
              <div className="h-14"></div>
              <div className="font-bold underline text-white">Plant General Manager</div>
              <div className="text-[10px] text-slate-400">Mining Site Head</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
