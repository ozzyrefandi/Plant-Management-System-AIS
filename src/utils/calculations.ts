import {
  UnitMaster,
  WorkOrder,
  PmSchedule,
  PdmRecord,
  ComponentItem,
  PartMaster
} from '../types';

export interface FleetKpiSummary {
  totalUnits: number;
  runningUnits: number;
  standbyUnits: number;
  breakdownUnits: number;
  pmUnits: number;
  pdmUnits: number;
  waitingPartUnits: number;
  waitingServiceUnits: number;
  physicalAvailability: number; // %
  mechanicalAvailability: number; // %
  utilization: number; // %
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time to Repair
  totalDowntimeHours: number;
  totalRepairCost: number;
  pmComplianceRate: number; // %
  pdmCriticalCount: number;
  pdmWarningCount: number;
  openWoCount: number;
  waitingPartWoCount: number;
}

export function calculateFleetKpis(
  units: UnitMaster[],
  workOrders: WorkOrder[],
  pmSchedules: PmSchedule[],
  pdmRecords: PdmRecord[]
): FleetKpiSummary {
  const totalUnits = units.length;
  const runningUnits = units.filter((u) => u.status === 'RUNNING').length;
  const standbyUnits = units.filter((u) => u.status === 'STANDBY').length;
  const breakdownUnits = units.filter((u) => u.status === 'BREAKDOWN').length;
  const pmUnits = units.filter((u) => u.status === 'PM').length;
  const pdmUnits = units.filter((u) => u.status === 'PDM').length;
  const waitingPartUnits = units.filter((u) => u.status === 'WAITING PART').length;
  const waitingServiceUnits = units.filter((u) => u.status === 'WAITING SERVICE').length;

  // Downtime and repair hours from Work Orders
  const totalDowntimeHours = workOrders.reduce((sum, wo) => sum + (wo.downtimeHours || 0), 0);
  const totalRepairCost = workOrders.reduce((sum, wo) => sum + (wo.totalCost || 0), 0);

  // Breakdown & maintenance events
  const breakdownWoCount = workOrders.filter((wo) => wo.type === 'Breakdown').length || 1;
  const repairEventCount = workOrders.filter((wo) => wo.downtimeHours > 0).length || 1;

  // Standard mining calendar hours baseline (e.g. 720 hours/month * fleet)
  const scheduledFleetHours = totalUnits * 720;
  const downtimeTotal = Math.min(totalDowntimeHours * 1.5, scheduledFleetHours * 0.4);
  const operatingHours = scheduledFleetHours * 0.72;
  const standbyHours = Math.max(0, scheduledFleetHours - operatingHours - downtimeTotal);
  const availableHours = operatingHours + standbyHours;

  const physicalAvailability = scheduledFleetHours > 0
    ? Math.min(100, Math.round((availableHours / scheduledFleetHours) * 1000) / 10)
    : 90.5;

  const mechanicalAvailability = operatingHours + downtimeTotal > 0
    ? Math.min(100, Math.round((operatingHours / (operatingHours + downtimeTotal)) * 1000) / 10)
    : 88.2;

  const utilization = availableHours > 0
    ? Math.min(100, Math.round((operatingHours / availableHours) * 1000) / 10)
    : 82.4;

  const mtbfHours = Math.round(operatingHours / Math.max(1, breakdownWoCount));
  const mttrHours = Math.round((totalDowntimeHours / Math.max(1, repairEventCount)) * 10) / 10;

  // PM Compliance calculation
  const totalPmScheduled = pmSchedules.length;
  const overduePm = pmSchedules.filter((p) => p.status === 'OVERDUE').length;
  const pmComplianceRate = totalPmScheduled > 0
    ? Math.round(((totalPmScheduled - overduePm) / totalPmScheduled) * 1000) / 10
    : 95.0;

  const pdmCriticalCount = pdmRecords.filter((p) => p.status === 'CRITICAL').length;
  const pdmWarningCount = pdmRecords.filter((p) => p.status === 'WARNING').length;

  const openWoCount = workOrders.filter((wo) => wo.status === 'OPEN' || wo.status === 'IN PROGRESS').length;
  const waitingPartWoCount = workOrders.filter((wo) => wo.status === 'WAITING PART').length;

  return {
    totalUnits,
    runningUnits,
    standbyUnits,
    breakdownUnits,
    pmUnits,
    pdmUnits,
    waitingPartUnits,
    waitingServiceUnits,
    physicalAvailability,
    mechanicalAvailability,
    utilization,
    mtbfHours,
    mttrHours,
    totalDowntimeHours,
    totalRepairCost,
    pmComplianceRate,
    pdmCriticalCount,
    pdmWarningCount,
    openWoCount,
    waitingPartWoCount
  };
}

