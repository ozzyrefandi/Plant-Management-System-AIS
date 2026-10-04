import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Flame,
  Clock,
  DollarSign,
  Layers,
  Building2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { WorkOrder, UnitMaster } from '../../types';
import { calculatePareto, ParetoItem } from '../../utils/calculations';
import { formatRupiah, exportToCsv } from '../../utils/storage';

interface ParetoAnalysisViewProps {
  workOrders: WorkOrder[];
  units: UnitMaster[];
}

type ParetoDimension =
  | 'failure'
  | 'component'
  | 'unit'
  | 'model'
  | 'brand'
  | 'cause'
  | 'downtime'
  | 'cost';

export const ParetoAnalysisView: React.FC<ParetoAnalysisViewProps> = ({
  workOrders,
  units
}) => {
  const [dimension, setDimension] = useState<ParetoDimension>('component');
  const [metric, setMetric] = useState<'downtime' | 'cost' | 'frequency'>('downtime');
  const [limit, setLimit] = useState<5 | 10>(5);

  // Group work orders by dimension
  const rawItems = workOrders.map((wo) => {
    const unit = units.find((u) => u.unitCode === wo.unitCode);
    let key = wo.component || 'Lainnya';

    if (dimension === 'failure') key = wo.failure || 'Lainnya';
    else if (dimension === 'component') key = wo.component || 'Lainnya';
    else if (dimension === 'unit') key = wo.unitCode || 'Lainnya';
    else if (dimension === 'model') key = unit?.model || 'Model Unknown';
    else if (dimension === 'brand') key = unit?.brand || 'Brand Unknown';
    else if (dimension === 'cause') key = wo.cause ? wo.cause.slice(0, 30) + '...' : 'Lainnya';

    let value = 1;
    if (metric === 'downtime') value = wo.downtimeHours || 0.5;
    else if (metric === 'cost') value = wo.totalCost || 1000000;
    else if (metric === 'frequency') value = 1;

    return { key, value };
  });

  const fullPareto = calculatePareto(rawItems);
  const paretoResults = fullPareto.slice(0, limit);

  const paretoChartData = {
    labels: paretoResults.map((p) => p.label),
    datasets: [
      {
        type: 'bar' as const,
        label: metric === 'downtime' ? 'Downtime (Jam)' : metric === 'cost' ? 'Biaya (Rp)' : 'Frekuensi (Kasus)',
        data: paretoResults.map((p) => p.value),
        backgroundColor: '#eab308',
        yAxisID: 'y',
        borderRadius: 4
      },
      {
        type: 'line' as const,
        label: '% Kumulatif (80/20)',
        data: paretoResults.map((p) => p.cumulativePercentage),
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        pointRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const handleExportCsv = () => {
    const exportRows = fullPareto.map((p, idx) => ({
      Rank: idx + 1,
      Kategori: p.label,
      Nilai: p.value,
      Persentase: `${p.percentage}%`,
      Kumulatif: `${p.cumulativePercentage}%`
    }));
    exportToCsv(`Pareto_Analysis_${dimension}_${metric}`, exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Pareto 80/20 Analysis (Failure & Downtime Optimization)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prinsip Pareto: 80% downtime & biaya perbaikan tambang diakibatkan oleh 20% penyebab utama.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Pareto</span>
        </button>
      </div>

      {/* Dimension and Metric Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        {/* Dimension buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Dimensi:</span>
          {(
            [
              ['component', 'Komponen'],
              ['failure', 'Kegagalan / Failure'],
              ['unit', 'Unit Armada'],
              ['model', 'Model Alat'],
              ['brand', 'Brand'],
              ['cause', 'Penyebab (Cause)']
            ] as const
          ).map(([dimKey, label]) => (
            <button
              key={dimKey}
              onClick={() => setDimension(dimKey as ParetoDimension)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                dimension === dimKey
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Metric and Limit */}
        <div className="flex items-center gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="downtime">Berdasarkan Downtime (Jam)</option>
            <option value="cost">Berdasarkan Biaya (Cost Rp)</option>
            <option value="frequency">Berdasarkan Frekuensi Kasus</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as 5 | 10)}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Grafik Pareto {limit} Teratas: {dimension.toUpperCase()} (Tolak Ukur: {metric.toUpperCase()})
            </h3>
            <p className="text-[11px] text-slate-400">
              Batang menunjukkan besaran riil, garis biru menunjukkan persentase kumulatif 80% threshold.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            Target Fokus: 80% Dampak
          </span>
        </div>

        <div className="h-72">
          <Bar
            data={paretoChartData as any}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { boxWidth: 10, padding: 8 } }
              },
              scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: {
                  type: 'linear',
                  position: 'left',
                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                  title: {
                    display: true,
                    text: metric === 'downtime' ? 'Jam' : metric === 'cost' ? 'Rupiah' : 'Kasus',
                    color: '#94a3b8'
                  }
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

      {/* Pareto Results Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider">
            Tabel Rincian Kontributor Pareto
          </span>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            {paretoResults.length} Kategori Masalah Terbesar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0a0f1d] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Peringkat</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Nilai Kontribusi</th>
                <th className="py-2.5 px-3 text-right">Pangsa (%)</th>
                <th className="py-2.5 px-3 text-right">Kumulatif (%)</th>
                <th className="py-2.5 px-3">Prioritas Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paretoResults.map((item, idx) => {
                const isUnder80 = item.cumulativePercentage <= 80 || idx === 0;

                return (
                  <tr key={item.label} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono-nums text-amber-400">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.label}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-slate-200">
                      {metric === 'cost' ? formatRupiah(item.value) : metric === 'downtime' ? `${item.value} jam` : `${item.value} kali`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-slate-300">
                      {item.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums font-bold text-amber-400">
                      {item.cumulativePercentage}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isUnder80
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isUnder80 ? 'PRIORITAS UTAMA (VITAL 20%)' : 'SECONDARY'}
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
