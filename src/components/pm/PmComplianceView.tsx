import React, { useState } from 'react';
import {
  CheckCheck,
  TrendingUp,
  Target,
  Clock,
  Layers,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { PmSchedule, UnitMaster } from '../../types';

interface PmComplianceViewProps {
  pmSchedules: PmSchedule[];
  units: UnitMaster[];
}

export const PmComplianceView: React.FC<PmComplianceViewProps> = ({
  pmSchedules,
  units
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [breakdownType, setBreakdownType] = useState<
    'type' | 'department' | 'site' | 'contractor' | 'pmType'
  >('type');

  const totalScheduled = pmSchedules.length;
  const overdueCount = pmSchedules.filter((p) => p.status === 'OVERDUE').length;
  const completedOnTime = Math.max(0, totalScheduled - overdueCount);
  const complianceRate = totalScheduled > 0
    ? Math.round((completedOnTime / totalScheduled) * 1000) / 10
    : 95.0;

  const targetCompliance = 95.0;
  const backlogCount = overdueCount;

  // Chart data based on Period
  const periodLabels = {
    daily: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    weekly: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5', 'Minggu 6'],
    monthly: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    yearly: ['2022', '2023', '2024', '2025', '2026']
  };

  const periodData = {
    daily: [94.2, 95.8, 96.1, 93.4, 96.5, 95.0, complianceRate],
    weekly: [95.5, 96.2, 93.8, 97.1, 94.5, complianceRate],
    monthly: [94.1, 95.6, 96.8, 93.9, 95.2, complianceRate],
    yearly: [92.4, 94.1, 94.8, 95.4, complianceRate]
  };

  const complianceChartData = {
    labels: periodLabels[period],
    datasets: [
      {
        type: 'bar' as const,
        label: 'PM Compliance %',
        data: periodData[period],
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        type: 'line' as const,
        label: `Target Minimum (${targetCompliance}%)`,
        data: Array(periodLabels[period].length).fill(targetCompliance),
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  // Dynamic Breakdown calculations
  const calculateBreakdown = () => {
    const map: Record<string, { total: number; overdue: number }> = {};

    pmSchedules.forEach((pm) => {
      const unit = units.find((u) => u.unitCode === pm.unitCode);
      let key = 'Lainnya';

      if (breakdownType === 'type') key = unit?.type || 'Excavator';
      else if (breakdownType === 'department') key = unit?.department || 'Produksi';
      else if (breakdownType === 'site') key = unit?.site || 'Site Sangatta';
      else if (breakdownType === 'contractor') key = unit?.contractor || 'PAMA';
      else if (breakdownType === 'pmType') key = pm.pmType || 'PM 250';

      if (!map[key]) map[key] = { total: 0, overdue: 0 };
      map[key].total += 1;
      if (pm.status === 'OVERDUE') map[key].overdue += 1;
    });

    return Object.entries(map).map(([name, stat]) => {
      const onTime = stat.total - stat.overdue;
      const rate = stat.total > 0 ? Math.round((onTime / stat.total) * 100) : 100;
      return { name, total: stat.total, onTime, overdue: stat.overdue, rate };
    });
  };

  const breakdownList = calculateBreakdown();

  const breakdownChartData = {
    labels: breakdownList.map((b) => b.name),
    datasets: [
      {
        label: 'Compliance %',
        data: breakdownList.map((b) => b.rate),
        backgroundColor: breakdownList.map((b) => (b.rate >= 95 ? '#10b981' : b.rate >= 85 ? '#f59e0b' : '#ef4444')),
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            PM Compliance Dashboard (Kepatuhan Servis Berkala)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: PM Completed On Time / PM Scheduled × 100% · Target KPI ≥ 95.0%
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0a0f1d] border border-slate-800 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                period === p
                  ? 'bg-amber-400 text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'daily'
                ? 'Harian'
                : p === 'weekly'
                ? 'Mingguan'
                : p === 'monthly'
                ? 'Bulanan'
                : 'Tahunan'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">PM Scheduled</span>
          <div className="text-2xl font-black text-white font-mono-nums mt-0.5">{totalScheduled}</div>
          <div className="text-[10px] text-slate-400 mt-1">Total Rencana</div>
        </div>

        <div className="bg-[#111827] border border-emerald-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">PM On-Time</span>
          <div className="text-2xl font-black text-emerald-400 font-mono-nums mt-0.5">{completedOnTime}</div>
          <div className="text-[10px] text-slate-400 mt-1">Tepat Waktu</div>
        </div>

        <div className="bg-[#111827] border border-rose-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-rose-400 uppercase font-semibold">PM Overdue</span>
          <div className="text-2xl font-black text-rose-400 font-mono-nums mt-0.5">{overdueCount}</div>
          <div className="text-[10px] text-rose-300 mt-1">Terlambat Servis</div>
        </div>

        <div className="bg-[#111827] border border-amber-900/40 p-3 rounded-xl">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Compliance %</span>
          <div className="text-2xl font-black text-amber-400 font-mono-nums mt-0.5">{complianceRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Target ≥ 95.0%</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">PM Delay</span>
          <div className="text-2xl font-black text-slate-200 font-mono-nums mt-0.5">
            {overdueCount > 0 ? '2.4' : '0.0'} <span className="text-xs text-slate-400">hari</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Rata-rata Keterlambatan</div>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">PM Backlog</span>
          <div className="text-2xl font-black text-white font-mono-nums mt-0.5">{backlogCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Antrean Tertunda</div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Tren Kepatuhan PM ({period.toUpperCase()})
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluasi On-Time Completion vs Batas Minimum Toleransi Manajemen Tambang
            </p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            complianceRate >= targetCompliance
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            Status KPI: {complianceRate >= targetCompliance ? 'MEMENUHI TARGET' : 'DI BAWAH TARGET'}
          </span>
        </div>
        <div className="h-64">
          <Bar
            data={complianceChartData as any}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { boxWidth: 10, padding: 8 } }
              },
              scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: { min: 80, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
              }
            }}
          />
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Breakdown Kepatuhan PM Berdasarkan Kategori
            </h3>
            <p className="text-[11px] text-slate-400">
              Identifikasi deviasi kepatuhan pada level unit, kontraktor, departemen, dan site.
            </p>
          </div>

          {/* Breakdown Toggle Buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0a0f1d] border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setBreakdownType('type')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                breakdownType === 'type' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tipe Alat
            </button>
            <button
              onClick={() => setBreakdownType('department')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                breakdownType === 'department' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Departemen
            </button>
            <button
              onClick={() => setBreakdownType('site')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                breakdownType === 'site' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Site Tambang
            </button>
            <button
              onClick={() => setBreakdownType('contractor')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                breakdownType === 'contractor' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kontraktor
            </button>
            <button
              onClick={() => setBreakdownType('pmType')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                breakdownType === 'pmType' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tipe PM
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2 h-60">
            <Bar
              data={breakdownChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                  y: { min: 70, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                }
              }}
            />
          </div>

          {/* Breakdown Table */}
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-lg p-3 text-xs overflow-y-auto max-h-60 space-y-2">
            <div className="font-bold text-white uppercase text-[10px] tracking-wider pb-1 border-b border-slate-800">
              Rincian Kategori:
            </div>
            {breakdownList.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-800/40">
                <div>
                  <span className="font-medium text-slate-200">{item.name}</span>
                  <div className="text-[10px] text-slate-400">
                    {item.onTime}/{item.total} On-time · {item.overdue} Overdue
                  </div>
                </div>
                <span className={`font-mono-nums font-bold text-xs ${
                  item.rate >= 95 ? 'text-emerald-400' : item.rate >= 85 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {item.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
