export type UnitType =
  | 'Excavator'
  | 'Dozer'
  | 'Wheel Loader'
  | 'Motor Grader'
  | 'Dump Truck'
  | 'Articulated Dump Truck'
  | 'Water Truck'
  | 'Fuel Truck'
  | 'Service Truck'
  | 'Light Vehicle'
  | 'Support Equipment'
  | 'Other';

export type MeasurementParam = 'HM' | 'KM';

export type UnitStatus =
  | 'RUNNING'
  | 'STANDBY'
  | 'BREAKDOWN'
  | 'PM'
  | 'PDM'
  | 'WAITING PART'
  | 'WAITING SERVICE'
  | 'DISPOSED';

export type CriticalityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface UnitMaster {
  id: string;
  unitCode: string; // e.g. EX-201, DT-701, LV-012
  equipNumber: string;
  type: UnitType;
  brand: string;
  model: string;
  serialNumber: string;
  engineSerialNumber: string;
  year: number;
  department: string; // Produksi, Hauling, Support, Engineering
  contractor: string; // PT Bukit Makmur, PT Pamapersada, Internal Mining Fleet
  site: string; // Site Sangatta, Site Morowali, Site Tanjung Enim, Site Berau
  status: UnitStatus;
  paramType: MeasurementParam; // Auto-determined from UnitType
  hmCurrent: number;
  kmCurrent: number;
  commissionDate: string;
  location: string; // Pit 1, Pit 2, Workshop Central, Hauling Road KM 12
  operator: string;
  mechanic: string;
  criticality: CriticalityLevel;
  targetAvailability: number; // e.g. 90%
  targetUtilization: number; // e.g. 85%
  lastServiceHmKm: number;
  nextServiceHmKm: number;
  healthScore: number; // 0 - 100
  notes?: string;
}

export interface DailyHmKmLog {
  id: string;
  date: string;
  unitId: string;
  unitCode: string;
  openingHmKm: number;
  closingHmKm: number;
  dailyUsage: number;
  operator: string;
  location: string;
  shift: 'Shift 1 (Day)' | 'Shift 2 (Night)';
  remarks: string;
}

export type PmStatus = 'SAFE' | 'DUE SOON' | 'OVERDUE';

export interface PmSchedule {
  id: string;
  unitId: string;
  unitCode: string;
  pmType: string; // 'PM 250', 'PM 500', 'PM 1000', 'PM 2000', 'PM 5000 KM', 'PM 10000 KM'
  interval: number;
  lastPmHmKm: number;
  currentHmKm: number;
  nextPmHmKm: number;
  remaining: number;
  dueDate: string;
  pic: string;
  status: PmStatus;
  completionDate?: string;
  completedOnTime?: boolean;
  remarks: string;
}

export type PdmStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface PdmRecord {
  id: string;
  unitId: string;
  unitCode: string;
  component: string;
  inspectionDate: string;
  hmKm: number;
  parameter: string; // Engine Oil Fe/Cu/Soot, Hydraulic Temp, Vibration Bearing, Coolant pH, Battery CCA
  actualValue: number;
  normalRange: string;
  warningLimit: number;
  criticalLimit: number;
  unitOfMeasure: string;
  trend: 'STABLE' | 'INCREASING' | 'DECREASING';
  recommendation: string;
  pic: string;
  status: PdmStatus;
}

export type WoType =
  | 'Breakdown'
  | 'Corrective Maintenance'
  | 'Preventive Maintenance'
  | 'Predictive Maintenance'
  | 'Inspection'
  | 'Modification'
  | 'Campaign'
  | 'Tyre'
  | 'Electrical'
  | 'Lubrication';

export type WoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type WoStatus =
  | 'OPEN'
  | 'IN PROGRESS'
  | 'WAITING PART'
  | 'WAITING MANPOWER'
  | 'COMPLETED'
  | 'CLOSED';

export interface WoPartItem {
  partNumber: string;
  partName: string;
  qty: number;
  unitCost: number;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  date: string;
  unitId: string;
  unitCode: string;
  type: WoType;
  component: string;
  failure: string;
  problem: string;
  cause: string;
  action: string;
  mechanic: string;
  supervisor: string;
  priority: WoPriority;
  startTime: string;
  finishTime?: string;
  downtimeHours: number;
  hmKmAtFailure: number;
  partsUsed: WoPartItem[];
  laborHours: number;
  totalCost: number;
  status: WoStatus;
  remarks: string;
}

export interface WoLog {
  id: string;
  woId: string;
  woNumber: string;
  timestamp: string;
  activity: string;
  user: string;
  notes?: string;
}

export interface ComponentItem {
  id: string;
  componentName: string;
  serialNumber: string;
  unitId: string;
  unitCode: string;
  installDate: string;
  installHmKm: number;
  removeDate?: string;
  removeHmKm?: number;
  actualLife: number;
  standardLife: number;
  remainingLife: number;
  lifeAchievementPercent: number;
  failureCause?: string;
  cost: number;
  vendor: string;
  partNumber: string;
  status: 'INSTALLED' | 'REMOVED' | 'SCRAPPED';
}

export type PartGroup =
  | 'ENGINE'
  | 'HYDRAULIC'
  | 'TRANSMISSION'
  | 'ELECTRICAL'
  | 'UNDERCARRIAGE'
  | 'FINAL DRIVE'
  | 'BRAKE'
  | 'STEERING'
  | 'COOLING SYSTEM'
  | 'FILTER'
  | 'LUBRICATION'
  | 'TYRE'
  | 'GET'
  | 'WEAR PART'
  | 'OTHER';

export interface PartMaster {
  id: string;
  partNumber: string;
  partName: string;
  group: PartGroup;
  component: string;
  brand: string;
  model: string;
  compatibleUnits: string[];
  currentStock: number;
  minStock: number;
  maxStock: number;
  monthlyConsumption: number;
  avgConsumption: number;
  leadTimeDays: number;
  safetyStock: number;
  openPoQty: number;
  unitCost: number;
  locationBin: string;
}

export interface PartTransaction {
  id: string;
  date: string;
  partNumber: string;
  partName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  qty: number;
  unitPrice: number;
  referenceDoc: string;
  unitCode?: string;
  notes?: string;
}

export interface RcaRecord {
  id: string;
  woNumber: string;
  unitCode: string;
  failure: string;
  symptom: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  fishboneMan: string;
  fishboneMachine: string;
  fishboneMethod: string;
  fishboneMaterial: string;
  fishboneEnvironment: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  pic: string;
  dueDate: string;
  status: 'OPEN' | 'IN PROGRESS' | 'IMPLEMENTED' | 'VERIFIED';
}

export type UserRole =
  | 'ADMIN'
  | 'PLANT MANAGER'
  | 'MAINTENANCE MANAGER'
  | 'PLANNER'
  | 'SUPERVISOR'
  | 'MECHANIC'
  | 'WAREHOUSE'
  | 'RELIABILITY'
  | 'VIEWER';

export interface GlobalFilterState {
  site: string;
  department: string;
  unitType: string;
  unitId: string;
  status: string;
  contractor: string;
  dateRange: 'ALL' | 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'THIS_YEAR';
  searchQuery: string;
}

export interface AlertItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'PM' | 'PDM' | 'BREAKDOWN' | 'STOCK' | 'FORECAST';
  title: string;
  message: string;
  timestamp: string;
  unitCode?: string;
  linkTab?: string;
}
