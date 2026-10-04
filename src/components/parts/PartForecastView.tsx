import React, { useState } from 'react';
import {
  PackageSearch,
  Search,
  Download,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Layers,
  Filter
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import '../charts/ChartSetup';
import { PartMaster, PartGroup } from '../../types';
import { calculatePartForecast } from '../../utils/calculations';
import { formatRupiah, exportToCsv } from '../../utils/storage';

interface PartForecastViewProps {
  parts: PartMaster[];
}

const PART_GROUPS: PartGroup[] = [
  'ENGINE',
  'HYDRAULIC',
  'TRANSMISSION',
  'ELECTRICAL',
  'UNDERCARRIAGE',
  'FINAL DRIVE',
  'BRAKE',
  'STEERING',
  'COOLING SYSTEM',
  'FILTER',
  'LUBRICATION',
  'TYRE',
  'GET',
  'WEAR PART',
  'OTHER'
];

export const PartForecastView: React.FC<PartForecastViewProps> = ({ parts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [forecastHorizon, setForecastHorizon] = useState<'1M' | '3M' | '6M' | '12M'>('3M');

  // Filtered parts
  const filteredParts = parts.filter((p) => {
    const matchSearch =
      p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.component.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup ? p.group === selectedGroup : true;
    return matchSearch && matchGroup;
  });

  // Calculate Group Totals for Dashboard
  const groupStats = PART_GROUPS.map((grp) => {
    const grpParts = parts.filter((p) => p.group === grp);
    const currentStock = grpParts.reduce((s, p) => s + p.currentStock, 0);
    const monthlyCons = grpParts.reduce((s, p) => s + (p.avgConsumption || p.monthlyConsumption || 0), 0);
    const multiplier = forecastHorizon === '1M' ? 1 : forecastHorizon === '3M' ? 3 : forecastHorizon === '6M' ? 6 : 12;
    const forecastDemand = Math.round(monthlyCons * multiplier);
    const recommendedOrder = grpParts.reduce((s, p) => s + calculatePartForecast(p).recommendedOrderQty, 0);
    const estOrderCost = grpParts.reduce(
      (s, p) => s + calculatePartForecast(p).recommendedOrderQty * (p.unitCost || 0),
      0
    );

    let status: 'STOCK SAFE' | 'LOW STOCK' | 'CRITICAL' | 'OVERSTOCK' = 'STOCK SAFE';
    if (grpParts.some((p) => calculatePartForecast(p).stockStatus === 'CRITICAL')) status = 'CRITICAL';
    else if (grpParts.some((p) => calculatePartForecast(p).stockStatus === 'LOW STOCK')) status = 'LOW STOCK';

    return {
      group: grp,
      partCount: grpParts.length,
      currentStock,
      monthlyCons,
      forecastDemand,
      recommendedOrder,
      estOrderCost,
      status
    };
  }).filter((g) => g.partCount > 0);

  // Top 5 Forecast vs Current Stock Chart
  const topParts = filteredParts.slice(0, 6);
  const chartData = {
    labels: topParts.map((p) => p.partNumber),
    datasets: [
      {
        label: 'Current Stock Gudang',
        data: topParts.map((p) => p.currentStock),
        backgroundColor: '#38bdf8',
        borderRadius: 4
      },
      {
        label: `Forecast Kebutuhan (${forecastHorizon})`,
        data: topParts.map((p) => {
          const f = calculatePartForecast(p);
          if (forecastHorizon === '1M') return f.forecast1Month;
          if (forecastHorizon === '3M') return f.forecast3Months;
          if (forecastHorizon === '6M') return f.forecast6Months;
          return f.forecast12Months;
        }),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      },
      {
        label: 'Rekomendasi Order PO',
        data: topParts.map((p) => calculatePartForecast(p).recommendedOrderQty),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const handleExportCsv = () => {
    const exportRows = filteredParts.map((p) => {
      const f = calculatePartForecast(p);
      return {
        PartNumber: p.partNumber,
        PartName: p.partName,
        Group: p.group,
        Komponen: p.component,
        CurrentStock: p.currentStock,
        MinStock: p.minStock,
        MaxStock: p.maxStock,
        AvgMonthlyCons: p.avgConsumption,
        LeadTimeDays: p.leadTimeDays,
        SafetyStock: p.safetyStock,
        OpenPO: p.openPoQty,
        Forecast1M: f.forecast1Month,
        Forecast3M: f.forecast3Months,
        Forecast6M: f.forecast6Months,
        Forecast12M: f.forecast12Months,
        RecommendedOrder: f.recommendedOrderQty,
        StockStatus: f.stockStatus,
        UnitCost: p.unitCost
      };
    });
    exportToCsv(`Part_Forecast_${forecastHorizon}_Mining`, exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PackageSearch className="w-4 h-4 text-amber-400" />
            Spare Part Forecasting & Recommended Order Planning
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: Recommended Order = Forecast Demand + Safety Stock - Current Stock - Open PO
          </p>
        </div>

        {/* Horizon selector and CSV export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0a0f1d] border border-slate-800 p-1 rounded-lg text-xs font-semibold">
            {(['1M', '3M', '6M', '12M'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  forecastHorizon === h ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Group Forecast Spotlight Dashboard */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Ringkasan Kebutuhan Part Berdasarkan Kelompok (Forecast by Group)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {groupStats.map((grp) => {
            let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            if (grp.status === 'CRITICAL') badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
            else if (grp.status === 'LOW STOCK') badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

            return (
              <div
                key={grp.group}
                className="bg-[#0a0f1d] border border-slate-800 hover:border-amber-400/50 p-3 rounded-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{grp.group}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                      {grp.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {grp.partCount} SKUs Terdaftar
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stok Gudang</span>
                      <span className="font-bold font-mono-nums text-slate-200">{grp.currentStock} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Forecast {forecastHorizon}</span>
                      <span className="font-bold font-mono-nums text-amber-400">{grp.forecastDemand} pcs</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-rose-400 font-semibold">Order PO: {grp.recommendedOrder} pcs</span>
                  <span className="font-mono-nums font-bold text-emerald-400">{formatRupiah(grp.estOrderCost)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Perbandingan Stok vs Forecast ({forecastHorizon}) vs Rekomendasi Order PO
            </h3>
            <p className="text-[11px] text-slate-400">
              Menghitung waktu tunggu pengiriman (Lead Time) dan batas stok aman (Safety Stock).
            </p>
          </div>
        </div>
        <div className="h-64">
          <Bar
            data={chartData}
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
      </div>

      {/* Main Forecast Parts Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-[#0f172a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari part number, nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-[#0a0f1d] border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Semua Kelompok Part</option>
              {PART_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-400 font-mono-nums">
            {filteredParts.length} Part SKUs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0a0f1d] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Part Number & Name</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-right">Min / Max</th>
                <th className="py-3 px-3 text-right">Lead Time</th>
                <th className="py-3 px-3 text-right">Safety Stock</th>
                <th className="py-3 px-3 text-right">Open PO</th>
                <th className="py-3 px-3 text-right">Forecast 1M</th>
                <th className="py-3 px-3 text-right">Forecast 3M</th>
                <th className="py-3 px-3 text-right">Rekomendasi Order</th>
                <th className="py-3 px-3">Status Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParts.map((part) => {
                const forecast = calculatePartForecast(part);
                let statusBadge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    STOCK SAFE
                  </span>
                );
                if (forecast.stockStatus === 'CRITICAL') {
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      CRITICAL
                    </span>
                  );
                } else if (forecast.stockStatus === 'LOW STOCK') {
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      LOW STOCK
                    </span>
                  );
                } else if (forecast.stockStatus === 'OVERSTOCK') {
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      OVERSTOCK
                    </span>
                  );
                }

                return (
                  <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-amber-400 font-mono-nums">{part.partNumber}</div>
                      <div className="text-slate-300 truncate max-w-[200px]">{part.partName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {part.group}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white font-mono-nums tabular-nums">
                      {part.currentStock} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono-nums tabular-nums">
                      {part.minStock} / {part.maxStock}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-mono-nums tabular-nums">
                      {part.leadTimeDays} hari
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-mono-nums tabular-nums">
                      {part.safetyStock} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono-nums tabular-nums">
                      {part.openPoQty} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-mono-nums tabular-nums">
                      {forecast.forecast1Month} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400 font-mono-nums tabular-nums">
                      {forecast.forecast3Months} pcs
                    </td>
                    <td className={`py-2.5 px-3 text-right font-black font-mono-nums tabular-nums ${
                      forecast.recommendedOrderQty > 0 ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                      {forecast.recommendedOrderQty > 0 ? `+${forecast.recommendedOrderQty} pcs` : '0 pcs'}
                    </td>
                    <td className="py-2.5 px-3">
                      {statusBadge}
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
