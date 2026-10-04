import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Package,
  Layers
} from 'lucide-react';
import { PartMaster, PartGroup, PartTransaction } from '../../types';
import { formatRupiah, exportToCsv } from '../../utils/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface InventoryViewProps {
  parts: PartMaster[];
  transactions: PartTransaction[];
  onAddPart: (part: Omit<PartMaster, 'id'>) => void;
  onUpdatePart: (id: string, part: Partial<PartMaster>) => void;
  onDeletePart: (id: string) => void;
  onAddTransaction: (tx: Omit<PartTransaction, 'id'>) => void;
}

const PART_GROUPS: PartGroup[] = [
  'ENGINE',
  'HYDRAULIC',
  'TRANSMISSION',
  'ELECTRICAL',
  'UNDERCARRIAGE',
  'FINAL DRIVE',
  'BRAKE',
  'STEERING',
  'COOLING SYSTEM',
  'FILTER',
  'LUBRICATION',
  'TYRE',
  'GET',
  'WEAR PART',
  'OTHER'
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  parts,
  transactions,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  onAddTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'transactions'>('parts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartMaster | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [partFormData, setPartFormData] = useState({
    partNumber: '',
    partName: '',
    group: 'FILTER' as PartGroup,
    component: 'Engine',
    brand: 'Komatsu Genuine',
    model: 'Universal',
    compatibleUnits: ['EX-201', 'DZ-101'],
    currentStock: 10,
    minStock: 5,
    maxStock: 30,
    monthlyConsumption: 10,
    avgConsumption: 10,
    leadTimeDays: 14,
    safetyStock: 6,
    openPoQty: 0,
    unitCost: 1200000,
    locationBin: 'RACK-A01-01'
  });

  const [txFormData, setTxFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partNumber: parts[0]?.partNumber || '',
    partName: parts[0]?.partName || '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    qty: 5,
    unitPrice: parts[0]?.unitCost || 1000000,
    referenceDoc: 'PO-2026-102',
    unitCode: 'EX-201',
    notes: 'Penerimaan barang dari supplier'
  });

  const handleOpenAddPart = () => {
    setEditingPart(null);
    setPartFormData({
      partNumber: `PT-${Date.now().toString().slice(-5)}`,
      partName: 'Fuel Filter Element',
      group: 'FILTER',
      component: 'Fuel System',
      brand: 'Komatsu Genuine',
      model: 'PC2000',
      compatibleUnits: ['EX-201'],
      currentStock: 12,
      minStock: 6,
      maxStock: 40,
      monthlyConsumption: 8,
      avgConsumption: 8,
      leadTimeDays: 14,
      safetyStock: 5,
      openPoQty: 0,
      unitCost: 850000,
      locationBin: 'RACK-A02-04'
    });
    setIsPartModalOpen(true);
  };

  const handleOpenEditPart = (p: PartMaster) => {
    setEditingPart(p);
    setPartFormData({
      partNumber: p.partNumber,
      partName: p.partName,
      group: p.group,
      component: p.component,
      brand: p.brand,
      model: p.model,
      compatibleUnits: p.compatibleUnits,
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      monthlyConsumption: p.monthlyConsumption,
      avgConsumption: p.avgConsumption,
      leadTimeDays: p.leadTimeDays,
      safetyStock: p.safetyStock,
      openPoQty: p.openPoQty,
      unitCost: p.unitCost,
      locationBin: p.locationBin
    });
    setIsPartModalOpen(true);
  };

  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPart) {
      onUpdatePart(editingPart.id, partFormData);
    } else {
      onAddPart(partFormData);
    }
    setIsPartModalOpen(false);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(txFormData);

    // Update stock quantity on part master
    const matchedPart = parts.find((p) => p.partNumber === txFormData.partNumber);
    if (matchedPart) {
      let newStock = matchedPart.currentStock;
      if (txFormData.type === 'IN') newStock += txFormData.qty;
      else if (txFormData.type === 'OUT') newStock = Math.max(0, newStock - txFormData.qty);
      else if (txFormData.type === 'ADJUSTMENT') newStock = txFormData.qty;

      onUpdatePart(matchedPart.id, { currentStock: newStock });
    }

    setIsTxModalOpen(false);
  };

  const filteredParts = parts.filter((p) => {
    const matchSearch =
      p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.locationBin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup ? p.group === selectedGroup : true;
    return matchSearch && matchGroup;
  });

  const totalInventoryValuation = parts.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0);

  const handleExportCsv = () => {
    if (activeTab === 'parts') {
      const exportRows = filteredParts.map((p) => ({
        PartNumber: p.partNumber,
        PartName: p.partName,
        Group: p.group,
        Komponen: p.component,
        Brand: p.brand,
        Model: p.model,
        StockSaatIni: p.currentStock,
        MinStock: p.minStock,
        MaxStock: p.maxStock,
        HargaSatuan: p.unitCost,
        TotalNilai: p.currentStock * p.unitCost,
        LokasiBin: p.locationBin
      }));
      exportToCsv('Master_Spare_Parts_Gudang', exportRows);
    } else {
      const exportRows = transactions.map((t) => ({
        Tanggal: t.date,
        PartNumber: t.partNumber,
        PartName: t.partName,
        Tipe: t.type,
        Qty: t.qty,
        Harga: t.unitPrice,
        Total: t.qty * t.unitPrice,
        NoDokumen: t.referenceDoc,
        Unit: t.unitCode || '',
        Catatan: t.notes || ''
      }));
      exportToCsv('Histori_Transaksi_Suku_Cadang', exportRows);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            Inventory & Part Master Management (Gudang Tambang)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Valuasi Suku Cadang: <strong className="text-emerald-400 font-mono-nums">{formatRupiah(totalInventoryValuation)}</strong>
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
            onClick={() => setIsTxModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Transaksi In/Out</span>
          </button>
          <button
            onClick={handleOpenAddPart}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-950 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Part Master</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Master vs Transaksi */}
      <div className="flex items-center gap-1 bg-[#0a0f1d] border border-slate-800 p-1 rounded-lg w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('parts')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'parts' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Master Katalog Part ({parts.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Histori Transaksi Mutasi ({transactions.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      {activeTab === 'parts' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-3 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari part number, nama part, bin lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Semua Kelompok</option>
              {PART_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono-nums">
            {filteredParts.length} SKUs Terfilter
          </div>
        </div>
      )}

      {/* Content View: Parts Table */}
      {activeTab === 'parts' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Part Number</th>
                  <th className="py-3 px-3">Deskripsi Part</th>
                  <th className="py-3 px-3">Group & Komponen</th>
                  <th className="py-3 px-3">Brand & Model</th>
                  <th className="py-3 px-3 text-right">Stok Fisik</th>
                  <th className="py-3 px-3 text-right">Min / Max</th>
                  <th className="py-3 px-3 text-right">Harga Satuan</th>
                  <th className="py-3 px-3 text-right">Total Nilai</th>
                  <th className="py-3 px-3">Bin Lokasi</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Tidak ada part yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((part) => {
                    const isLow = part.currentStock <= part.minStock;
                    const isZero = part.currentStock === 0;

                    return (
                      <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-amber-400 font-mono-nums">
                          {part.partNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white max-w-[220px] truncate">
                          {part.partName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <div>{part.group}</div>
                          <div className="text-[10px] text-slate-400">{part.component}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {part.brand} · {part.model}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums ${
                          isZero ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {part.currentStock} pcs
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400 font-mono-nums tabular-nums">
                          {part.minStock} / {part.maxStock}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-slate-300">
                          {formatRupiah(part.unitCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums text-emerald-400">
                          {formatRupiah(part.currentStock * part.unitCost)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono-nums">
                          {part.locationBin}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditPart(part)}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 cursor-pointer"
                              title="Edit Part"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(part.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                              title="Hapus Part"
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
        </div>
      )}

      {/* Content View: Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Part Number & Name</th>
                  <th className="py-3 px-3">Jenis Mutasi</th>
                  <th className="py-3 px-3 text-right">Jumlah (Qty)</th>
                  <th className="py-3 px-3 text-right">Harga Satuan</th>
                  <th className="py-3 px-3 text-right">Total Transaksi</th>
                  <th className="py-3 px-3">No Dokumen / Ref</th>
                  <th className="py-3 px-3">Alokasi Unit</th>
                  <th className="py-3 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono-nums text-slate-400">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-amber-400 font-mono-nums">{tx.partNumber}</div>
                      <div className="text-slate-300 truncate max-w-[200px]">{tx.partName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'IN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : tx.type === 'OUT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums text-white">
                      {tx.type === 'IN' ? `+${tx.qty}` : tx.type === 'OUT' ? `-${tx.qty}` : tx.qty} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums tabular-nums text-slate-300">
                      {formatRupiah(tx.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono-nums tabular-nums text-emerald-400">
                      {formatRupiah(tx.qty * tx.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono-nums">
                      {tx.referenceDoc}
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-mono-nums font-bold">
                      {tx.unitCode || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[180px]">
                      {tx.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Part */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title={editingPart ? 'Edit Data Part Master' : 'Tambah Suku Cadang Baru'}
        subtitle="Registrasikan spesifikasi teknis, batas stok min/max, dan lokasi rak gudang."
        maxWidth="2xl"
      >
        <form onSubmit={handlePartSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Part Number *</label>
              <input
                required
                type="text"
                value={partFormData.partNumber}
                onChange={(e) => setPartFormData({ ...partFormData, partNumber: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Part *</label>
              <input
                required
                type="text"
                value={partFormData.partName}
                onChange={(e) => setPartFormData({ ...partFormData, partName: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kelompok (Group) *</label>
              <select
                value={partFormData.group}
                onChange={(e) => setPartFormData({ ...partFormData, group: e.target.value as PartGroup })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {PART_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Komponen Mesin</label>
              <input
                type="text"
                value={partFormData.component}
                onChange={(e) => setPartFormData({ ...partFormData, component: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stok Fisik Saat Ini *</label>
              <input
                required
                type="number"
                value={partFormData.currentStock}
                onChange={(e) => setPartFormData({ ...partFormData, currentStock: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Satuan (Rp) *</label>
              <input
                required
                type="number"
                value={partFormData.unitCost}
                onChange={(e) => setPartFormData({ ...partFormData, unitCost: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-emerald-400 font-bold font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batas Minimum (Min Stock)</label>
              <input
                type="number"
                value={partFormData.minStock}
                onChange={(e) => setPartFormData({ ...partFormData, minStock: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batas Maksimum (Max Stock)</label>
              <input
                type="number"
                value={partFormData.maxStock}
                onChange={(e) => setPartFormData({ ...partFormData, maxStock: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lead Time Suplai (Hari)</label>
              <input
                type="number"
                value={partFormData.leadTimeDays}
                onChange={(e) => setPartFormData({ ...partFormData, leadTimeDays: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lokasi Rak / Bin</label>
              <input
                type="text"
                placeholder="RACK-A01-02, PALLET-03"
                value={partFormData.locationBin}
                onChange={(e) => setPartFormData({ ...partFormData, locationBin: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPartModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              {editingPart ? 'Simpan Perubahan' : 'Daftarkan Part'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Transaction Mutasi In / Out */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Catat Mutasi Suku Cadang (In / Out)"
        subtitle="Mencatat penerimaan PO atau pemakaian part untuk perbaikan unit."
        maxWidth="lg"
      >
        <form onSubmit={handleTxSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal *</label>
              <input
                required
                type="date"
                value={txFormData.date}
                onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jenis Mutasi *</label>
              <select
                value={txFormData.type}
                onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value as any })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="IN">IN (Penerimaan Barang / PO)</option>
                <option value="OUT">OUT (Pengeluaran Perbaikan WO)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Stock Opname)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Pilih Part *</label>
              <select
                required
                value={txFormData.partNumber}
                onChange={(e) => {
                  const p = parts.find((x) => x.partNumber === e.target.value);
                  setTxFormData({
                    ...txFormData,
                    partNumber: e.target.value,
                    partName: p?.partName || '',
                    unitPrice: p?.unitCost || 0
                  });
                }}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {parts.map((p) => (
                  <option key={p.id} value={p.partNumber}>
                    {p.partNumber} - {p.partName} (Stok: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jumlah (Qty) *</label>
              <input
                required
                type="number"
                min="1"
                value={txFormData.qty}
                onChange={(e) => setTxFormData({ ...txFormData, qty: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                value={txFormData.unitPrice}
                onChange={(e) => setTxFormData({ ...txFormData, unitPrice: Number(e.target.value) })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white font-mono-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">No Referensi / WO / PO *</label>
              <input
                required
                type="text"
                placeholder="WO-2026-1001 atau PO-089"
                value={txFormData.referenceDoc}
                onChange={(e) => setTxFormData({ ...txFormData, referenceDoc: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit Pengguna (Bila OUT)</label>
              <input
                type="text"
                placeholder="EX-201, DT-701"
                value={txFormData.unitCode}
                onChange={(e) => setTxFormData({ ...txFormData, unitCode: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={txFormData.notes}
              onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTxModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              Simpan Mutasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeletePart(deleteId);
        }}
        title="Hapus Suku Cadang"
        message="Yakin ingin menghapus item part master ini dari katalog gudang?"
      />
    </div>
  );
};
