import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  RotateCcw,
  Building2,
  HardHat,
  Database,
  Check,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SettingsViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onRoleChange,
  onResetData
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const rolesList: {
    role: UserRole;
    desc: string;
    permissions: string[];
  }[] = [
    {
      role: 'ADMIN',
      desc: 'Akses penuh ke seluruh konfigurasi sistem, database, dan manajemen user.',
      permissions: ['All CRUD', 'Database Reset', 'User Management', 'Export/Import', 'Rules Overhaul']
    },
    {
      role: 'PLANT MANAGER',
      desc: 'Otoritas eksekutif operasional, pengawasan KPI ketersediaan alat, dan budget maintenance.',
      permissions: ['View Dashboard', 'Approve WO > 50jt', 'Executive Reporting', 'View Reliability']
    },
    {
      role: 'MAINTENANCE MANAGER',
      desc: 'Memimpin divisi perawatan harian, persetujuan jadwal PM/PDM, dan alokasi workshop bay.',
      permissions: ['Manage PM Schedule', 'Manage Work Orders', 'RCA Approval', 'Workshop Dispatch']
    },
    {
      role: 'PLANNER',
      desc: 'Penyusunan jadwal PM, peramalan kebutuhan part (Forecasting), dan backlog planning.',
      permissions: ['Create/Edit PM', 'Part Forecast PO', 'Schedule Downtime', 'Material Reservation']
    },
    {
      role: 'SUPERVISOR',
      desc: 'Pengawas lapangan pit & workshop, penugasan mekanik, dan verifikasi perbaikan.',
      permissions: ['Create/Close WO', 'Assign Mechanics', 'Log Inspection', 'Mark PM Completed']
    },
    {
      role: 'MECHANIC',
      desc: 'Teknisi pelaksana perbaikan di pit dan stall workshop, pencatatan spare parts terpakai.',
      permissions: ['Update WO Progress', 'Log Parts Used', 'Input HM/KM Log', 'Safety Checklist']
    },
    {
      role: 'WAREHOUSE',
      desc: 'Pengelolaan stok gudang suku cadang, penerimaan PO suplai, dan mutasi barang.',
      permissions: ['Manage Part Master', 'Stock In / Out', 'Stock Opname', 'Purchase Request']
    },
    {
      role: 'RELIABILITY',
      desc: 'Insinyur keandalan alat, analisis Pareto 80/20, investigasi 5-Why RCA, dan umur komponen.',
      permissions: ['RCA Management', 'Component Life Tracking', 'Pareto Analytics', 'Oil SOS Audit']
    },
    {
      role: 'VIEWER',
      desc: 'Akses monitoring read-only untuk auditor, klien tambang, atau divisi keuangan.',
      permissions: ['Read-Only Dashboard', 'Export Reports', 'View Units Status']
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-amber-400" />
          Pengaturan Sistem & Hak Akses Pengguna (Role Management)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola peran pengguna, izin operasi modul, dan parameter dasar operasional sistem manajemen alat berat.
        </p>
      </div>

      {/* Role Management Cards */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Matriks Peran Pengguna (User Roles Matrix)
            </h3>
            <p className="text-[11px] text-slate-400">
              Pilih peran aktif Anda saat ini untuk menguji hak akses pada modul.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Peran Aktif:</span>
            <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded">
              {currentRole}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rolesList.map((item) => {
            const isSelected = currentRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => onRoleChange(item.role)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-950/50'
                    : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {item.role}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {item.desc}
                </p>

                <div className="pt-2 border-t border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Hak Akses:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.permissions.map((p) => (
                      <span key={p} className="px-1.5 py-0.2 bg-slate-900 border border-slate-700 rounded text-[9px] text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Maintenance and Reset */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          Pemeliharaan Basis Data & Reset Demo
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Seluruh data tersimpan secara lokal di browser Anda (LocalStorage). Jika Anda ingin mengembalikan kondisi database ke data awal standar pabrik pertambangan (20 unit, 50 WO, 100 part transaksi, komponen & PM lengkap), klik tombol di bawah ini.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Seluruh Data ke Default Demo Data</span>
          </button>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={onResetData}
        title="Reset Seluruh Database Demo"
        message="Tindakan ini akan menghapus semua perubahan manual dan memuat ulang 20 unit alat berat, 50 WO, 100 part, PM schedules, dan data PDM default."
        confirmText="Ya, Reset Database"
        isDestructive={true}
      />
    </div>
  );
};
