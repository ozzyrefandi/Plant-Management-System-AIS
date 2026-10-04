import React, { useState } from 'react';
import {
  KanbanSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Wrench,
  User,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { WorkOrder, WoStatus } from '../../types';
import { formatRupiah } from '../../utils/storage';

interface WoTrackingKanbanProps {
  workOrders: WorkOrder[];
  onUpdateWoStatus: (id: string, newStatus: WoStatus) => void;
  onSelectWo?: (wo: WorkOrder) => void;
}

const KANBAN_COLUMNS: { id: WoStatus | 'REPAIR' | 'TESTING'; label: string; color: string; border: string }[] = [
  { id: 'OPEN', label: '1. OPEN (DITERIMA)', color: 'text-rose-400', border: 'border-rose-500/40' },
  { id: 'IN PROGRESS', label: '2. IN PROGRESS (DIAGNOSA)', color: 'text-amber-400', border: 'border-amber-500/40' },
  { id: 'WAITING PART', label: '3. WAITING PART', color: 'text-purple-400', border: 'border-purple-500/40' },
  { id: 'WAITING MANPOWER', label: '4. REPAIR & MANPOWER', color: 'text-blue-400', border: 'border-blue-500/40' },
  { id: 'COMPLETED', label: '5. TESTING / SELESAI', color: 'text-cyan-400', border: 'border-cyan-500/40' },
  { id: 'CLOSED', label: '6. CLOSED / RELEASE', color: 'text-emerald-400', border: 'border-emerald-500/40' }
];

export const WoTrackingKanban: React.FC<WoTrackingKanbanProps> = ({
  workOrders,
  onUpdateWoStatus,
  onSelectWo
}) => {
  const totalWo = workOrders.length;
  const openWo = workOrders.filter((w) => w.status === 'OPEN').length;
  const inProgressWo = workOrders.filter((w) => w.status === 'IN PROGRESS').length;
  const waitingPartWo = workOrders.filter((w) => w.status === 'WAITING PART').length;
  const waitingManWo = workOrders.filter((w) => w.status === 'WAITING MANPOWER').length;
  const closedWo = workOrders.filter((w) => w.status === 'CLOSED' || w.status === 'COMPLETED').length;

  const totalDowntime = workOrders.reduce((sum, w) => sum + (w.downtimeHours || 0), 0);
  const avgRepairTime = totalWo > 0 ? (totalDowntime / totalWo).toFixed(1) : '0';
  const backlogCount = openWo + inProgressWo + waitingPartWo + waitingManWo;

  // Move status handler
  const handleMoveStatus = (wo: WorkOrder, direction: 'next' | 'prev') => {
    const statuses: WoStatus[] = [
      'OPEN',
      'IN PROGRESS',
      'WAITING PART',
      'WAITING MANPOWER',
      'COMPLETED',
      'CLOSED'
    ];
    const currentIndex = statuses.indexOf(wo.status);
    if (direction === 'next' && currentIndex < statuses.length - 1) {
      onUpdateWoStatus(wo.id, statuses[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      onUpdateWoStatus(wo.id, statuses[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <KanbanSquare className="w-4 h-4 text-amber-400" />
          WO Tracking & Real-Time Maintenance Pipeline (Kanban Board)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pantau progres eksekusi perbaikan dari Open hingga Unit Released. Klik panah untuk memindahkan status alur kerja.
        </p>
      </div>

      {/* 9 Core KPIs for Tracking */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
        <div className="bg-[#111827] border border-slate-800 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total WO</span>
          <div className="text-lg font-black text-white font-mono-nums mt-0.5">{totalWo}</div>
        </div>
        <div className="bg-[#111827] border border-rose-900/40 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-rose-400 uppercase font-semibold">Open WO</span>
          <div className="text-lg font-black text-rose-400 font-mono-nums mt-0.5">{openWo}</div>
        </div>
        <div className="bg-[#111827] border border-amber-900/40 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">In Progress</span>
          <div className="text-lg font-black text-amber-400 font-mono-nums mt-0.5">{inProgressWo}</div>
        </div>
        <div className="bg-[#111827] border border-purple-900/40 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-purple-400 uppercase font-semibold">Waiting Part</span>
          <div className="text-lg font-black text-purple-400 font-mono-nums mt-0.5">{waitingPartWo}</div>
        </div>
        <div className="bg-[#111827] border border-blue-900/40 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-blue-400 uppercase font-semibold">Waiting Man</span>
          <div className="text-lg font-black text-blue-400 font-mono-nums mt-0.5">{waitingManWo}</div>
        </div>
        <div className="bg-[#111827] border border-emerald-900/40 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Closed WO</span>
          <div className="text-lg font-black text-emerald-400 font-mono-nums mt-0.5">{closedWo}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Repair</span>
          <div className="text-lg font-black text-amber-400 font-mono-nums mt-0.5">{avgRepairTime} <span className="text-[10px]">jam</span></div>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Respon</span>
          <div className="text-lg font-black text-slate-200 font-mono-nums mt-0.5">25 <span className="text-[10px]">mnt</span></div>
        </div>
        <div className="bg-[#111827] border border-amber-900/50 p-2.5 rounded-lg text-center">
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Backlog</span>
          <div className="text-lg font-black text-amber-300 font-mono-nums mt-0.5">{backlogCount}</div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start min-h-[500px]">
        {KANBAN_COLUMNS.map((col) => {
          const colWos = workOrders.filter((w) => {
            if (col.id === 'COMPLETED') return w.status === 'COMPLETED';
            return w.status === col.id;
          });

          return (
            <div
              key={col.id}
              className="bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col max-h-[700px] overflow-hidden shadow-sm"
            >
              {/* Column Header */}
              <div className={`p-3 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-bold font-mono-nums bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                  {colWos.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="p-2 overflow-y-auto space-y-2 flex-1 min-h-[120px]">
                {colWos.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-[11px] italic">
                    Kosong
                  </div>
                ) : (
                  colWos.map((wo) => {
                    let priorityBadge = 'bg-slate-800 text-slate-300';
                    if (wo.priority === 'EMERGENCY') priorityBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                    else if (wo.priority === 'HIGH') priorityBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';

                    return (
                      <div
                        key={wo.id}
                        className="bg-[#111827] border border-slate-700/80 hover:border-amber-400/60 p-2.5 rounded-lg shadow-sm space-y-2 transition-all group"
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-amber-400 text-xs font-mono-nums">
                            {wo.woNumber}
                          </span>
                          <span className="font-bold text-white text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                            {wo.unitCode}
                          </span>
                        </div>

                        {/* Problem info */}
                        <div className="text-xs">
                          <div className="font-semibold text-slate-200 line-clamp-1">{wo.failure}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{wo.component}</div>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className={`px-1.5 py-0.2 rounded font-bold ${priorityBadge}`}>
                            {wo.priority}
                          </span>
                          <span className="font-mono-nums text-slate-300">{wo.downtimeHours} jam</span>
                        </div>

                        <div className="text-[10px] text-slate-400 truncate">
                          Mekanik: <span className="text-slate-200">{wo.mechanic}</span>
                        </div>

                        {/* Movement controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <button
                            disabled={col.id === 'OPEN'}
                            onClick={() => handleMoveStatus(wo, 'prev')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Pindah ke status sebelumnya"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSelectWo && onSelectWo(wo)}
                            className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                          >
                            Detail
                          </button>

                          <button
                            disabled={col.id === 'CLOSED'}
                            onClick={() => handleMoveStatus(wo, 'next')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                            title="Pindah ke status berikutnya"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