export interface ParetoItem {
  label: string;
  value: number;
  cumulativeValue: number;
  percentage: number;
  cumulativePercentage: number;
}

export function calculatePareto(
  items: { key: string; value: number }[]
): ParetoItem[] {
  // Aggregate by key
  const aggregated: Record<string, number> = {};
  items.forEach((item) => {
    const k = item.key || 'Lainnya';
    aggregated[k] = (aggregated[k] || 0) + item.value;
  });

  const sorted = Object.entries(aggregated)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const totalValue = sorted.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) return [];

  let runningSum = 0;
  return sorted.map((item) => {
    runningSum += item.value;
    const percentage = Math.round((item.value / totalValue) * 1000) / 10;
    const cumulativePercentage = Math.round((runningSum / totalValue) * 1000) / 10;
    return {
      label: item.label,
      value: item.value,
      cumulativeValue: runningSum,
      percentage,
      cumulativePercentage: Math.min(100, cumulativePercentage)
    };
  });
}

export function calculatePartForecast(part: PartMaster) {
  const avg = part.avgConsumption || part.monthlyConsumption || 1;
  const f1m = Math.round(avg);
  const f3m = Math.round(avg * 3);
  const f6m = Math.round(avg * 6);
  const f12m = Math.round(avg * 12);

  // Recommended Order Qty = Forecast Demand (over lead time) + Safety Stock - Current Stock - Open PO
  // Lead time fraction of month: leadTimeDays / 30
  const leadTimeDemand = (part.leadTimeDays / 30) * avg;
  const grossRequirement = leadTimeDemand + part.safetyStock;
  const netOrder = Math.max(0, Math.ceil(grossRequirement - part.currentStock - part.openPoQty));

  let stockStatus: 'STOCK SAFE' | 'LOW STOCK' | 'CRITICAL' | 'OVERSTOCK' = 'STOCK SAFE';
  if (part.currentStock <= part.minStock * 0.5) {
    stockStatus = 'CRITICAL';
  } else if (part.currentStock <= part.minStock) {
    stockStatus = 'LOW STOCK';
  } else if (part.currentStock >= part.maxStock) {
    stockStatus = 'OVERSTOCK';
  }

  return {
    forecast1Month: f1m,
    forecast3Months: f3m,
    forecast6Months: f6m,
    forecast12Months: f12m,
    grossRequirement: Math.round(grossRequirement),
    recommendedOrderQty: netOrder,
    stockStatus
  };
}

export function calculateComponentPrediction(comp: ComponentItem, dailyAvgHmKm: number = 20) {
  const remaining = Math.max(0, comp.remainingLife);
  const daysToReplace = dailyAvgHmKm > 0 ? Math.round(remaining / dailyAvgHmKm) : 999;
  
  let indicator: 'SAFE' | 'WATCH' | 'PLAN' | 'URGENT' = 'SAFE';
  if (daysToReplace <= 14 || remaining <= 200) {
    indicator = 'URGENT';
  } else if (daysToReplace <= 35) {
    indicator = 'PLAN';
  } else if (daysToReplace <= 70) {
    indicator = 'WATCH';
  }

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + daysToReplace);
  const estimatedDateString = estDate.toISOString().split('T')[0];

  return {
    daysToReplace,
    estimatedDateString,
    indicator
  };
}

