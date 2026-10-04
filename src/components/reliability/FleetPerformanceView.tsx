import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Gauge,
  Clock,
  AlertTriangle,
  Download,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Truck
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { UnitMaster, WorkOrder, PmSchedule, PdmRecord } from '../../types';
import { calculateFleetKpis } from '../../utils/calculations';
import { exportToCsv } from '../../utils/storage';

interface FleetPerformanceViewProps {
  units: UnitMaster[];
  workOrders: WorkOrder[];
  pmSchedules: PmSchedule[];
  pdmRecords: PdmRecord[];
}

export const FleetPerformanceView: React.FC<FleetPerformanceViewProps> = ({
  units,
  workOrders,
  pmSchedules,
  pdmRecords
}) => {
  const [selectedSite, setSelectedSite] = useState('');
  const [period, setPeriod] = useState<'3M' | '6M' | '12M'>('6M');

  const filteredUnits = selectedSite
    ? units.filter((u) => u.site === selectedSite)
    : units;

  const kpis = calculateFleetKpis(filteredUnits, workOrders, pmSchedules, pdmRecords);

  // Availability trend chart
  const months = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
  const availabilityChartData = {
    labels: months,
    datasets: [
      {
        label: 'PA - Physical Availability (%)',
        data: [91.4, 90.8, 89.6, 92.2, 91.5, kpis.physicalAvailability],
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4
      },
      {
        label: 'MA - Mechanical Availability (%)',
        data: [88.2, 87.5, 86.4, 89.0, 88.3, kpis.mechanicalAvailability],
        borderColor: '#38bdf8',
        backgroundColor: 'transparent',
        tension: 0.35,
        pointRadius: 4
      },
      {
        label: 'UA - Utilization of Availability (%)',
        data: [83.1, 84.5, 82.0, 85.1, 84.2, kpis.utilization],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.35,
        pointRadius: 3
      },
      {
        label: 'Target KPI (90%)',
        data: [90, 90, 90, 90, 90, 90],
        borderColor: '#ef4444',
        borderDash: [2, 2],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  // MTBF vs MTTR Trend Chart
  const mtbfMttrChartData = {
    labels: months,
    datasets: [
      {
        type: 'line' as const,
        label: 'MTBF (Mean Time Between Failures - Jam)',
        data: [195, 210, 185, 230, 225, kpis.mtbfHours],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        pointRadius: 4,
        yAxisID: 'y'
      },
      {
        type: 'bar' as const,
        label: 'MTTR (Mean Time to Repair - Jam)',
        data: [4.2, 3.8, 4.6, 3.2, 3.5, kpis.mttrHours],
        backgroundColor: '#f59e0b',
        borderRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const sites = Array.from(new Set(units.map((u) => u.site).filter(Boolean)));

  const handleExportCsv = () => {
    const exportRows = filteredUnits.map((u) => {
      const uWos = workOrders.filter((w) => w.unitCode === u.unitCode);
      const uDowntime = uWos.reduce((s, w) => s + (w.downtimeHours || 0), 0);
      const uFailures = uWos.filter((w) => w.type === 'Breakdown').length;

      return {
        UnitCode: u.unitCode,
        Tipe: u.type,
        Site: u.site,
        Status: u.status,
        TargetPA: `${u.targetAvailability}%`,
        ActualHealthScore: u.healthScore,
        DowntimeJam: uDowntime,
        TotalBreakdown: uFailures,
        CurrentMeter: u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent
      };
    });
    exportToCsv('Fleet_Reliability_Performance_KPI', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Fleet Availability, Reliability & Maintenance KPI (PA · MA · UA · MTBF · MTTR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis keandalan alat tambang standar World-Class Mining Maintenance Management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Site Filter */}
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Site Tambang</option>
            {sites.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export KPI</span>
          </button>
        </div>
      </div>

      {/* 6 Key Reliability Formula Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Physical Availability */}
        <div className="bg-[#111827] border border-amber-900/50 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Physical Avail (PA)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
            {kpis.physicalAvailability}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">(Operating + Standby) / Scheduled</p>
        </div>

        {/* Mechanical Availability */}
        <div className="bg-[#111827] border border-sky-900/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-sky-400 uppercase font-semibold">Mechanical Avail (MA)</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono-nums mt-1">
            {kpis.mechanicalAvailability}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Operating / (Operating + Downtime)</p>
        </div>

        {/* Utilization */}
        <div className="bg-[#111827] border border-emerald-900/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">Utilization (UA)</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono-nums mt-1">
            {kpis.utilization}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Operating / Available Hours</p>
        </div>

        {/* MTBF */}
        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MTBF</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono-nums mt-1">
            {kpis.mtbfHours} <span className="text-xs text-slate-400 font-normal">jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Operating Time / Failures</p>
        </div>

        {/* MTTR */}
        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MTTR</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
            {kpis.mttrHours} <span className="text-xs text-slate-400 font-normal">jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Repair Time / Number of Repairs</p>
        </div>

        {/* Total Downtime */}
        <div className="bg-[#111827] border border-rose-900/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-400 uppercase font-semibold">Total Downtime</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono-nums mt-1">
            {kpis.totalDowntimeHours} <span className="text-xs text-rose-300 font-normal">jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Kumulatif Unscheduled Stop</p>
        </div>
      </div>

      {/* 2 Big Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: PA / MA / UA Trend */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tren Ketersediaan & Utilisasi (PA, MA, UA Trend)
              </h3>
              <p className="text-[11px] text-slate-400">Target minimum ketersediaan fisik (PA) ≥ 90.0%</p>
            </div>
            <span className="text-xs font-mono-nums font-bold text-amber-400">
              PA Saat Ini: {kpis.physicalAvailability}%
            </span>
          </div>
          <div className="h-64">
            <Line
              data={availabilityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 8 } } },
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                  y: { min: 75, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 2: MTBF vs MTTR */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tren MTBF (Mean Time Between Failures) vs MTTR
              </h3>
              <p className="text-[11px] text-slate-400">MTBF semakin tinggi = semakin handal · MTTR semakin rendah = semakin cepat repair</p>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={mtbfMttrChartData as any}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 8 } } },
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'MTBF (Jam)', color: '#10b981' }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'MTTR (Jam)', color: '#f59e0b' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Unit Leaderboard Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            Peringkat Keandalan Armada per Unit (Reliability Index)
          </span>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            {filteredUnits.length} Unit Terpantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0a0f1d] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Unit Code</th>
                <th className="py-2.5 px-3">Tipe Alat</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Target PA</th>
                <th className="py-2.5 px-3 text-right">Meter Saat Ini</th>
                <th className="py-2.5 px-3 text-right">Downtime Kumulatif</th>
                <th className="py-2.5 px-3 text-center">Insiden Breakdown</th>
                <th className="py-2.5 px-3 text-center">Health Score</th>
                <th className="py-2.5 px-3">Klasifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUnits.map((u) => {
                const uWos = workOrders.filter((w) => w.unitCode === u.unitCode);
                const uDowntime = uWos.reduce((s, w) => s + (w.downtimeHours || 0), 0);
                const uFailures = uWos.filter((w) => w.type === 'Breakdown').length;

                let scoreBadge = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
                let label = 'EXCELLENT';
                if (u.healthScore < 60) {
                  scoreBadge = 'text-rose-400 bg-rose-950/40 border-rose-500/40';
                  label = 'CRITICAL';
                } else if (u.healthScore < 75) {
                  scoreBadge = 'text-amber-400 bg-amber-950/40 border-amber-500/40';
                  label = 'WATCH';
                } else if (u.healthScore < 90) {
                  scoreBadge = 'text-blue-400 bg-blue-950/40 border-blue-500/40';
                  label = 'GOOD';
                }

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white font-mono-nums">
                      {u.unitCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {u.type} · {u.brand}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-slate-400">
                      {u.targetAvailability}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums font-bold text-amber-400 tabular-nums">
                      {u.paramType === 'KM' ? `${u.kmCurrent.toLocaleString('id-ID')} KM` : `${u.hmCurrent.toLocaleString('id-ID')} HM`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-rose-400 tabular-nums font-semibold">
                      {uDowntime} jam
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-nums text-slate-200">
                      {uFailures} kali
                    </td>
                    <td className="py-2.5 px-3 text-center font-black font-mono-nums text-sm">
                      <span className={u.healthScore >= 90 ? 'text-emerald-400' : u.healthScore >= 75 ? 'text-blue-400' : u.healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                        {u.healthScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scoreBadge}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
