import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  FileText,
  Database
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { exportToCsv } from '../../utils/storage';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportUnits: (newUnits: any[]) => void;
  onImportLogs: (newLogs: any[]) => void;
  onImportWos: (newWos: any[]) => void;
  onImportParts: (newParts: any[]) => void;
  allData: any;
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportUnits,
  onImportLogs,
  onImportWos,
  onImportParts,
  allData
}) => {
  const [selectedTarget, setSelectedTarget] = useState<'unit' | 'log' | 'wo' | 'part'>('unit');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const handleDownloadTemplate = () => {
    if (selectedTarget === 'unit') {
      const template = [
        {
          unitCode: 'EX-205',
          equipNumber: 'EQ-EX-005',
          type: 'Excavator',
          brand: 'Komatsu',
          model: 'PC2000-8',
          serialNumber: 'KMT-99881',
          engineSerialNumber: 'ENG-8812',
          year: 2023,
          department: 'Produksi',
          contractor: 'PT Pamapersada Nusantara',
          site: 'Site Sangatta',
          status: 'RUNNING',
          hmCurrent: 3200,
          kmCurrent: 0,
          location: 'Pit Barat',
          operator: 'Bambang',
          mechanic: 'Joko',
          criticality: 'HIGH',
          targetAvailability: 90,
          targetUtilization: 85,
          lastServiceHmKm: 3000,
          nextServiceHmKm: 3250
        }
      ];
      exportToCsv('Template_Unit_Master', template);
    } else if (selectedTarget === 'log') {
      const template = [
        {
          date: '2026-10-04',
          unitCode: 'EX-201',
          openingHmKm: 14850,
          closingHmKm: 14872,
          dailyUsage: 22,
          operator: 'Bambang',
          location: 'Pit Barat',
          shift: 'Shift 1 (Day)',
          remarks: 'Operasi normal'
        }
      ];
      exportToCsv('Template_Daily_HM_KM_Log', template);
    } else if (selectedTarget === 'wo') {
      const template = [
        {
          woNumber: 'WO-2026-1050',
          date: '2026-10-04',
          unitCode: 'DT-701',
          type: 'Corrective Maintenance',
          component: 'Hydraulic System',
          failure: 'Leakage',
          problem: 'Oli menetes di hose fitting',
          cause: 'O-ring gepeng',
          action: 'Ganti o-ring baru',
          mechanic: 'Agus Salim',
          supervisor: 'Irwan Setiawan',
          priority: 'MEDIUM',
          startTime: '2026-10-04 09:00',
          downtimeHours: 2.0,
          hmKmAtFailure: 168400,
          totalCost: 1500000,
          status: 'OPEN',
          remarks: 'Siapkan part o-ring'
        }
      ];
      exportToCsv('Template_Work_Order', template);
    } else {
      const template = [
        {
          partNumber: '6754-71-6130',
          partName: 'Fuel Filter Element',
          group: 'FILTER',
          component: 'Fuel System',
          brand: 'Komatsu Genuine',
          model: 'Universal',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          monthlyConsumption: 12,
          avgConsumption: 12,
          leadTimeDays: 14,
          safetyStock: 8,
          openPoQty: 0,
          unitCost: 850000,
          locationBin: 'RACK-A01-01'
        }
      ];
      exportToCsv('Template_Part_Master', template);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setImportStatus('Error: File CSV kosong atau hanya memiliki header.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
        const dataRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cells.length === headers.length) {
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              const val = cells[idx];
              // Convert numeric strings
              rowObj[h] = !isNaN(Number(val)) && val !== '' ? Number(val) : val;
            });
            dataRows.push(rowObj);
          }
        }

        setParsedRows(dataRows);
        setImportStatus(`Berhasil membaca ${dataRows.length} baris data dari ${file.name}. Siap diimpor.`);
      } catch (err) {
        setImportStatus('Error membaca file: pastikan format CSV valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    if (selectedTarget === 'unit') {
      const formatted = parsedRows.map((r, i) => ({
        ...r,
        id: `imp-u-${Date.now()}-${i}`,
        healthScore: r.healthScore || 90,
        paramType: r.paramType || (r.type?.includes('Truck') || r.type?.includes('Vehicle') ? 'KM' : 'HM')
      }));
      onImportUnits(formatted);
    } else if (selectedTarget === 'log') {
      const formatted = parsedRows.map((r, i) => ({
        ...r,
        id: `imp-log-${Date.now()}-${i}`,
        dailyUsage: r.dailyUsage || Math.max(0, (r.closingHmKm || 0) - (r.openingHmKm || 0))
      }));
      onImportLogs(formatted);
    } else if (selectedTarget === 'wo') {
      const formatted = parsedRows.map((r, i) => ({
        ...r,
        id: `imp-wo-${Date.now()}-${i}`,
        partsUsed: []
      }));
      onImportWos(formatted);
    } else if (selectedTarget === 'part') {
      const formatted = parsedRows.map((r, i) => ({
        ...r,
        id: `imp-part-${Date.now()}-${i}`,
        compatibleUnits: []
      }));
      onImportParts(formatted);
    }

    setImportStatus(`Sukses! ${parsedRows.length} data telah berhasil dimasukkan ke sistem.`);
    setParsedRows([]);
  };

  const handleExportFullBackup = () => {
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PMS_Mining_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Import / Export & Backup Center"
      subtitle="Impor file CSV ke master unit, log harian, work order, atau suku cadang."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Target Module Choice */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Pilih Target Modul Data Import:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ['unit', 'Master Unit'],
              ['log', 'Daily HM/KM Log'],
              ['wo', 'Work Order (WO)'],
              ['part', 'Part Master']
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setSelectedTarget(val as any);
                  setParsedRows([]);
                  setImportStatus(null);
                }}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedTarget === val
                    ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Template download banner */}
        <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">Download Format CSV Template</span>
            <span className="text-[11px] text-slate-400">
              Gunakan struktur kolom resmi agar proses validasi data berjalan mulus.
            </span>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-semibold border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Unduh Template CSV</span>
          </button>
        </div>

        {/* Upload box */}
        <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-6 text-center bg-slate-900/40 transition-colors">
          <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-slate-200 font-semibold mb-1">Pilih File CSV dari Komputer Anda</p>
          <p className="text-[11px] text-slate-400 mb-3">Format yang didukung: .csv (Comma Delimited)</p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer"
          />
        </div>

        {/* Status message */}
        {importStatus && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              importStatus.startsWith('Error')
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}
          >
            {importStatus.startsWith('Error') ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus}</span>
          </div>
        )}

        {/* Import confirmation action */}
        {parsedRows.length > 0 && (
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleCommitImport}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              Impor {parsedRows.length} Baris Data Sekarang
            </button>
          </div>
        )}

        {/* Full system backup strip */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-white text-xs block">Cadangan Basis Data Penuh (JSON)</span>
              <span className="text-[10px] text-slate-400">Ekspor seluruh riwayat unit, log, WO, dan part ke satu file.</span>
            </div>
          </div>
          <button
            onClick={handleExportFullBackup}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-700 cursor-pointer font-medium"
          >
            Backup JSON Database
          </button>
        </div>
      </div>
    </Modal>
  );
};
