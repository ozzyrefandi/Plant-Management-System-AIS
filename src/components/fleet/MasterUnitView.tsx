import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  Truck,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  User,
  Wrench
} from 'lucide-react';
import {
  UnitMaster,
  UnitType,
  UnitStatus,
  CriticalityLevel,
  MeasurementParam
} from '../../types';
import { formatHmKm, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface MasterUnitViewProps {
  units: UnitMaster[];
  onAddUnit: (unit: Omit<UnitMaster, 'id'>) => void;
  onUpdateUnit: (id: string, unit: Partial<UnitMaster>) => void;
  onDeleteUnit: (id: string) => void;
}

const UNIT_TYPES: UnitType[] = [
  'Excavator',
  'Dozer',
  'Wheel Loader',
  'Motor Grader',
  'Dump Truck',
  'Articulated Dump Truck',
  'Water Truck',
  'Fuel Truck',
  'Service Truck',
  'Light Vehicle',
  'Support Equipment',
  'Other'
];

const UNIT_STATUSES: UnitStatus[] = [
  'RUNNING',
  'STANDBY',
  'BREAKDOWN',
  'PM',
  'PDM',
  'WAITING PART',
  'WAITING SERVICE',
  'DISPOSED'
];

export const MasterUnitView: React.FC<MasterUnitViewProps> = ({
  units,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortField, setSortField] = useState<keyof UnitMaster>('unitCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitMaster | null>(null);
  const [viewingUnit, setViewingUnit] = useState<UnitMaster | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    unitCode: '',
    equipNumber: '',
    type: 'Excavator' as UnitType,
    brand: 'Komatsu',
    model: '',
    serialNumber: '',
    engineSerialNumber: '',
    year: new Date().getFullYear(),
    department: 'Produksi',
    contractor: 'PT Pamapersada Nusantara',
    site: 'Site Sangatta',
    status: 'RUNNING' as UnitStatus,
    hmCurrent: 1000,
    kmCurrent: 0,
    commissionDate: new Date().toISOString().split('T')[0],
    location: 'Pit Barat',
    operator: '',
    mechanic: '',
    criticality: 'HIGH' as CriticalityLevel,
    targetAvailability: 90,
    targetUtilization: 85,
    lastServiceHmKm: 800,
    nextServiceHmKm: 1050,
    notes: ''
  });

  // Auto determine param type from Unit Type
  const getParamType = (type: UnitType): MeasurementParam => {
    if (
      type === 'Dump Truck' ||
      type === 'Articulated Dump Truck' ||
      type === 'Water Truck' ||
      type === 'Fuel Truck' ||
      type === 'Service Truck' ||
      type === 'Light Vehicle'
    ) {
      return 'KM';
    }
    return 'HM';
  };

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setFormData({
      unitCode: '',
      equipNumber: `EQ-${Date.now().toString().slice(-4)}`,
      type: 'Excavator',
      brand: 'Komatsu',
      model: 'PC2000-8',
      serialNumber: '',
      engineSerialNumber: '',
      year: 2023,
      department: 'Produksi',
      contractor: 'PT Pamapersada Nusantara',
      site: 'Site Sangatta',
      status: 'RUNNING',
      hmCurrent: 5000,
      kmCurrent: 0,
      commissionDate: new Date().toISOString().split('T')[0],
      location: 'Pit Barat',
      operator: '',
      mechanic: '',
      criticality: 'HIGH',
      targetAvailability: 90,
      targetUtilization: 85,
      lastServiceHmKm: 4750,
      nextServiceHmKm: 5000,
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (unit: UnitMaster) => {
    setEditingUnit(unit);
    setFormData({
      unitCode: unit.unitCode,
      equipNumber: unit.equipNumber,
      type: unit.type,
      brand: unit.brand,
      model: unit.model,
      serialNumber: unit.serialNumber,
      engineSerialNumber: unit.engineSerialNumber,
      year: unit.year,
      department: unit.department,
      contractor: unit.contractor,
      site: unit.site,
      status: unit.status,
      hmCurrent: unit.hmCurrent,
      kmCurrent: unit.kmCurrent,
      commissionDate: unit.commissionDate,
      location: unit.location,
      operator: unit.operator,
      mechanic: unit.mechanic,
      criticality: unit.criticality,
      targetAvailability: unit.targetAvailability,
      targetUtilization: unit.targetUtilization,
      lastServiceHmKm: unit.lastServiceHmKm,
      nextServiceHmKm: unit.nextServiceHmKm,
      notes: unit.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const param = getParamType(formData.type);

    if (editingUnit) {
      onUpdateUnit(editingUnit.id, {
        ...formData,
        paramType: param
      });
    } else {
      onAddUnit({
        ...formData,
        paramType: param,
        healthScore: 90
      });
    }
    setIsFormOpen(false);
  };

  // Filter & Search
  const filteredUnits = units.filter((u) => {
    const matchSearch =
      u.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.equipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.operator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = selectedType ? u.type === selectedType : true;
    const matchStatus = selectedStatus ? u.status === selectedStatus : true;

    return matchSearch && matchType && matchStatus;
  });

  // Sorting
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUnits.length / pageSize) || 1;
  const paginatedUnits = sortedUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    const exportRows = filteredUnits.map((u) => ({
      UnitCode: u.unitCode,
      EquipmentNo: u.equipNumber,
      Type: u.type,
      Brand: u.brand,
      Model: u.model,
      Status: u.status,
      Param: u.paramType,
      CurrentMeter: u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent,
      LastService: u.lastServiceHmKm,
      NextService: u.nextServiceHmKm,
      Remaining: u.nextServiceHmKm - (u.paramType === 'KM' ? u.kmCurrent : u.hmCurrent),
      Department: u.department,
      Site: u.site,
      Contractor: u.contractor,
      Location: u.location,
      Operator: u.operator,
      Criticality: u.criticality,
      HealthScore: u.healthScore
    }));
    exportToCsv('Master_Unit_Mining_Fleet', exportRows);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            Master Unit Alat Berat & Kendaraan Tambang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {units.length} unit armada terdaftar (Excavator, Dozer, Dump Truck, Support Equipment)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-950 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode unit, model, lokasi, operator..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Unit Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Kategori Unit</option>
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">Semua Status Operasi</option>
            {UNIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-nums">
          Menampilkan {paginatedUnits.length} dari {filteredUnits.length} unit
        </div>
      </div>

      {/* Main Units Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Unit Code</th>
                <th className="py-3 px-3">Tipe & Model</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Current HM/KM</th>
                <th className="py-3 px-3 text-right">Next Service</th>
                <th className="py-3 px-3 text-right">Remaining</th>
                <th className="py-3 px-3">Service Status</th>
                <th className="py-3 px-3">Lokasi / Site</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3 text-center">Health</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedUnits.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data unit yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedUnits.map((unit) => {
                  const param = unit.paramType;
                  const currentVal = param === 'KM' ? unit.kmCurrent : unit.hmCurrent;
                  const remaining = unit.nextServiceHmKm - currentVal;
                  
                  let serviceStatus: 'SAFE' | 'DUE SOON' | 'OVERDUE' = 'SAFE';
                  if (remaining <= 0) serviceStatus = 'OVERDUE';
                  else if (param === 'HM' ? remaining <= 50 : remaining <= 1000) serviceStatus = 'DUE SOON';

                  let statusColor = 'bg-slate-800 text-slate-300';
                  if (unit.status === 'RUNNING') statusColor = 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
                  else if (unit.status === 'BREAKDOWN') statusColor = 'bg-rose-950/60 text-rose-400 border border-rose-800/60';
                  else if (unit.status === 'PM' || unit.status === 'PDM') statusColor = 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
                  else if (unit.status === 'WAITING PART') statusColor = 'bg-purple-950/60 text-purple-400 border border-purple-800/60';
                  else if (unit.status === 'STANDBY') statusColor = 'bg-blue-950/60 text-blue-400 border border-blue-800/60';

                  return (
                    <tr
                      key={unit.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setViewingUnit(unit)}
                    >
                      {/* Unit Code */}
                      <td className="py-2.5 px-3 font-bold text-white font-mono-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>{unit.unitCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {unit.equipNumber}
                        </span>
                      </td>

                      {/* Type & Model */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{unit.brand} {unit.model}</div>
                        <div className="text-[10px] text-slate-400">{unit.type} · Th {unit.year}</div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {unit.status}
                        </span>
                      </td>

                      {/* Current HM/KM */}
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400 font-mono-nums tabular-nums">
                        {formatHmKm(currentVal, param)}
                      </td>

                      {/* Next Service */}
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono-nums tabular-nums">
                        {formatHmKm(unit.nextServiceHmKm, param)}
                      </td>

                      {/* Remaining */}
                      <td className={`py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums ${
                        remaining < 0 ? 'text-rose-400' : remaining < (param === 'HM' ? 50 : 1000) ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {remaining < 0 ? `-${Math.abs(remaining).toLocaleString('id-ID')}` : remaining.toLocaleString('id-ID')} {param}
                      </td>

                      {/* Service Status */}
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          serviceStatus === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : serviceStatus === 'DUE SOON'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {serviceStatus}
                        </span>
                      </td>

                      {/* Location / Site */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-200 truncate max-w-[130px]">{unit.location}</div>
                        <div className="text-[10px] text-slate-400">{unit.site}</div>
                      </td>

                      {/* Operator */}
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[110px]">
                        {unit.operator || '-'}
                      </td>

                      {/* Health Score */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono-nums font-bold text-xs ${
                          unit.healthScore >= 90
                            ? 'text-emerald-400'
                            : unit.healthScore >= 75
                            ? 'text-blue-400'
                            : unit.healthScore >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {unit.healthScore}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingUnit(unit)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(unit)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(unit.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Unit Detail Modal */}
      {viewingUnit && (
        <Modal
          isOpen={!!viewingUnit}
          onClose={() => setViewingUnit(null)}
          title={`Detail Unit: ${viewingUnit.unitCode} (${viewingUnit.brand} ${viewingUnit.model})`}
          subtitle={`No Peralatan: ${viewingUnit.equipNumber} · Site: ${viewingUnit.site}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Stat Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0f1d] p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Parameter</span>
                <div className="text-base font-bold text-amber-400 font-mono-nums">
                  {viewingUnit.paramType} (Otomatis)
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Current Meter</span>
                <div className="text-base font-bold text-white font-mono-nums">
                  {formatHmKm(
                    viewingUnit.paramType === 'KM' ? viewingUnit.kmCurrent : viewingUnit.hmCurrent,
                    viewingUnit.paramType
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Next Service Target</span>
                <div className="text-base font-bold text-slate-200 font-mono-nums">
                  {formatHmKm(viewingUnit.nextServiceHmKm, viewingUnit.paramType)}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Health Score</span>
                <div className="text-base font-bold text-emerald-400 font-mono-nums">
                  {viewingUnit.healthScore} / 100
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                  Spesifikasi & Identitas Mesin
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Kategori:</span> {viewingUnit.type}
                  </div>
                  <div>
                    <span className="text-slate-400">Tahun:</span> {viewingUnit.year}
                  </div>
                  <div>
                    <span className="text-slate-400">Serial Unit:</span> {viewingUnit.serialNumber || '-'}
                  </div>
                  <div>
                    <span className="text-slate-400">Serial Engine:</span> {viewingUnit.engineSerialNumber || '-'}
                  </div>
                  <div>
                    <span className="text-slate-400">Commission Date:</span> {viewingUnit.commissionDate}
                  </div>
                  <div>
                    <span className="text-slate-400">Kritikalitas:</span> {viewingUnit.criticality}
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-1">
                  Operasional & Penanggung Jawab
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Departemen:</span> {viewingUnit.department}
                  </div>
                  <div>
                    <span className="text-slate-400">Kontraktor:</span> {viewingUnit.contractor}
                  </div>
                  <div>
                    <span className="text-slate-400">Lokasi Pit:</span> {viewingUnit.location}
                  </div>
                  <div>
                    <span className="text-slate-400">Status Operasi:</span> {viewingUnit.status}
                  </div>
                  <div>
                    <span className="text-slate-400">Operator Utama:</span> {viewingUnit.operator || '-'}
                  </div>
                  <div>
                    <span className="text-slate-400">Mekanik PIC:</span> {viewingUnit.mechanic || '-'}
                  </div>
                </div>
              </div>
            </div>

            {viewingUnit.notes && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                <span className="font-bold text-amber-400">Catatan Maintenance: </span>
                {viewingUnit.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingUnit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Unit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUnit ? `Edit Unit ${editingUnit.unitCode}` : 'Pendaftaran Unit Alat Berat Baru'}
        subtitle="Pastikan serial number dan parameter jam kerja / kilometer sesuai fisik unit."
        maxWidth="3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kode Unit *</label>
              <input
                required
                type="text"
                placeholder="misal: EX-204, DT-705"
                value={formData.unitCode}
                onChange={(e) => setFormData({ ...formData, unitCode: e.target.value.toUpperCase() })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Equipment Number *</label>
              <input
                required
                type="text"
                value={formData.equipNumber}
                onChange={(e) => setFormData({ ...formData, equipNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori Tipe *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as UnitType })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {UNIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Brand / Pabrikan *</label>
              <input
                required
                type="text"
                placeholder="Komatsu, CAT, Hitachi, Scania"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Model *</label>
              <input
                required
                type="text"
                placeholder="PC2000-8, HD785-7, D375A"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tahun Pembuatan</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Serial Number Frame</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Serial Number Engine</label>
              <input
                type="text"
                value={formData.engineSerialNumber}
                onChange={(e) => setFormData({ ...formData, engineSerialNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status Awal</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {UNIT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* HM/KM parameters */}
          <div className="bg-[#0a0f1d] p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Parameter Otomatis: {getParamType(formData.type)}
              </span>
              <span className="text-[10px] text-slate-400">
                Sistem otomatis memilih HM untuk Alat Berat & KM untuk Truk/Kendaraan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current {getParamType(formData.type)}
                </label>
                <input
                  required
                  type="number"
                  value={getParamType(formData.type) === 'KM' ? formData.kmCurrent : formData.hmCurrent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (getParamType(formData.type) === 'KM') {
                      setFormData({ ...formData, kmCurrent: val });
                    } else {
                      setFormData({ ...formData, hmCurrent: val });
                    }
                  }}
                  className="w-full bg-[#111827] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Last Service {getParamType(formData.type)}
                </label>
                <input
                  type="number"
                  value={formData.lastServiceHmKm}
                  onChange={(e) => setFormData({ ...formData, lastServiceHmKm: Number(e.target.value) })}
                  className="w-full bg-[#111827] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Next Service Target {getParamType(formData.type)}
                </label>
                <input
                  type="number"
                  value={formData.nextServiceHmKm}
                  onChange={(e) => setFormData({ ...formData, nextServiceHmKm: Number(e.target.value) })}
                  className="w-full bg-[#111827] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Operational info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Departemen</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Site Tambang</label>
              <input
                type="text"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lokasi Kerja Pit</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kontraktor / Pemilik</label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operator Utama</label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mekanik PIC</label>
              <input
                type="text"
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              {editingUnit ? 'Simpan Perubahan' : 'Daftarkan Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteUnit(deleteId);
        }}
        title="Konfirmasi Hapus Unit"
        message="Apakah Anda yakin ingin menghapus data unit ini dari database? Seluruh log dan histori yang terkait tidak dapat dipulihkan."
      />
    </div>
  );
};
