import React, { useState, useEffect, useMemo } from 'react';
import {
  loadAllAppData,
  saveStoredData,
  resetAllToDefault,
  STORAGE_KEYS
} from './utils/storage';
import {
  UnitMaster,
  DailyHmKmLog,
  PmSchedule,
  PdmRecord,
  WorkOrder,
  WoLog,
  ComponentItem,
  PartMaster,
  PartTransaction,
  RcaRecord,
  UserRole,
  GlobalFilterState,
  AlertItem
} from './types';
import { calculatePartForecast } from './utils/calculations';

// Common components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalFilterBar } from './components/common/GlobalFilterBar';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Feature modules
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { MasterUnitView } from './components/fleet/MasterUnitView';
import { DailyLogView } from './components/hm-km/DailyLogView';
import { PmManagementView } from './components/pm/PmManagementView';
import { PmComplianceView } from './components/pm/PmComplianceView';
import { PdmManagementView } from './components/pdm/PdmManagementView';
import { WorkOrderView } from './components/work-orders/WorkOrderView';
import { WoTrackingKanban } from './components/work-orders/WoTrackingKanban';
import { WoLogView } from './components/work-orders/WoLogView';
import { ParetoAnalysisView } from './components/reliability/ParetoAnalysisView';
import { ComponentAnalysisView } from './components/reliability/ComponentAnalysisView';
import { RcaView } from './components/reliability/RcaView';
import { PartForecastView } from './components/parts/PartForecastView';
import { InventoryView } from './components/parts/InventoryView';
import { FleetPerformanceView } from './components/reliability/FleetPerformanceView';
import { ReportCenterView } from './components/reports/ReportCenterView';
import { SettingsView } from './components/settings/SettingsView';
import { UserGuideView } from './components/help/UserGuideView';
import { DataImportExportModal } from './components/data/DataImportExportModal';

