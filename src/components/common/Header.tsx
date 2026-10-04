import React, { useState } from 'react';
import {
  Bell,
  Shield,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { UserRole, AlertItem } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  alerts: AlertItem[];
  onNavigateTab: (tab: string) => void;
  onResetData: () => void;
  onOpenImportExport: () => void;
}

const ROLES: UserRole[] = [
  'ADMIN',
  'PLANT MANAGER',
  'MAINTENANCE MANAGER',
  'PLANNER',
  'SUPERVISOR',
  'MECHANIC',
  'WAREHOUSE',
  'RELIABILITY',
  'VIEWER'
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  alerts,
  onNavigateTab,
  onResetData,
  onOpenImportExport
}) => {
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const criticalCount = alerts.filter((a) => a.type === 'CRITICAL').length;

  return (
    <header className="h-16 bg-[#0f172a] border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-black text-black text-sm tracking-wider shadow-sm">
          PMS
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            PLANT MANAGEMENT SYSTEM
            <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
              MINING FLEET
            </span>
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Heavy Equipment · Truck · Maintenance · Reliability
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Indicators & Quick Actions */}
      <div className="hidden lg:flex items-center gap-5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">Status Operasi:</span>
          <span className="font-semibold text-slate-200">NORMAL PIT PRODUCTION</span>
        </div>
        <span className="text-neutral-700">|</span>
        <button
          onClick={onOpenImportExport}
          className="flex items-center gap-1.5 hover:text-amber-400 text-slate-300 transition-colors cursor-pointer"
          title="Import / Export Data CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Import / Export CSV</span>
        </button>
        <span className="text-neutral-700">|</span>
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 hover:text-amber-400 text-slate-400 transition-colors cursor-pointer"
          title="Reset ke Demo Data Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
        <span className="text-neutral-700">|</span>
        <button
          onClick={() => onNavigateTab('user-guide')}
          className="flex items-center gap-1.5 hover:text-amber-400 text-slate-300 transition-colors cursor-pointer"
          title="Buka Petunjuk Penggunaan Aplikasi"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Petunjuk</span>
        </button>
      </div>

      {/* Zone 3: Alert Center & Role Profile Switcher */}
      <div className="flex items-center gap-3">
        {/* Alert Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
            title="Pusat Peringatan & Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full text-black ${
                criticalCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-400'
              }`}>
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alert Dropdown Panel */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Pusat Peringatan ({alerts.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowAlertMenu(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span>Seluruh unit dan inventaris dalam kondisi aman normal.</span>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        if (alert.linkTab) onNavigateTab(alert.linkTab);
                        setShowAlertMenu(false);
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        alert.type === 'CRITICAL'
                          ? 'bg-rose-950/30 border-rose-800/60 hover:bg-rose-900/40 text-rose-200'
                          : alert.type === 'WARNING'
                          ? 'bg-amber-950/30 border-amber-800/60 hover:bg-amber-900/40 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] uppercase tracking-wide">
                          {alert.title}
                        </span>
                        <span className="text-[10px] opacity-75">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
              Hak Akses
            </span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer pr-1"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-slate-900 text-white">
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
