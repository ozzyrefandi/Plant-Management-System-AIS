import React from 'react';
import { Filter, Search, RotateCcw, Building2, MapPin, Layers } from 'lucide-react';
import { GlobalFilterState, UnitMaster } from '../../types';

interface GlobalFilterBarProps {
  filters: GlobalFilterState;
  onFilterChange: (filters: Partial<GlobalFilterState>) => void;
  onResetFilters: () => void;
  units: UnitMaster[];
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  units
}) => {
  const sites = Array.from(new Set(units.map((u) => u.site).filter(Boolean)));
  const departments = Array.from(new Set(units.map((u) => u.department).filter(Boolean)));
  const unitTypes = Array.from(new Set(units.map((u) => u.type).filter(Boolean)));
  const contractors = Array.from(new Set(units.map((u) => u.contractor).filter(Boolean)));

  const isFiltered =
    filters.site !== '' ||
    filters.department !== '' ||
    filters.unitType !== '' ||
    filters.status !== '' ||
    filters.contractor !== '' ||
    filters.dateRange !== 'ALL' ||
    filters.searchQuery !== '';

  return (
    <div className="bg-[#0f172a] border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[11px] shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Global:</span>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari Unit / No WO / Part..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full bg-[#111827] border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Site Filter */}
        <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 rounded-md px-2 py-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.site}
            onChange={(e) => onFilterChange({ site: e.target.value })}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">Semua Site Tambang</option>
            {sites.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-slate-200">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 rounded-md px-2 py-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ department: e.target.value })}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-slate-200">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Type Filter */}
        <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 rounded-md px-2 py-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.unitType}
            onChange={(e) => onFilterChange({ unitType: e.target.value })}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">Semua Tipe Unit</option>
            {unitTypes.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-slate-200">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="bg-[#111827] border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-slate-900 text-slate-200">Semua Status Unit</option>
          <option value="RUNNING" className="bg-slate-900 text-slate-200">RUNNING</option>
          <option value="STANDBY" className="bg-slate-900 text-slate-200">STANDBY</option>
          <option value="BREAKDOWN" className="bg-slate-900 text-slate-200">BREAKDOWN</option>
          <option value="PM" className="bg-slate-900 text-slate-200">PM</option>
          <option value="PDM" className="bg-slate-900 text-slate-200">PDM</option>
          <option value="WAITING PART" className="bg-slate-900 text-slate-200">WAITING PART</option>
          <option value="WAITING SERVICE" className="bg-slate-900 text-slate-200">WAITING SERVICE</option>
        </select>

        {/* Contractor Filter */}
        <select
          value={filters.contractor}
          onChange={(e) => onFilterChange({ contractor: e.target.value })}
          className="bg-[#111827] border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-slate-900 text-slate-200">Semua Kontraktor / Owner</option>
          {contractors.map((c) => (
            <option key={c} value={c} className="bg-slate-900 text-slate-200">
              {c}
            </option>
          ))}
        </select>

        {/* Date Range Selector */}
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ dateRange: e.target.value as GlobalFilterState['dateRange'] })}
          className="bg-[#111827] border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-slate-900 text-slate-200">Semua Periode</option>
          <option value="TODAY" className="bg-slate-900 text-slate-200">Hari Ini</option>
          <option value="LAST_7_DAYS" className="bg-slate-900 text-slate-200">7 Hari Terakhir</option>
          <option value="THIS_MONTH" className="bg-slate-900 text-slate-200">Bulan Ini</option>
          <option value="THIS_YEAR" className="bg-slate-900 text-slate-200">Tahun 2026</option>
        </select>
      </div>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1.5 rounded-md transition-colors font-medium shrink-0 cursor-pointer"
          title="Reset semua filter ke kondisi awal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      )}
    </div>
  );
};
