import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Gauge,
  CalendarClock,
  CheckCheck,
  Activity,
  Wrench,
  KanbanSquare,
  History,
  BarChart3,
  Cpu,
  PackageSearch,
  Boxes,
  Target,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  openWoCount?: number;
  overduePmCount?: number;
  pdmCriticalCount?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openWoCount = 0,
  overduePmCount = 0,
  pdmCriticalCount = 0
}) => {
  const sections: MenuSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'fleet-performance', label: 'Fleet Reliability & KPI', icon: TrendingUp }
      ]
    },
    {
      title: 'FLEET & PARAMETER',
      items: [
        { id: 'master-unit', label: 'Master Unit Alat', icon: Truck },
        { id: 'daily-log', label: 'Log HM / KM Harian', icon: Gauge }
      ]
    },
    {
      title: 'MAINTENANCE',
      items: [
        {
          id: 'pm-management',
          label: 'PM Preventive',
          icon: CalendarClock,
          badge: overduePmCount,
          badgeColor: 'bg-rose-500 text-white'
        },
        { id: 'pm-compliance', label: 'PM Compliance %', icon: CheckCheck },
        {
          id: 'pdm-management',
          label: 'PDM Predictive Oil/SOS',
          icon: Activity,
          badge: pdmCriticalCount,
          badgeColor: 'bg-amber-400 text-black'
        }
      ]
    },
    {
      title: 'WORK ORDER (WO)',
      items: [
        {
          id: 'work-order',
          label: 'Work Order List',
          icon: Wrench,
          badge: openWoCount,
          badgeColor: 'bg-amber-500 text-black'
        },
        { id: 'wo-tracking', label: 'WO Tracking Kanban', icon: KanbanSquare },
        { id: 'wo-log', label: 'WO Activity Log', icon: History }
      ]
    },
    {
      title: 'RELIABILITY & ANALISIS',
      items: [
        { id: 'pareto-analysis', label: 'Pareto 80/20 Analysis', icon: BarChart3 },
        { id: 'component-analysis', label: 'Component Life Analysis', icon: Cpu },
        { id: 'rca', label: 'RCA & 5-Why Failure', icon: Target }
      ]
    },
    {
      title: 'SPARE PART & INVENTORY',
      items: [
        { id: 'part-forecast', label: 'Part Forecast Demand', icon: PackageSearch },
        { id: 'inventory', label: 'Part Master & Stock', icon: Boxes }
      ]
    },
    {
      title: 'LAPORAN & SISTEM',
      items: [
        { id: 'reports', label: 'Report Center & Print', icon: FileSpreadsheet },
        { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
      ]
    },
    {
      title: 'BANTUAN & PANDUAN',
      items: [
        { id: 'user-guide', label: 'Petunjuk Penggunaan', icon: BookOpen }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-neutral-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {sec.title}
            </div>
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-amber-400 text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* PWA Offline Install Button */}
      <div className="px-3 pb-2">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-neutral-800 bg-[#070b14] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Local Database OK</span>
        </div>
        <button
          onClick={() => onSelectTab('user-guide')}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Panduan</span>
        </button>
      </div>
    </aside>
  );
};