export default function App() {
  // Load state from LocalStorage
  const [data, setData] = useState(() => loadAllAppData());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Global filters
  const [filters, setFilters] = useState<GlobalFilterState>({
    site: '',
    department: '',
    unitType: '',
    unitId: '',
    status: '',
    contractor: '',
    dateRange: 'ALL',
    searchQuery: ''
  });

  // Sync state back to LocalStorage whenever modified
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.UNITS, data.units);
  }, [data.units]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.DAILY_LOGS, data.dailyLogs);
  }, [data.dailyLogs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PM_SCHEDULES, data.pmSchedules);
  }, [data.pmSchedules]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PDM_RECORDS, data.pdmRecords);
  }, [data.pdmRecords]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.COMPONENTS, data.components);
  }, [data.components]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PARTS, data.parts);
  }, [data.parts]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PART_TRANSACTIONS, data.partTransactions);
  }, [data.partTransactions]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.WORK_ORDERS, data.workOrders);
  }, [data.workOrders]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.WO_LOGS, data.woLogs);
  }, [data.woLogs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.RCA_RECORDS, data.rcaRecords);
  }, [data.rcaRecords]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.USER_ROLE, data.userRole);
  }, [data.userRole]);

  // Handle Full Demo Reset
  const handleResetData = () => {
    resetAllToDefault();
    setData(loadAllAppData());
    setFilters({
      site: '',
      department: '',
      unitType: '',
      unitId: '',
      status: '',
      contractor: '',
      dateRange: 'ALL',
      searchQuery: ''
    });
  };

  // Generate automated alerts
  const alerts: AlertItem[] = useMemo(() => {
    const list: AlertItem[] = [];

    // 1. PM Overdue
    data.pmSchedules
      .filter((p) => p.status === 'OVERDUE')
      .forEach((p) => {
        list.push({
          id: `alert-pm-overdue-${p.id}`,
          type: 'CRITICAL',
          category: 'PM',
          title: `PM OVERDUE: ${p.unitCode}`,
          message: `${p.pmType} telah melebihi target meter sejauh ${Math.abs(p.remaining)} meter.`,
          timestamp: p.dueDate,
          unitCode: p.unitCode,
          linkTab: 'pm-management'
        });
      });

    // 2. PDM Critical
    data.pdmRecords
      .filter((p) => p.status === 'CRITICAL')
      .forEach((p) => {
        list.push({
          id: `alert-pdm-crit-${p.id}`,
          type: 'CRITICAL',
          category: 'PDM',
          title: `PDM KRITIS: ${p.unitCode}`,
          message: `${p.component} - ${p.parameter} (${p.actualValue} ${p.unitOfMeasure}) melebihi batas kritis.`,
          timestamp: p.inspectionDate,
          unitCode: p.unitCode,
          linkTab: 'pdm-management'
        });
      });

    // 3. Unit Breakdown
    data.units
      .filter((u) => u.status === 'BREAKDOWN')
      .forEach((u) => {
        list.push({
          id: `alert-bd-${u.id}`,
          type: 'CRITICAL',
          category: 'BREAKDOWN',
          title: `UNIT BREAKDOWN: ${u.unitCode}`,
          message: `Unit terhenti di ${u.location}. Tindakan penanganan darurat dibutuhkan.`,
          timestamp: 'Hari Ini',
          unitCode: u.unitCode,
          linkTab: 'work-order'
        });
      });

    // 4. Critical Stock
    data.parts
      .filter((p) => calculatePartForecast(p).stockStatus === 'CRITICAL')
      .forEach((p) => {
        list.push({
          id: `alert-stock-${p.id}`,
          type: 'CRITICAL',
          category: 'STOCK',
          title: `STOK KRITIS: ${p.partNumber}`,
          message: `${p.partName} tersisa ${p.currentStock} pcs (Min: ${p.minStock} pcs).`,
          timestamp: 'Hari Ini',
          linkTab: 'part-forecast'
        });
      });

    // 5. PM Due Soon
    data.pmSchedules
      .filter((p) => p.status === 'DUE SOON')
      .forEach((p) => {
        list.push({
          id: `alert-pm-due-${p.id}`,
          type: 'WARNING',
          category: 'PM',
          title: `PM DUE SOON: ${p.unitCode}`,
          message: `${p.pmType} akan jatuh tempo dalam sisa ${p.remaining} meter.`,
          timestamp: p.dueDate,
          unitCode: p.unitCode,
          linkTab: 'pm-management'
        });
      });

    return list;
  }, [data.pmSchedules, data.pdmRecords, data.units, data.parts]);

  // Filtered dataset application based on GlobalFilterState
  const filteredUnits = useMemo(() => {
    return data.units.filter((u) => {
      const matchSite = filters.site ? u.site === filters.site : true;
      const matchDept = filters.department ? u.department === filters.department : true;
      const matchType = filters.unitType ? u.type === filters.unitType : true;
      const matchStatus = filters.status ? u.status === filters.status : true;
      const matchContractor = filters.contractor ? u.contractor === filters.contractor : true;
      const matchSearch = filters.searchQuery
        ? u.unitCode.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          u.equipNumber.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          u.brand.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : true;

      return matchSite && matchDept && matchType && matchStatus && matchContractor && matchSearch;
    });
  }, [data.units, filters]);

  const filteredWorkOrders = useMemo(() => {
    return data.workOrders.filter((wo) => {
      const unit = data.units.find((u) => u.unitCode === wo.unitCode);
      const matchSite = filters.site ? unit?.site === filters.site : true;
      const matchDept = filters.department ? unit?.department === filters.department : true;
      const matchType = filters.unitType ? unit?.type === filters.unitType : true;
      const matchSearch = filters.searchQuery
        ? wo.woNumber.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          wo.unitCode.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          wo.failure.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : true;

      return matchSite && matchDept && matchType && matchSearch;
    });
  }, [data.workOrders, data.units, filters]);

  // Unit CRUD handlers
  const handleAddUnit = (newUnit: Omit<UnitMaster, 'id'>) => {
    const unit: UnitMaster = {
      ...newUnit,
      id: `u-${Date.now()}`
    };
    setData((prev) => ({ ...prev, units: [unit, ...prev.units] }));
  };

  const handleUpdateUnit = (id: string, updated: Partial<UnitMaster>) => {
    setData((prev) => ({
      ...prev,
      units: prev.units.map((u) => (u.id === id ? { ...u, ...updated } : u))
    }));
  };

  const handleDeleteUnit = (id: string) => {
    setData((prev) => ({
      ...prev,
      units: prev.units.filter((u) => u.id !== id)
    }));
  };

  // Daily log handlers
  const handleAddLog = (newLog: Omit<DailyHmKmLog, 'id'>) => {
    const log: DailyHmKmLog = {
      ...newLog,
      id: `log-${Date.now()}`
    };
    // Also update the unit's current meter
    setData((prev) => {
      const updatedUnits = prev.units.map((u) => {
        if (u.unitCode === log.unitCode) {
          if (u.paramType === 'KM') {
            return { ...u, kmCurrent: log.closingHmKm };
          } else {
            return { ...u, hmCurrent: log.closingHmKm };
          }
        }
        return u;
      });
      return {
        ...prev,
        dailyLogs: [log, ...prev.dailyLogs],
        units: updatedUnits
      };
    });
  };

  const handleUpdateLog = (id: string, updated: Partial<DailyHmKmLog>) => {
    setData((prev) => ({
      ...prev,
      dailyLogs: prev.dailyLogs.map((l) => (l.id === id ? { ...l, ...updated } : l))
    }));
  };

  const handleDeleteLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      dailyLogs: prev.dailyLogs.filter((l) => l.id !== id)
    }));
  };

  // PM Schedule handlers
  const handleAddPm = (newPm: Omit<PmSchedule, 'id'>) => {
    const pm: PmSchedule = {
      ...newPm,
      id: `pm-${Date.now()}`
    };
    setData((prev) => ({ ...prev, pmSchedules: [pm, ...prev.pmSchedules] }));
  };

  const handleUpdatePm = (id: string, updated: Partial<PmSchedule>) => {
    setData((prev) => ({
      ...prev,
      pmSchedules: prev.pmSchedules.map((p) => (p.id === id ? { ...p, ...updated } : p))
    }));
  };

  const handleDeletePm = (id: string) => {
    setData((prev) => ({
      ...prev,
      pmSchedules: prev.pmSchedules.filter((p) => p.id !== id)
    }));
  };

  const handleCompletePm = (id: string) => {
    setData((prev) => ({
      ...prev,
      pmSchedules: prev.pmSchedules.map((p) => {
        if (p.id === id) {
          const nextTarget = p.currentHmKm + p.interval;
          return {
            ...p,
            lastPmHmKm: p.currentHmKm,
            nextPmHmKm: nextTarget,
            remaining: p.interval,
            status: 'SAFE',
            completionDate: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      })
    }));
  };

  // PDM Records handlers
  const handleAddPdm = (newPdm: Omit<PdmRecord, 'id'>) => {
    const pdm: PdmRecord = {
      ...newPdm,
      id: `pdm-${Date.now()}`
    };
    setData((prev) => ({ ...prev, pdmRecords: [pdm, ...prev.pdmRecords] }));
  };

  const handleUpdatePdm = (id: string, updated: Partial<PdmRecord>) => {
    setData((prev) => ({
      ...prev,
      pdmRecords: prev.pdmRecords.map((r) => (r.id === id ? { ...r, ...updated } : r))
    }));
  };

  const handleDeletePdm = (id: string) => {
    setData((prev) => ({
      ...prev,
      pdmRecords: prev.pdmRecords.filter((r) => r.id !== id)
    }));
  };

  // Work Order handlers
  const handleAddWo = (newWo: Omit<WorkOrder, 'id'>) => {
    const wo: WorkOrder = {
      ...newWo,
      id: `wo-${Date.now()}`
    };
    setData((prev) => ({ ...prev, workOrders: [wo, ...prev.workOrders] }));
  };

  const handleUpdateWo = (id: string, updated: Partial<WorkOrder>) => {
    setData((prev) => ({
      ...prev,
      workOrders: prev.workOrders.map((w) => (w.id === id ? { ...w, ...updated } : w))
    }));
  };

  const handleDeleteWo = (id: string) => {
    setData((prev) => ({
      ...prev,
      workOrders: prev.workOrders.filter((w) => w.id !== id)
    }));
  };

  const handleUpdateWoStatus = (id: string, newStatus: any) => {
    setData((prev) => {
      const wo = prev.workOrders.find((w) => w.id === id);
      const newLog: WoLog = {
        id: `wlog-${Date.now()}`,
        woId: id,
        woNumber: wo?.woNumber || 'WO',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        activity: `Status Changed to ${newStatus}`,
        user: `${prev.userRole}`,
        notes: `Work Order dialihkan ke status ${newStatus}`
      };

      return {
        ...prev,
        workOrders: prev.workOrders.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
        woLogs: [newLog, ...prev.woLogs]
      };
    });
  };

  // WO Log handlers
  const handleAddWoLog = (newLog: Omit<WoLog, 'id'>) => {
    const log: WoLog = {
      ...newLog,
      id: `wlog-${Date.now()}`
    };
    setData((prev) => ({ ...prev, woLogs: [log, ...prev.woLogs] }));
  };

  // Component handlers
  const handleAddComponent = (newComp: Omit<ComponentItem, 'id'>) => {
    const comp: ComponentItem = {
      ...newComp,
      id: `comp-${Date.now()}`
    };
    setData((prev) => ({ ...prev, components: [comp, ...prev.components] }));
  };

  const handleUpdateComponent = (id: string, updated: Partial<ComponentItem>) => {
    setData((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, ...updated } : c))
    }));
  };

  const handleDeleteComponent = (id: string) => {
    setData((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id)
    }));
  };

  // Part Master handlers
  const handleAddPart = (newPart: Omit<PartMaster, 'id'>) => {
    const part: PartMaster = {
      ...newPart,
      id: `part-${Date.now()}`
    };
    setData((prev) => ({ ...prev, parts: [part, ...prev.parts] }));
  };

  const handleUpdatePart = (id: string, updated: Partial<PartMaster>) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) => (p.id === id ? { ...p, ...updated } : p))
    }));
  };

  const handleDeletePart = (id: string) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== id)
    }));
  };

  const handleAddTransaction = (newTx: Omit<PartTransaction, 'id'>) => {
    const tx: PartTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`
    };
    setData((prev) => ({ ...prev, partTransactions: [tx, ...prev.partTransactions] }));
  };

  // RCA handlers
  const handleAddRca = (newRca: Omit<RcaRecord, 'id'>) => {
    const rca: RcaRecord = {
      ...newRca,
      id: `rca-${Date.now()}`
    };
    setData((prev) => ({ ...prev, rcaRecords: [rca, ...prev.rcaRecords] }));
  };

  const handleUpdateRca = (id: string, updated: Partial<RcaRecord>) => {
    setData((prev) => ({
      ...prev,
      rcaRecords: prev.rcaRecords.map((r) => (r.id === id ? { ...r, ...updated } : r))
    }));
  };

  const handleDeleteRca = (id: string) => {
    setData((prev) => ({
      ...prev,
      rcaRecords: prev.rcaRecords.filter((r) => r.id !== id)
    }));
  };

  // Bulk import committers
  const handleImportUnits = (newUnits: UnitMaster[]) => {
    setData((prev) => ({ ...prev, units: [...newUnits, ...prev.units] }));
  };
  const handleImportLogs = (newLogs: DailyHmKmLog[]) => {
    setData((prev) => ({ ...prev, dailyLogs: [...newLogs, ...prev.dailyLogs] }));
  };
  const handleImportWos = (newWos: WorkOrder[]) => {
    setData((prev) => ({ ...prev, workOrders: [...newWos, ...prev.workOrders] }));
  };
  const handleImportParts = (newParts: PartMaster[]) => {
    setData((prev) => ({ ...prev, parts: [...newParts, ...prev.parts] }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Zone 1, 2, 3 Top Header */}
      <Header
        currentRole={data.userRole}
        onRoleChange={(role) => setData((prev) => ({ ...prev, userRole: role }))}
        alerts={alerts}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onResetData={handleResetData}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Dark Industrial Sidebar Navigation */}
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId)}
            openWoCount={data.workOrders.filter((w) => w.status === 'OPEN' || w.status === 'IN PROGRESS').length}
            overduePmCount={data.pmSchedules.filter((p) => p.status === 'OVERDUE').length}
            pdmCriticalCount={data.pdmRecords.filter((p) => p.status === 'CRITICAL').length}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Multi-parameter Global Filter Bar */}
          <div className="no-print">
            <GlobalFilterBar
              filters={filters}
              onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
              onResetFilters={() =>
                setFilters({
                  site: '',
                  department: '',
                  unitType: '',
                  unitId: '',
                  status: '',
                  contractor: '',
                  dateRange: 'ALL',
                  searchQuery: ''
                })
              }
              units={data.units}
            />
          </div>

          <div className="flex-1 p-4 sm:p-6 max-w-[1700px] w-full mx-auto">
            {/* 1. Executive Dashboard */}
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                units={filteredUnits}
                workOrders={filteredWorkOrders}
                pmSchedules={data.pmSchedules}
                pdmRecords={data.pdmRecords}
                components={data.components}
                parts={data.parts}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* 2. Master Unit */}
            {activeTab === 'master-unit' && (
              <MasterUnitView
                units={filteredUnits}
                onAddUnit={handleAddUnit}
                onUpdateUnit={handleUpdateUnit}
                onDeleteUnit={handleDeleteUnit}
              />
            )}

            {/* 3. Daily HM/KM Log */}
            {activeTab === 'daily-log' && (
              <DailyLogView
                logs={data.dailyLogs}
                units={data.units}
                onAddLog={handleAddLog}
                onUpdateLog={handleUpdateLog}
                onDeleteLog={handleDeleteLog}
              />
            )}

            {/* 4. PM Preventive Maintenance */}
            {activeTab === 'pm-management' && (
              <PmManagementView
                pmSchedules={data.pmSchedules}
                units={data.units}
                onAddPm={handleAddPm}
                onUpdatePm={handleUpdatePm}
                onDeletePm={handleDeletePm}
                onCompletePm={handleCompletePm}
              />
            )}

            {/* 5. PM Compliance % */}
            {activeTab === 'pm-compliance' && (
              <PmComplianceView
                pmSchedules={data.pmSchedules}
                units={filteredUnits}
              />
            )}

            {/* 6. PDM Predictive Maintenance */}
            {activeTab === 'pdm-management' && (
              <PdmManagementView
                pdmRecords={data.pdmRecords}
                units={data.units}
                onAddPdm={handleAddPdm}
                onUpdatePdm={handleUpdatePdm}
                onDeletePdm={handleDeletePdm}
              />
            )}

            {/* 7. Work Order List */}
            {activeTab === 'work-order' && (
              <WorkOrderView
                workOrders={filteredWorkOrders}
                units={data.units}
                onAddWo={handleAddWo}
                onUpdateWo={handleUpdateWo}
                onDeleteWo={handleDeleteWo}
                onLogActivity={(woId, woNum, act, notes) =>
                  handleAddWoLog({
                    woId,
                    woNumber: woNum,
                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    activity: act,
                    user: `${data.userRole}`,
                    notes
                  })
                }
              />
            )}

            {/* 8. WO Tracking Kanban */}
            {activeTab === 'wo-tracking' && (
              <WoTrackingKanban
                workOrders={filteredWorkOrders}
                onUpdateWoStatus={handleUpdateWoStatus}
              />
            )}

            {/* 9. WO Activity Log */}
            {activeTab === 'wo-log' && (
              <WoLogView
                woLogs={data.woLogs}
                workOrders={data.workOrders}
                onAddLog={handleAddWoLog}
              />
            )}

            {/* 10. Pareto Analysis */}
            {activeTab === 'pareto-analysis' && (
              <ParetoAnalysisView
                workOrders={filteredWorkOrders}
                units={data.units}
              />
            )}

            {/* 11. Component Life Analysis */}
            {activeTab === 'component-analysis' && (
              <ComponentAnalysisView
                components={data.components}
                units={data.units}
                onAddComponent={handleAddComponent}
                onUpdateComponent={handleUpdateComponent}
                onDeleteComponent={handleDeleteComponent}
              />
            )}

            {/* 12. RCA (Root Cause Analysis) */}
            {activeTab === 'rca' && (
              <RcaView
                rcaRecords={data.rcaRecords}
                workOrders={data.workOrders}
                onAddRca={handleAddRca}
                onUpdateRca={handleUpdateRca}
                onDeleteRca={handleDeleteRca}
              />
            )}

            {/* 13. Part Forecast */}
            {activeTab === 'part-forecast' && (
              <PartForecastView parts={data.parts} />
            )}

            {/* 14. Inventory Master & Transactions */}
            {activeTab === 'inventory' && (
              <InventoryView
                parts={data.parts}
                transactions={data.partTransactions}
                onAddPart={handleAddPart}
                onUpdatePart={handleUpdatePart}
                onDeletePart={handleDeletePart}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {/* 15. Fleet Performance & Reliability */}
            {activeTab === 'fleet-performance' && (
              <FleetPerformanceView
                units={filteredUnits}
                workOrders={filteredWorkOrders}
                pmSchedules={data.pmSchedules}
                pdmRecords={data.pdmRecords}
              />
            )}

            {/* 16. Report Center */}
            {activeTab === 'reports' && (
              <ReportCenterView
                units={filteredUnits}
                workOrders={filteredWorkOrders}
                pmSchedules={data.pmSchedules}
                pdmRecords={data.pdmRecords}
                components={data.components}
                parts={data.parts}
              />
            )}

            {/* 17. Settings & Roles */}
            {activeTab === 'settings' && (
              <SettingsView
                currentRole={data.userRole}
                onRoleChange={(r) => setData((prev) => ({ ...prev, userRole: r }))}
                onResetData={handleResetData}
              />
            )}

            {/* 18. Petunjuk Penggunaan Aplikasi (User Guide) */}
            {activeTab === 'user-guide' && (
              <UserGuideView onNavigateTab={(tab) => setActiveTab(tab)} />
            )}
          </div>
        </main>
      </div>

      {/* CSV Import/Export Modal */}
      <DataImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportUnits={handleImportUnits}
        onImportLogs={handleImportLogs}
        onImportWos={handleImportWos}
        onImportParts={handleImportParts}
        allData={data}
      />

      {/* Network Connectivity Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
