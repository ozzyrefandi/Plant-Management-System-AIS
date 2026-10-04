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
  UserRole
} from '../types';
import {
  INITIAL_UNITS,
  INITIAL_DAILY_LOGS,
  INITIAL_PM_SCHEDULES,
  INITIAL_PDM_RECORDS,
  INITIAL_COMPONENTS,
  INITIAL_PARTS,
  INITIAL_PART_TRANSACTIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_WO_LOGS,
  INITIAL_RCA_RECORDS
} from '../data/mockData';

const STORAGE_KEYS = {
  UNITS: 'PMS_UNITS_DATA',
  DAILY_LOGS: 'PMS_DAILY_LOGS_DATA',
  PM_SCHEDULES: 'PMS_PM_SCHEDULES_DATA',
  PDM_RECORDS: 'PMS_PDM_RECORDS_DATA',
  COMPONENTS: 'PMS_COMPONENTS_DATA',
  PARTS: 'PMS_PARTS_DATA',
  PART_TRANSACTIONS: 'PMS_PART_TRANSACTIONS_DATA',
  WORK_ORDERS: 'PMS_WORK_ORDERS_DATA',
  WO_LOGS: 'PMS_WO_LOGS_DATA',
  RCA_RECORDS: 'PMS_RCA_RECORDS_DATA',
  USER_ROLE: 'PMS_USER_ROLE'
};

export function getStoredData<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultData;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

export function resetAllToDefault() {
  saveStoredData(STORAGE_KEYS.UNITS, INITIAL_UNITS);
  saveStoredData(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
  saveStoredData(STORAGE_KEYS.PM_SCHEDULES, INITIAL_PM_SCHEDULES);
  saveStoredData(STORAGE_KEYS.PDM_RECORDS, INITIAL_PDM_RECORDS);
  saveStoredData(STORAGE_KEYS.COMPONENTS, INITIAL_COMPONENTS);
  saveStoredData(STORAGE_KEYS.PARTS, INITIAL_PARTS);
  saveStoredData(STORAGE_KEYS.PART_TRANSACTIONS, INITIAL_PART_TRANSACTIONS);
  saveStoredData(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
  saveStoredData(STORAGE_KEYS.WO_LOGS, INITIAL_WO_LOGS);
  saveStoredData(STORAGE_KEYS.RCA_RECORDS, INITIAL_RCA_RECORDS);
  saveStoredData(STORAGE_KEYS.USER_ROLE, 'PLANT MANAGER');
}

export function loadAllAppData() {
  return {
    units: getStoredData<UnitMaster[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS),
    dailyLogs: getStoredData<DailyHmKmLog[]>(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS),
    pmSchedules: getStoredData<PmSchedule[]>(STORAGE_KEYS.PM_SCHEDULES, INITIAL_PM_SCHEDULES),
    pdmRecords: getStoredData<PdmRecord[]>(STORAGE_KEYS.PDM_RECORDS, INITIAL_PDM_RECORDS),
    components: getStoredData<ComponentItem[]>(STORAGE_KEYS.COMPONENTS, INITIAL_COMPONENTS),
    parts: getStoredData<PartMaster[]>(STORAGE_KEYS.PARTS, INITIAL_PARTS),
    partTransactions: getStoredData<PartTransaction[]>(STORAGE_KEYS.PART_TRANSACTIONS, INITIAL_PART_TRANSACTIONS),
    workOrders: getStoredData<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS),
    woLogs: getStoredData<WoLog[]>(STORAGE_KEYS.WO_LOGS, INITIAL_WO_LOGS),
    rcaRecords: getStoredData<RcaRecord[]>(STORAGE_KEYS.RCA_RECORDS, INITIAL_RCA_RECORDS),
    userRole: getStoredData<UserRole>(STORAGE_KEYS.USER_ROLE, 'PLANT MANAGER')
  };
}

export { STORAGE_KEYS };

// Currency and numbers formatters
export function formatRupiah(value: number): string {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatHmKm(value: number, paramType: 'HM' | 'KM'): string {
  if (value === undefined || value === null || isNaN(value)) return `0 ${paramType}`;
  return `${value.toLocaleString('id-ID')} ${paramType}`;
}

export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('id-ID');
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let cell = row[header];
          if (cell === null || cell === undefined) cell = '';
          if (typeof cell === 'object') cell = JSON.stringify(cell);
          const cellStr = String(cell).replace(/"/g, '""');
          return `"${cellStr}"`;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