export interface SmartRecommendation {
  id: string;
  category: 'PM' | 'COMPONENT' | 'PART' | 'RELIABILITY';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  actionText: string;
  targetTab: string;
}

export function generateSmartRecommendations(
  units: UnitMaster[],
  pmSchedules: PmSchedule[],
  components: ComponentItem[],
  parts: PartMaster[],
  workOrders: WorkOrder[]
): SmartRecommendation[] {
  const recs: SmartRecommendation[] = [];

  // 1. PM Overdue / Due Soon
  const overduePm = pmSchedules.find((p) => p.status === 'OVERDUE');
  if (overduePm) {
    recs.push({
      id: 'rec-pm-overdue',
      category: 'PM',
      urgency: 'HIGH',
      title: `Overdue Maintenance: ${overduePm.unitCode}`,
      description: `Unit ${overduePm.unitCode} telah melebihi batas service (${overduePm.pmType}) sebesar ${Math.abs(overduePm.remaining)} ${overduePm.unitCode.startsWith('LV') || overduePm.unitCode.startsWith('DT') ? 'KM' : 'HM'}. Segera jadwalkan ke workshop.`,
      actionText: 'Buka Jadwal PM',
      targetTab: 'pm'
    });
  }

  // 2. Component remaining life
  const urgentComp = components.find((c) => c.status === 'INSTALLED' && c.remainingLife < 500);
  if (urgentComp) {
    recs.push({
      id: `rec-comp-${urgentComp.id}`,
      category: 'COMPONENT',
      urgency: 'HIGH',
      title: `Prediksi Komponen Kritis: ${urgentComp.componentName} (${urgentComp.unitCode})`,
      description: `${urgentComp.componentName} pada unit ${urgentComp.unitCode} tersisa sisa umur ${urgentComp.remainingLife.toLocaleString('id-ID')} unit pengukuran. Persiapkan replacement unit dan jadwal instalasi.`,
      actionText: 'Lihat Analisis Komponen',
      targetTab: 'component'
    });
  }

  // 3. Low stock part
  const lowPart = parts.find((p) => p.currentStock <= p.minStock);
  if (lowPart) {
    const forecast = calculatePartForecast(lowPart);
    recs.push({
      id: `rec-part-${lowPart.id}`,
      category: 'PART',
      urgency: lowPart.currentStock === 0 ? 'HIGH' : 'MEDIUM',
      title: `Stok Rendah: ${lowPart.partName}`,
      description: `Part No. ${lowPart.partNumber} saat ini ${lowPart.currentStock} pcs (Min: ${lowPart.minStock} pcs). Rekomendasi order PO: ${forecast.recommendedOrderQty} pcs (Lead time ${lowPart.leadTimeDays} hari).`,
      actionText: 'Buat Forecast PO',
      targetTab: 'part-forecast'
    });
  }

  // 4. Breakdown failure RCA
  const breakdownWo = workOrders.find((w) => w.type === 'Breakdown' && (w.status === 'OPEN' || w.status === 'IN PROGRESS'));
  if (breakdownWo) {
    recs.push({
      id: `rec-wo-breakdown-${breakdownWo.id}`,
      category: 'RELIABILITY',
      urgency: 'HIGH',
      title: `Unit Breakdown Sedang Berlangsung: ${breakdownWo.unitCode}`,
      description: `Kerusakan ${breakdownWo.failure} pada ${breakdownWo.unitCode} telah menyebabkan downtime ${breakdownWo.downtimeHours} jam. Lakukan Root Cause Analysis (5-Why).`,
      actionText: 'Buka Form RCA',
      targetTab: 'rca'
    });
  }

  return recs;
}
