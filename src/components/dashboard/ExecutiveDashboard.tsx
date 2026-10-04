import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Wrench,
  Truck,
  Activity,
  Layers,
  Gauge,
  ArrowUpRight
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { RadialGaugeChart } from '../charts/RadialGaugeChart';
import {
  UnitMaster,
  WorkOrder,
  PmSchedule,
  PdmRecord,
  ComponentItem,
  PartMaster
} from '../../types';
import {
  calculateFleetKpis,
  calculatePareto,
  calculatePartForecast,
  generateSmartRecommendations
} from '../../utils/calculations';

interface ExecutiveDashboardProps {
  units: UnitMaster[];
  workOrders: WorkOrder[];
  pmSchedules: PmSchedule[];
  pdmRecords: PdmRecord[];
  components: ComponentItem[];
  parts: PartMaster[];
  onNavigateTab: (tabId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  units,
  workOrders,
  pmSchedules,
  pdmRecords,
  components,
  parts,
  onNavigateTab
}) => {
  const kpis = calculateFleetKpis(units, workOrders, pmSchedules, pdmRecords);
  const recommendations = generateSmartRecommendations(
    units,
    pmSchedules,
    components,
    parts,
    workOrders
  );

  // Fleet Average Unit Health Score
  const avgHealthScore =
    units.length > 0
      ? Math.round(
          (units.reduce((sum, u) => sum + (u.healthScore || 85), 0) / units.length) * 10
        ) / 10
      : 85.0;

  const excellentUnits = units.filter((u) => (u.healthScore || 85) >= 90).length;
  const goodUnits = units.filter((u) => (u.healthScore || 85) >= 75 && (u.healthScore || 85) < 90).length;
  const watchUnits = units.filter((u) => (u.healthScore || 85) >= 60 && (u.healthScore || 85) < 75).length;
  const criticalUnits = units.filter((u) => (u.healthScore || 85) < 60).length;

  // Fleet Overview Categories & Rates
  const heavyEquipmentCount = units.filter((u) =>
    ['Excavator', 'Dozer', 'Wheel Loader', 'Motor Grader'].includes(u.type)
  ).length;
  const truckCount = units.filter((u) =>
    ['Dump Truck', 'Articulated Dump Truck', 'Water Truck', 'Fuel Truck', 'Service Truck'].includes(u.type)
  ).length;
  const lightVehicleCount = units.filter((u) =>
    ['Light Vehicle', 'Support Equipment', 'Other'].includes(u.type)
  ).length;

  const activePct = units.length > 0 ? Math.round((kpis.runningUnits / units.length) * 100) : 0;
  const breakdownPct = units.length > 0 ? Math.round((kpis.breakdownUnits / units.length) * 100) : 0;
  const standbyPct = units.length > 0 ? Math.round((kpis.standbyUnits / units.length) * 100) : 0;
  const maintenanceUnits =
    kpis.pmUnits + kpis.pdmUnits + kpis.waitingPartUnits + kpis.waitingServiceUnits;
  const maintenancePct = units.length > 0 ? Math.round((maintenanceUnits / units.length) * 100) : 0;

  // 1. Availability Trend Data (Last 6 Months)
  const months = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
  const availabilityChartData = {
    labels: months,
    datasets: [
      {
        label: 'PA - Physical Availability (%)',
        data: [91.2, 90.8, 89.4, 92.1, 91.5, kpis.physicalAvailability],
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#eab308'
      },
      {
        label: 'MA - Mechanical Availability (%)',
        data: [88.5, 87.9, 86.8, 89.2, 88.0, kpis.mechanicalAvailability],
        borderColor: '#38bdf8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#38bdf8'
      },
      {
        label: 'Target KPI (90%)',
        data: [90, 90, 90, 90, 90, 90],
        borderColor: '#ef4444',
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  // 2. PM Compliance Trend Data
  const pmComplianceChartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [
      {
        label: 'PM Compliance %',
        data: [96.2, 94.8, 97.5, 93.1, 95.8, kpis.pmComplianceRate],
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        type: 'line' as const,
        label: 'Target (95%)',
        data: [95, 95, 95, 95, 95, 95],
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        pointRadius: 0
      }
    ]
  };

  // 3. Breakdown Incident Trend
  const breakdownTrendData = {
    labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    datasets: [
      {
        label: 'Jumlah Kasus Breakdown',
        data: [8, 6, 9, 5, 4, Math.max(2, kpis.breakdownUnits + 1)],
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  // 4. Pareto Failure Data
  const failureItems = workOrders.map((wo) => ({
    key: wo.component || 'Lainnya',
    value: wo.downtimeHours || 1
  }));
  const paretoResults = calculatePareto(failureItems);
  const topPareto = paretoResults.slice(0, 5);

  const paretoChartData = {
    labels: topPareto.map((p) => p.label),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Downtime (Jam)',
        data: topPareto.map((p) => p.value),
        backgroundColor: '#f59e0b',
        yAxisID: 'y'
      },
      {
        type: 'line' as const,
        label: 'Kumulatif %',
        data: topPareto.map((p) => p.cumulativePercentage),
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        pointRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  // 5. Downtime by Component Distribution
  const downtimeComponentData = {
    labels: topPareto.map((p) => p.label),
    datasets: [
      {
        data: topPareto.map((p) => p.value),
        backgroundColor: [
          '#eab308',
          '#f97316',
          '#06b6d4',
          '#8b5cf6',
          '#ec4899'
        ],
        borderWidth: 0
      }
    ]
  };

  // 6. WO Status Distribution
  const woOpen = workOrders.filter((w) => w.status === 'OPEN').length;
  const woInProgress = workOrders.filter((w) => w.status === 'IN PROGRESS').length;
  const woWaitingPart = workOrders.filter((w) => w.status === 'WAITING PART').length;
  const woWaitingMan = workOrders.filter((w) => w.status === 'WAITING MANPOWER').length;
  const woCompleted = workOrders.filter((w) => w.status === 'COMPLETED' || w.status === 'CLOSED').length;

  const woStatusChartData = {
    labels: ['Open', 'In Progress', 'Waiting Part', 'Waiting Manpower', 'Closed/Done'],
    datasets: [
      {
        data: [woOpen, woInProgress, woWaitingPart, woWaitingMan, woCompleted],
        backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#64748b', '#10b981'],
        borderWidth: 0
      }
    ]
  };

  // 7. Spare Part Forecast Comparison (Top 4 Parts)
  const topParts = parts.slice(0, 4);
  const partForecastChartData = {
    labels: topParts.map((p) => p.partNumber),
    datasets: [
      {
        label: 'Current Stock',
        data: topParts.map((p) => p.currentStock),
        backgroundColor: '#38bdf8'
      },
      {
        label: 'Forecast 3 Bulan',
        data: topParts.map((p) => calculatePartForecast(p).forecast3Months),
        backgroundColor: '#eab308'
      },
      {
        label: 'Rekomendasi Order PO',
        data: topParts.map((p) => calculatePartForecast(p).recommendedOrderQty),
        backgroundColor: '#ef4444'
      }
    ]
  };

  // 8. Part Stock Health Status
  const stockSafe = parts.filter((p) => calculatePartForecast(p).stockStatus === 'STOCK SAFE').length;
  const stockLow = parts.filter((p) => calculatePartForecast(p).stockStatus === 'LOW STOCK').length;
  const stockCrit = parts.filter((p) => calculatePartForecast(p).stockStatus === 'CRITICAL').length;
  const stockOver = parts.filter((p) => calculatePartForecast(p).stockStatus === 'OVERSTOCK').length;

  const stockStatusChartData = {
    labels: ['Safe', 'Low Stock', 'Critical', 'Overstock'],
    datasets: [
      {
        data: [stockSafe, stockLow, stockCrit, stockOver],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
        borderWidth: 0
      }
    ]
  };

  const chartOptionsDefault = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 10, padding: 8, font: { size: 10 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Recommendations Banner */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Smart Maintenance Recommendations ({recommendations.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-300 font-medium">Real-Time Operational Insights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/90 border border-slate-700 hover:border-amber-400/60 p-3 rounded-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        rec.urgency === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {rec.urgency}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{rec.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab(rec.targetTab)}
                  className="mt-3 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
                >
                  <span>{rec.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Fleet Overview Section */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Fleet Overview
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Monitoring ketersediaan, status operasional & utilisasi seluruh unit alat berat tambang
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('master-unit')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80"
          >
            <span>Master Unit Fleet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Fleet Size */}
          <div
            onClick={() => onNavigateTab('master-unit')}
            className="bg-gradient-to-br from-[#111827] via-[#111827] to-[#0f172a] border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Fleet Size
                </span>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-white font-mono-nums tracking-tight group-hover:text-amber-400 transition-colors">
                  {kpis.totalUnits}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">Unit Terdata</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <div className="text-slate-400 text-[9px] uppercase font-medium">Alat Berat</div>
                  <div className="font-mono-nums font-bold text-slate-200 text-xs mt-0.5">{heavyEquipmentCount}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <div className="text-slate-400 text-[9px] uppercase font-medium">Hauler/Truck</div>
                  <div className="font-mono-nums font-bold text-slate-200 text-xs mt-0.5">{truckCount}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800 text-center">
                  <div className="text-slate-400 text-[9px] uppercase font-medium">LV / Support</div>
                  <div className="font-mono-nums font-bold text-slate-200 text-xs mt-0.5">{lightVehicleCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Active Units */}
          <div
            onClick={() => onNavigateTab('master-unit')}
            className="bg-gradient-to-br from-[#111827] via-[#111827] to-emerald-950/25 border border-emerald-900/40 hover:border-emerald-500/50 p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Active Units (Running)
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-400 font-mono-nums tracking-tight">
                  {kpis.runningUnits}
                </span>
                <span className="text-xs font-semibold text-emerald-400/80 uppercase">Unit Aktif</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Utilisasi Produksi:</span>
                <span className="font-mono-nums font-bold text-emerald-400">{activePct}% Fleet</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activePct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Unit Standby Siap Operasi:</span>
                <span className="font-mono-nums font-bold text-slate-200">
                  {kpis.standbyUnits} unit ({standbyPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Units Currently in Breakdown */}
          <div
            onClick={() => onNavigateTab('work-order')}
            className="bg-gradient-to-br from-[#111827] via-[#111827] to-rose-950/25 border border-rose-900/40 hover:border-rose-500/60 p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-rose-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Units in Breakdown
                </span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-rose-400 font-mono-nums tracking-tight">
                  {kpis.breakdownUnits}
                </span>
                <span className="text-xs font-semibold text-rose-400/80 uppercase">Unit Terhenti</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Dampak Terhenti:</span>
                <span className="font-mono-nums font-bold text-rose-400">{breakdownPct}% Armada Down</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(8, breakdownPct * 3))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Akumulasi Downtime:</span>
                <span className="font-mono-nums font-bold text-rose-300">
                  {kpis.totalDowntimeHours.toLocaleString()} Jam
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Average Fleet Availability Percentage */}
          <div
            onClick={() => onNavigateTab('fleet-performance')}
            className="bg-gradient-to-br from-[#111827] via-[#111827] to-amber-950/25 border border-amber-900/40 hover:border-amber-500/50 p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Avg Fleet Availability
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                  TARGET ≥ 90%
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-400 font-mono-nums tracking-tight">
                  {kpis.physicalAvailability}%
                </span>
                <span className="text-xs font-semibold text-amber-400/80 uppercase font-mono-nums">PA Index</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status Availability:</span>
                <span
                  className={`font-mono-nums font-bold text-[10px] px-1.5 py-0.2 rounded border ${
                    kpis.physicalAvailability >= 90
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {kpis.physicalAvailability >= 90 ? 'MEMENUHI TARGET' : 'PERLU PERHATIAN'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    kpis.physicalAvailability >= 90 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, kpis.physicalAvailability)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Mechanical Availability (MA):</span>
                <span className="font-mono-nums font-bold text-sky-400">
                  {kpis.mechanicalAvailability}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Status Distribution Strip */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-2 text-[11px]">
            <span className="text-slate-400 font-medium">
              Komposisi Kesiapan Armada ({kpis.totalUnits} Unit Terdaftar):
            </span>
            <span className="text-slate-400 text-[10px]">
              Operasional: <strong className="text-emerald-400 font-mono-nums">{activePct}%</strong> | Standby:{' '}
              <strong className="text-slate-300 font-mono-nums">{standbyPct}%</strong> | Down:{' '}
              <strong className="text-rose-400 font-mono-nums">{breakdownPct}%</strong> | Servis:{' '}
              <strong className="text-amber-400 font-mono-nums">{maintenancePct}%</strong>
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {kpis.totalUnits > 0 && (
              <>
                <div
                  style={{ width: `${(kpis.runningUnits / kpis.totalUnits) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Running: ${kpis.runningUnits} unit`}
                />
                <div
                  style={{ width: `${(kpis.standbyUnits / kpis.totalUnits) * 100}%` }}
                  className="bg-slate-400 h-full transition-all duration-500"
                  title={`Standby: ${kpis.standbyUnits} unit`}
                />
                <div
                  style={{ width: `${(kpis.breakdownUnits / kpis.totalUnits) * 100}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Breakdown: ${kpis.breakdownUnits} unit`}
                />
                <div
                  style={{ width: `${(maintenanceUnits / kpis.totalUnits) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Maintenance / PM / PDM: ${maintenanceUnits} unit`}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div
              onClick={() => onNavigateTab('master-unit')}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Running:</span>
              <strong className="text-emerald-400 font-mono-nums">{kpis.runningUnits} unit</strong>
            </div>
            <div
              onClick={() => onNavigateTab('master-unit')}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-400">Standby:</span>
              <strong className="text-slate-300 font-mono-nums">{kpis.standbyUnits} unit</strong>
            </div>
            <div
              onClick={() => onNavigateTab('work-order')}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">Breakdown:</span>
              <strong className="text-rose-400 font-mono-nums">{kpis.breakdownUnits} unit</strong>
            </div>
            <div
              onClick={() => onNavigateTab('pm-management')}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">PM & Perbaikan:</span>
              <strong className="text-amber-400 font-mono-nums">{maintenanceUnits} unit</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fleet Average Unit Health Score - Radial Gauge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Fleet Health Index & Reliability Telemetry
            </h2>
          </div>
          <span className="text-[11px] text-amber-400 font-mono-nums font-semibold">
            Fleet Health Score: {avgHealthScore} / 100
          </span>
        </div>
        <RadialGaugeChart
          score={avgHealthScore}
          title="Rata-rata Skor Kesehatan Armada (Average Unit Health Score)"
          subtitle="Dihitung secara real-time dari rata-rata skor kesehatan individu seluruh armada operasional"
          totalUnits={units.length}
          excellentCount={excellentUnits}
          goodCount={goodUnits}
          watchCount={watchUnits}
          criticalCount={criticalUnits}
        />
      </div>

      {/* 14 Core KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Executive Mining Fleet Telemetry & KPIs
          </h2>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            Last Updated: Real-time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Total Units */}
          <div
            onClick={() => onNavigateTab('master-unit')}
            className="bg-[#111827] border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl transition-all cursor-pointer group"
          >
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Unit</span>
            <div className="text-2xl font-black text-white font-mono-nums mt-1 group-hover:text-amber-400 transition-colors">
              {kpis.totalUnits}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Armada Operasional</div>
          </div>

          {/* Running */}
          <div
            onClick={() => onNavigateTab('master-unit')}
            className="bg-[#111827] border border-emerald-900/30 hover:border-emerald-500/50 p-3 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Running</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono-nums mt-1">
              {kpis.runningUnits}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {Math.round((kpis.runningUnits / kpis.totalUnits) * 100)}% Fleet Aktif
            </div>
          </div>

          {/* Standby */}
          <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Standby</span>
            <div className="text-2xl font-black text-slate-200 font-mono-nums mt-1">
              {kpis.standbyUnits}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Ready / Rain Delay</div>
          </div>

          {/* Breakdown */}
          <div
            onClick={() => onNavigateTab('work-order')}
            className="bg-[#111827] border border-rose-900/40 hover:border-rose-500/60 p-3 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-400 uppercase font-semibold">Breakdown</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono-nums mt-1">
              {kpis.breakdownUnits}
            </div>
            <div className="text-[10px] text-rose-300 mt-1">Unscheduled Stop</div>
          </div>

          {/* PM Due */}
          <div
            onClick={() => onNavigateTab('pm-management')}
            className="bg-[#111827] border border-amber-900/40 hover:border-amber-500/60 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-amber-400 uppercase font-semibold">PM Due Soon</span>
            <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
              {pmSchedules.filter((p) => p.status === 'DUE SOON').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Mendekati Interval</div>
          </div>

          {/* PM Overdue */}
          <div
            onClick={() => onNavigateTab('pm-management')}
            className="bg-[#111827] border border-rose-900/40 hover:border-rose-500/60 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-rose-400 uppercase font-semibold">PM Overdue</span>
            <div className="text-2xl font-black text-rose-400 font-mono-nums mt-1">
              {pmSchedules.filter((p) => p.status === 'OVERDUE').length}
            </div>
            <div className="text-[10px] text-rose-300 mt-1">Melebihi Toleransi</div>
          </div>

          {/* PDM Critical */}
          <div
            onClick={() => onNavigateTab('pdm-management')}
            className="bg-[#111827] border border-rose-900/40 hover:border-rose-500/60 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-rose-400 uppercase font-semibold">PDM Critical</span>
            <div className="text-2xl font-black text-rose-400 font-mono-nums mt-1">
              {kpis.pdmCriticalCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Oil / SOS / Vibrasi</div>
          </div>

          {/* PDM Warning */}
          <div
            onClick={() => onNavigateTab('pdm-management')}
            className="bg-[#111827] border border-amber-900/40 hover:border-amber-500/60 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-amber-400 uppercase font-semibold">PDM Warning</span>
            <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
              {kpis.pdmWarningCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Perlu Watchlist</div>
          </div>

          {/* Open WO */}
          <div
            onClick={() => onNavigateTab('work-order')}
            className="bg-[#111827] border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Open WO</span>
            <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
              {kpis.openWoCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Active Work Order</div>
          </div>

          {/* Waiting Part */}
          <div
            onClick={() => onNavigateTab('part-forecast')}
            className="bg-[#111827] border border-purple-900/30 hover:border-purple-500/50 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-purple-400 uppercase font-semibold">Waiting Part</span>
            <div className="text-2xl font-black text-purple-400 font-mono-nums mt-1">
              {kpis.waitingPartUnits}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pending Suplai</div>
          </div>

          {/* PM Compliance */}
          <div
            onClick={() => onNavigateTab('pm-compliance')}
            className="bg-[#111827] border border-emerald-900/40 p-3 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Compliance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono-nums mt-1">
              {kpis.pmComplianceRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Target ≥ 95%</div>
          </div>

          {/* Physical Availability */}
          <div
            onClick={() => onNavigateTab('fleet-performance')}
            className="bg-[#111827] border border-amber-900/40 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Availability PA</span>
            <div className="text-2xl font-black text-amber-400 font-mono-nums mt-1">
              {kpis.physicalAvailability}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Target ≥ 90%</div>
          </div>

          {/* MTBF */}
          <div
            onClick={() => onNavigateTab('fleet-performance')}
            className="bg-[#111827] border border-slate-800 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MTBF</span>
            <div className="text-2xl font-black text-white font-mono-nums mt-1">
              {kpis.mtbfHours} <span className="text-xs text-slate-400">jam</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Mean Time Between Fail</div>
          </div>

          {/* MTTR */}
          <div
            onClick={() => onNavigateTab('fleet-performance')}
            className="bg-[#111827] border border-slate-800 p-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MTTR</span>
            <div className="text-2xl font-black text-white font-mono-nums mt-1">
              {kpis.mttrHours} <span className="text-xs text-slate-400">jam</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Mean Time to Repair</div>
          </div>
        </div>
      </div>

      {/* 8 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Fleet Availability Trend */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Tren Ketersediaan Armada (Fleet Availability)
              </h3>
              <p className="text-[11px] text-slate-400">PA & MA Bulanan vs Target 90%</p>
            </div>
            <span className="text-xs font-mono-nums text-amber-400 font-bold">
              PA: {kpis.physicalAvailability}%
            </span>
          </div>
          <div className="h-60">
            <Line data={availabilityChartData} options={chartOptionsDefault} />
          </div>
        </div>

        {/* Chart 2: PM Compliance Trend */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Tren Kepatuhan Perawatan (PM Compliance)
              </h3>
              <p className="text-[11px] text-slate-400">Kepatuhan On-Time Mingguan vs Target ≥ 95%</p>
            </div>
            <span className="text-xs font-mono-nums text-emerald-400 font-bold">
              {kpis.pmComplianceRate}%
            </span>
          </div>
          <div className="h-60">
            <Bar data={pmComplianceChartData as any} options={chartOptionsDefault} />
          </div>
        </div>

        {/* Chart 3: Breakdown Trend */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Tren Insiden Kerusakan Unit (Breakdown Frequency)
              </h3>
              <p className="text-[11px] text-slate-400">Frekuensi Kejadian Unscheduled Stop</p>
            </div>
            <span className="text-xs font-mono-nums text-rose-400 font-bold">
              {kpis.breakdownUnits} Unit Kritis
            </span>
          </div>
          <div className="h-60">
            <Bar data={breakdownTrendData} options={chartOptionsDefault} />
          </div>
        </div>

        {/* Chart 4: Pareto Failure (80/20) */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                4. Pareto Failure Analysis (Prinsip 80/20)
              </h3>
              <p className="text-[11px] text-slate-400">Top Kontributor Downtime Jam Operasional</p>
            </div>
            <button
              onClick={() => onNavigateTab('pareto-analysis')}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Lihat Detail Pareto →
            </button>
          </div>
          <div className="h-60">
            <Bar
              data={paretoChartData as any}
              options={{
                ...chartOptionsDefault,
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Jam Downtime', color: '#94a3b8' }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: '% Kumulatif', color: '#38bdf8' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 5: Downtime by Component */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                5. Distribusi Downtime per Komponen Kritis
              </h3>
              <p className="text-[11px] text-slate-400">Komponen Penyerap Jam Perbaikan Terbesar</p>
            </div>
          </div>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={downtimeComponentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
              }}
            />
          </div>
        </div>

        {/* Chart 6: Work Order Status */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                6. Status Tracking Work Order (WO)
              </h3>
              <p className="text-[11px] text-slate-400">Total {workOrders.length} Work Order Terdata</p>
            </div>
            <button
              onClick={() => onNavigateTab('wo-tracking')}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Buka Kanban →
            </button>
          </div>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={woStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
              }}
            />
          </div>
        </div>

        {/* Chart 7: Spare Part Forecast Comparison */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7. Prediksi Kebutuhan Suku Cadang (Part Forecast)
              </h3>
              <p className="text-[11px] text-slate-400">Stok Saat Ini vs Kebutuhan 3 Bulan</p>
            </div>
            <button
              onClick={() => onNavigateTab('part-forecast')}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Kalkulator Forecast →
            </button>
          </div>
          <div className="h-60">
            <Bar data={partForecastChartData} options={chartOptionsDefault} />
          </div>
        </div>

        {/* Chart 8: Part Stock Status */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                8. Status Kesehatan Stok Gudang (Warehouse Health)
              </h3>
              <p className="text-[11px] text-slate-400">Total {parts.length} Part SKU Aktif</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Gudang Part →
            </button>
          </div>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={stockStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Fleet Health Score Summary Strip */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Skor Kesehatan Armada Tambang (Unit Health Index)
            </h3>
            <p className="text-[11px] text-slate-400">
              Kombinasi parameter PM Compliance, PDM SOS, Komponen & Backlog Kerusakan
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 90-100: Excellent
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> 75-89: Good
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 60-74: Watch
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;60: Critical
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
          {units.slice(0, 10).map((unit) => {
            const score = unit.healthScore || 85;
            let scoreColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
            if (score < 60) scoreColor = 'text-rose-400 border-rose-500/40 bg-rose-950/30';
            else if (score < 75) scoreColor = 'text-amber-400 border-amber-500/40 bg-amber-950/30';
            else if (score < 90) scoreColor = 'text-blue-400 border-blue-500/30 bg-blue-950/20';

            return (
              <div
                key={unit.id}
                onClick={() => onNavigateTab('master-unit')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all hover:scale-105 ${scoreColor}`}
              >
                <div className="text-[11px] font-bold text-white">{unit.unitCode}</div>
                <div className="text-lg font-black font-mono-nums">{score}</div>
                <div className="text-[9px] uppercase opacity-75">{unit.type}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
