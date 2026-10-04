import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  HelpCircle,
  CheckCircle2,
  CheckCheck,
  Truck,
  Gauge,
  CalendarClock,
  Activity,
  Wrench,
  KanbanSquare,
  History,
  BarChart3,
  Cpu,
  Target,
  PackageSearch,
  Boxes,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  TrendingUp,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Workflow,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface UserGuideViewProps {
  onNavigateTab: (tabId: string) => void;
}

interface GuideSection {
  id: string;
  number: string;
  title: string;
  category: 'DASAR' | 'OPERASIONAL' | 'MAINTENANCE' | 'RELIABILITY' | 'LOGISTIK' | 'LAPORAN';
  icon: React.ComponentType<{ className?: string }>;
  targetTab: string;
  summary: string;
  steps: {
    title: string;
    desc: string;
    tips?: string;
  }[];
  keyFormulas?: {
    name: string;
    formula: string;
    desc: string;
  }[];
  standards?: {
    label: string;
    value: string;
  }[];
  faq?: {
    q: string;
    a: string;
  }[];
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'intro': true,
    'master-unit': true
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    guideData.forEach((sec) => {
      all[sec.id] = true;
    });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = ['ALL', 'DASAR', 'OPERASIONAL', 'MAINTENANCE', 'RELIABILITY', 'LOGISTIK', 'LAPORAN'];

  const guideData: GuideSection[] = [
    {
      id: 'intro',
      number: '01',
      title: 'Gambaran Umum & Navigasi Sistem',
      category: 'DASAR',
      icon: BookOpen,
      targetTab: 'dashboard',
      summary:
        'Sistem Manajemen Perawatan Pabrik & Tambang (Plant Management System) berbasis Web terintegrasi untuk pengawasan armada alat berat, dump truck, dan kendaraan operasional.',
      steps: [
        {
          title: 'Tema Industrial Tambang (Black + Yellow)',
          desc: 'Aplikasi didesain khusus dengan tema gelap kontras tinggi (Black #0b0f17 + Yellow Accent) yang nyaman digunakan pada monitor command center maupun tablet lapangan.',
          tips: 'Gunakan Sidebar di sebelah kiri untuk berpindah modul, dan Global Filter Bar di bagian atas untuk memfilter data per Site Tambang atau Departemen.'
        },
        {
          title: 'Penyimpanan Data Lokal (LocalStorage)',
          desc: 'Seluruh transaksi (tambah unit, update HM/KM, edit WO, stok part) tersimpan otomatis pada browser LocalStorage tanpa memerlukan server terpisah untuk fase demonstrasi & uji coba.',
          tips: 'Data tidak hilang saat refresh browser. Untuk memindahkan data ke perangkat lain, gunakan fitur Export JSON/CSV pada menu Pengaturan Sistem.'
        },
        {
          title: 'Multi-Role Akses Pengguna',
          desc: 'Sistem mendukung simulasi 7 peran pengguna: Super Admin, Plant Manager, Maintenance Planner, Reliability Engineer, Maintenance Supervisor, Field Mechanic, dan Warehouse/Logistics.',
          tips: 'Ubah peran melalui tombol Role Switcher pada Header atas atau tab Pengaturan Sistem untuk melihat perspektif hak akses.'
        }
      ],
      standards: [
        { label: 'Resolusi Layar', value: 'Desktop (1920x1080), Laptop (1366x768), Tablet & Mobile' },
        { label: 'Penyimpanan', value: 'Browser LocalStorage (Dapat Export/Import JSON & CSV)' },
        { label: 'Basis Perhitungan', value: 'Jam Kerja Tambang Standar (720 Jam/Bulan per Unit)' }
      ]
    },
    {
      id: 'master-unit',
      number: '02',
      title: 'Master Unit & Parameter HM vs KM',
      category: 'OPERASIONAL',
      icon: Truck,
      targetTab: 'master-unit',
      summary:
        'Database sentral identitas alat berat tambang dengan penentuan otomatis parameter pengukuran Hour Meter (HM) atau Kilometer (KM).',
      steps: [
        {
          title: 'Logika Pemilihan Parameter Pengukuran',
          desc: 'Sistem secara otomatis mendeteksi parameter unit:\n- Parameter HM (Hour Meter): Excavator, Dozer, Wheel Loader, Motor Grader, Support Equipment.\n- Parameter KM (Kilometer): Dump Truck, Articulated Dump Truck, Water Truck, Fuel Truck, Service Truck, Light Vehicle (LV).',
          tips: 'Pilihan tipe alat akan langsung mengunci parameter input yang relevan pada seluruh modul servis.'
        },
        {
          title: 'Menambah & Memperbarui Unit Alat',
          desc: 'Klik tombol "+ Tambah Unit Baru" pada modul Master Unit. Isi Unit ID (contoh: EX-201, DT-701), Nomor Alat, Brand, Model, Serial Number Engine, Site Lokasi, Status, Target Availability (PA), dan Target Utilization (UA).',
          tips: 'Tetapkan tingkat Criticality (HIGH, MEDIUM, LOW) untuk membantu prioritas pemeliharaan saat terjadi kerusakan serentak.'
        },
        {
          title: 'Manajemen Status Unit',
          desc: 'Unit dapat berstatus: RUNNING (aktif berproduksi), STANDBY (siap jalan/delay hujan), BREAKDOWN (rusak tidak terencana), PM (perawatan berkala), PDM (perawatan prediktif), WAITING PART (menunggu suku cadang), WAITING SERVICE (antrean workshop), atau DISPOSED (afkir).',
          tips: 'Mengubah status ke BREAKDOWN akan otomatis memicu rekomendasi pembuatan Work Order baru.'
        }
      ],
      standards: [
        { label: 'Target Availability (PA)', value: '≥ 90.0% (Standar Industri Pertambangan)' },
        { label: 'Target Utilization (UA)', value: '≥ 85.0% dari Ketersediaan Fisik' },
        { label: 'Jumlah Kategori', value: '12 Kategori Unit Resmi' }
      ]
    },
    {
      id: 'daily-log',
      number: '03',
      title: 'Log Harian HM / KM & Utilisasi Alat',
      category: 'OPERASIONAL',
      icon: Gauge,
      targetTab: 'daily-log',
      summary:
        'Pencatatan harian meter awal (Opening) dan meter akhir (Closing) untuk menghitung jam kerja harian, sisa interval servis, dan utilisasi bahan bakar/operator.',
      steps: [
        {
          title: 'Input Log Harian per Shift/Hari',
          desc: 'Pilih unit, tanggal operasional, masukkan Opening Meter dan Closing Meter. Sistem akan memvalidasi agar Closing Meter tidak boleh lebih kecil dari Opening Meter.',
          tips: 'Nilai Delta HM/KM harian otomatis memperbarui nilai HM Current / KM Current pada Master Unit.'
        },
        {
          title: 'Sinkronisasi Otomatis ke Jadwal PM',
          desc: 'Setiap penambahan jam kerja harian akan mengurangi angka Remaining Service pada modul PM Schedule. Jika sisa HM/KM kurang dari toleransi (50 HM atau 500 KM), unit otomatis berstatus DUE SOON.',
          tips: 'Gunakan filter Tanggal dan Site untuk mencetak log utilisasi harian bagi departemen Produksi Tambang.'
        }
      ],
      keyFormulas: [
        {
          name: 'Utilisasi Jam Operasi Harian (HM/Hari)',
          formula: 'Daily HM = Closing HM - Opening HM',
          desc: 'Rata-rata operasi normal alat berat tambang berkisar 16 - 20 jam kerja per hari (2 shift).'
        }
      ]
    },
    {
      id: 'pm-management',
      number: '04',
      title: 'Preventive Maintenance (PM) Management',
      category: 'MAINTENANCE',
      icon: CalendarClock,
      targetTab: 'pm-management',
      summary:
        'Penjadwalan perawatan berkala terencana dengan interval HM (250, 500, 1000, 2000, 4000) dan KM (5000, 10000, 20000).',
      steps: [
        {
          title: 'Interval Servis Standar Pertambangan',
          desc: 'Alat Berat HM: PM 250 (Ganti oli mesin & filter), PM 500 (Ganti oli hidrolik minor & filter bahan bakar), PM 1000 (Ganti oli transmisi & final drive), PM 2000/4000 (Major service & overhaul kit).\nKendaraan KM: Servis 5.000 KM, 10.000 KM, 20.000 KM.',
          tips: 'Pilih tipe interval saat membuat jadwal PM baru untuk unit yang baru beroperasi.'
        },
        {
          title: 'Indikator Status Otomatis (SAFE, DUE SOON, OVERDUE)',
          desc: '- SAFE (Hijau): Sisa meter > 50 HM atau > 500 KM.\n- DUE SOON (Kuning): Sisa meter antara 1 s/d 50 HM (atau 1 s/d 500 KM), unit wajib segera diagendakan masuk workshop.\n- OVERDUE (Merah): Sisa meter ≤ 0 (melewati jadwal servis). Memerlukan tindakan segera karena berisiko membatalkan garansi mesin.',
          tips: 'Unit berstatus OVERDUE akan otomatis memunculkan peringatan banner merah pada Dashboard Utama.'
        },
        {
          title: 'Penyelesaian PM (Complete PM Action)',
          desc: 'Saat mekanik menyelesaikan PM, klik tombol "Selesaikan PM" (ikon centang hijau). Masukkan meter pelaksanaan aktual dan tanggal selesai. Sistem otomatis menghitung Next Service HM/KM berdasarkan interval berikutnya (misal PM 250 selesai di 15.000 HM, maka next PM 500 di 15.250 HM).',
          tips: 'Riwayat tanggal selesai dan meter riil dicatat untuk audit kepatuhan ISO 55000.'
        }
      ],
      keyFormulas: [
        {
          name: 'Sisa Meter Servis (Remaining)',
          formula: 'Remaining HM = Next Service HM - Current HM',
          desc: 'Jika nilai bertanda negatif (-), unit telah melebihi batas waktu servis sebanyak selisih tersebut.'
        }
      ]
    },
    {
      id: 'pm-compliance',
      number: '05',
      title: 'PM Compliance & Backlog Tracking',
      category: 'MAINTENANCE',
      icon: CheckCheck,
      targetTab: 'pm-compliance',
      summary:
        'Evaluasi kepatuhan jadwal perawatan preventif dengan target keberhasilan standar tambang ≥ 95%.',
      steps: [
        {
          title: 'Memantau KPI Kepatuhan PM (Compliance Rate)',
          desc: 'Dashboard PM Compliance menghitung persentase servis yang berhasil diselesaikan tepat waktu dibandingkan total servis yang jatuh tempo dalam periode berjalan.',
          tips: 'Target compliance departemen plant tambang kelas dunia adalah minimal 95% untuk mencegah unscheduled breakdown.'
        },
        {
          title: 'Analisis Multi-Dimensi',
          desc: 'Gunakan tombol breakdown untuk melihat compliance per Kategori Unit, per Departemen Tambang, per Site Proyek, atau per Kontraktor.',
          tips: 'Identifikasi grup alat mana yang sering mengalami keterlambatan servis untuk penambahan mekanik atau alokasi bay workshop.'
        }
      ],
      keyFormulas: [
        {
          name: 'PM Compliance Rate (%)',
          formula: 'PM Compliance % = (PM Selesai Tepat Waktu / Total PM Terjadwal) × 100%',
          desc: 'PM dianggap tepat waktu jika diselesaikan dalam batas toleransi ±10% interval servis.'
        }
      ]
    },
    {
      id: 'pdm-management',
      number: '06',
      title: 'Predictive Maintenance (PDM) & Oil / SOS Analysis',
      category: 'MAINTENANCE',
      icon: Activity,
      targetTab: 'pdm-management',
      summary:
        'Sistem pemantauan kondisi mesin prediktif berbasis analisis oli (SOS/Wear Metal), temperatur, dan vibrasi komponen.',
      steps: [
        {
          title: 'Parameter Monitoring Kritis',
          desc: 'Sistem memantau 15 parameter: Engine Oil (viskositas/logam aus Cu, Fe, Cr), Coolant (pH & kontaminasi nitrit), Hydraulic Oil, Transmission Oil, Final Drive, Differential, Gearbox, Vibrasi Bearing, dan Suhu Exhaust.',
          tips: 'Catat hasil laboratorium SOS setiap 250 HM atau sesuai jadwal sampling rutin.'
        },
        {
          title: 'Deteksi Limit Normal vs Warning vs Critical',
          desc: 'Setiap parameter memiliki nilai aktual, batas peringatan (Warning Limit), dan batas kritis (Critical Limit). Sistem otomatis menandai status:\n- NORMAL: Nilai dalam batas aman operasi.\n- WARNING: Terdapat tren kenaikan partikel aus, unit masuk daftar pengawasan (watchlist).\n- CRITICAL: Melebihi ambang batas keselamatan, unit wajib segera diinspeksi untuk mencegah catastrophic engine failure.',
          tips: 'Unit dengan status PDM Kritis memicu rekomendasi penggantian komponen pada Smart Maintenance Assistant.'
        }
      ]
    },
    {
      id: 'work-orders',
      number: '07',
      title: 'Work Order (WO) & Kanban Pipeline',
      category: 'MAINTENANCE',
      icon: Wrench,
      targetTab: 'work-order',
      summary:
        'Pengelolaan perintah kerja perbaikan, pelacakan status kanban visual, kalkulasi biaya suku cadang, dan pencatatan jam henti (downtime).',
      steps: [
        {
          title: 'Membuat Work Order Baru',
          desc: 'Klik "+ Buat Work Order". Pilih unit alat, jenis WO (Breakdown, Corrective Maintenance, PM, PDM, Inspection, Modification, Tyre, Electrical, Lubrication), isi uraian kerusakan, komponen rusak, mekanik yang ditugaskan, prioritas (CRITICAL, HIGH, MEDIUM, LOW), estimasi jam henti, dan estimasi biaya suku cadang.',
          tips: 'Pilih jenis "Breakdown" untuk kerusakan darurat di pit tambang agar otomatis tercatat dalam rekapitulasi downtime harian.'
        },
        {
          title: 'Pelacakan Kanban Board (WO Tracking)',
          desc: 'Buka tab "WO Tracking Kanban". Kartu perintah kerja dikelompokkan ke dalam kolom alur kerja: OPEN → IN PROGRESS → WAITING PART → REPAIR → TESTING → CLOSED.',
          tips: 'Gunakan tombol panah kanan (→) atau kiri (←) pada setiap kartu kanban untuk menggeser status kemajuan pekerjaan secara interaktif.'
        },
        {
          title: 'Menutup Work Order & Mengembalikan Status Unit',
          desc: 'Ketika pengetesan unit (Testing) selesai dan unit layak kembali beroperasi ke Pit, ubah status WO ke CLOSED. Masukkan jam selesai aktual dan jam henti (downtime hours).',
          tips: 'Sistem akan otomatis memperbarui status unit di Master Unit dari BREAKDOWN kembali menjadi RUNNING.'
        },
        {
          title: 'WO Activity Log & Audit Trail',
          desc: 'Buka modul "WO Activity Log" untuk melihat kronologis detail setiap intervensi mekanik, waktu permintaan part, hingga unit dinyatakan rilis.',
          tips: 'Catatan ini menjadi bukti audit investigasi insiden dan pelaporan keselamatan kerja K3 pertambangan.'
        }
      ]
    },
    {
      id: 'reliability-pareto',
      number: '08',
      title: 'Pareto 80/20 & Analisis Keandalan (Reliability)',
      category: 'RELIABILITY',
      icon: BarChart3,
      targetTab: 'pareto-analysis',
      summary:
        'Penerapan metodologi Pareto 80/20 untuk memfokuskan sumber daya teknis pada 20% penyebab yang menimbulkan 80% jam henti dan biaya perbaikan.',
      steps: [
        {
          title: 'Prinsip Pareto 80/20 pada Pemeliharaan Tambang',
          desc: 'Grafik batang ganda mengurutkan frekuensi kegagalan dari yang tertinggi ke terendah, disertai garis kurva kumulatif persentase (0 - 100%). Komponen di bawah batas 80% adalah kontributor utama kerugian produksi.',
          tips: 'Gunakan selector dimensi untuk menganalisis Pareto berdasarkan: Komponen Rusak, Tipe Alat Berat, Sistem (Hydraulic, Engine, Electrical), atau Lokasi Pit Tambang.'
        },
        {
          title: 'Metrik Keandalan Armada (Fleet Reliability KPIs)',
          desc: 'Buka tab "Fleet Reliability & KPI" untuk meninjau:\n- PA (Physical Availability): Ketersediaan fisik unit siap dioperasikan.\n- MA (Mechanical Availability): Keandalan mekanikal murni tanpa memperhitungkan delay cuaca/hujan.\n- UA (Utilization of Availability): Efisiensi pemakaian alat yang tersedia oleh tim Operasi Produksi.\n- MTBF (Mean Time Between Failures): Rata-rata jam operasi mesin antar kerusakan tidak terencana.\n- MTTR (Mean Time to Repair): Rata-rata durasi perbaikan oleh tim mekanik.',
          tips: 'Nilai MTBF yang tinggi menunjukkan pemeliharaan preventif berjalan baik, sedangkan nilai MTTR yang rendah membuktikan respon teknisi tanggap dan ketersediaan part memadai.'
        }
      ],
      keyFormulas: [
        {
          name: 'Physical Availability (PA %)',
          formula: 'PA = ((Operating Hours + Standby Hours) / Total Scheduled Hours) × 100%',
          desc: 'Target standar pertambangan nasional ≥ 90.0%.'
        },
        {
          name: 'Mechanical Availability (MA %)',
          formula: 'MA = (Operating Hours / (Operating Hours + Breakdown Hours)) × 100%',
          desc: 'Mengukur keandalan peralatan murni tanpa dipengaruhi delay operasional tambang.'
        },
        {
          name: 'Mean Time Between Failures (MTBF)',
          formula: 'MTBF = Total Jam Operasi / Jumlah Kasus Kerusakan Breakdown (kasus)',
          desc: 'Satuan dalam jam (Hours). Semakin tinggi angka MTBF, semakin handal peralatan.'
        },
        {
          name: 'Mean Time to Repair (MTTR)',
          formula: 'MTTR = Total Jam Perbaikan (Downtime) / Jumlah Peristiwa Perbaikan',
          desc: 'Target ideal MTTR perbaikan alat berat tambang adalah ≤ 4.0 jam.'
        }
      ]
    },
    {
      id: 'component-rca',
      number: '09',
      title: 'Component Lifecycle & Root Cause Analysis (RCA)',
      category: 'RELIABILITY',
      icon: Target,
      targetTab: 'rca',
      summary:
        'Pelacakan siklus hidup komponen utama (Engine, Transmission, Hydraulic Pump) dan investigasi kegagalan akar masalah dengan metode 5-Why & Fishbone.',
      steps: [
        {
          title: 'Analisis Umur Komponen (Component Life Analysis)',
          desc: 'Pantau tanggal pemasangan (Install Date & HM/KM) dan pelepasan (Remove Date). Sistem menghitung Actual Life dan Life Achievement % terhadap Standard Life pabrikan.',
          tips: 'Pencapaian umur komponen < 70% diidentifikasi sebagai premature failure yang wajib diinvestigasi via RCA.'
        },
        {
          title: 'Investigasi 5-Why & Diagram Fishbone',
          desc: 'Buka modul "RCA & 5-Why Failure". Tambahkan rekaman investigasi kegagalan untuk Work Order mayor. Isi 5 tingkatan pertanyaan "Mengapa" (Why 1 s/d Why 5) hingga menemukan akar masalah terdalam (sistemik).',
          tips: 'Lengkapi dengan analisis 6 faktor Ishikawa Fishbone: Manusia (Man), Mesin (Machine), Metode (Method), Material (Material), Lingkungan (Milieu), dan Pengukuran (Measurement).'
        },
        {
          title: 'Menetapkan Tindakan Korektif & Preventif (CAPA)',
          desc: 'Rumuskan Corrective Action (tindakan pemulihan langsung) dan Preventive Action (tindakan pencegahan jangka panjang agar kerusakan serupa tidak terulang di seluruh unit satu model).',
          tips: 'Pantau tanggal target penyelesaian dan penanggung jawab (PIC) untuk audit keselamatan pertambangan.'
        }
      ]
    },
    {
      id: 'part-forecast',
      number: '10',
      title: 'Prediksi Kebutuhan Suku Cadang & Gudang Part',
      category: 'LOGISTIK',
      icon: PackageSearch,
      targetTab: 'part-forecast',
      summary:
        'Kalkulator kebutuhan spare part prediktif otomatis untuk mencegah unit breakdown terhenti lama karena menunggu suku cadang (Waiting Part).',
      steps: [
        {
          title: 'Algoritma Peramalan Suku Cadang (Part Demand Forecasting)',
          desc: 'Sistem menghitung prediksi kebutuhan part untuk periode 1 Bulan, 3 Bulan, dan 6 Bulan berdasarkan:\n1. Konsumsi historis bulanan rata-rata (Average Monthly Consumption).\n2. Populasi aktif armada alat berat pemakai suku cadang tersebut.\n3. Rencana jadwal servis Preventive Maintenance (PM) mendatang.\n4. Umur sisa komponen yang terpasang di lapangan.',
          tips: 'Buka tab "Part Forecast Demand" untuk melihat rekomendasi kuantitas Purchase Order (PO) yang perlu dipesan ke vendor.'
        },
        {
          title: 'Klasifikasi Status Stok Gudang (Warehouse Health)',
          desc: '- STOCK SAFE (Hijau): Stok saat ini > Reorder Point (ROP) + Safety Stock.\n- LOW STOCK (Kuning): Stok berada di antara Minimum Stock dan Reorder Point, saatnya menerbitkan PO pengadaan.\n- CRITICAL (Merah): Stok berada di bawah Safety Stock atau bernilai nol. Unit yang rusak berisiko tinggi menunggu suplai (Waiting Part).\n- OVERSTOCK (Biru): Stok melebihi Maximum Stock, berpotensi membebani modal kerja gudang.',
          tips: 'Sistem menghitung nilai Rupiah modal yang terikat dalam stok serta estimasi biaya pesanan baru.'
        },
        {
          title: 'Pencatatan Transaksi Gudang (Stok Masuk, Keluar & Penyesuaian)',
          desc: 'Buka tab "Part Master & Stock" untuk mencatat penerimaan part dari vendor (IN), pengeluaran part ke mekanik untuk Work Order tertentu (OUT), dan penyesuaian stock opname (ADJUSTMENT).',
          tips: 'Setiap transaksi part otomatis memotong saldo stok dan memperbarui status kesehatan gudang secara instan.'
        }
      ],
      keyFormulas: [
        {
          name: 'Titik Pesan Kembali (Reorder Point - ROP)',
          formula: 'ROP = (Rata-rata Konsumsi Harian × Lead Time Hari) + Safety Stock',
          desc: 'Batas kuantitas di mana departemen pengadaan wajib menerbitkan PO ke vendor.'
        },
        {
          name: 'Rekomendasi Pemesanan PO',
          formula: 'Rekomendasi PO = Max(0, Forecast 3 Bulan + Safety Stock - Stok Saat Ini)',
          desc: 'Menghindari penumpukan stok berlebih sekaligus mencegah kekosongan part kritis.'
        }
      ]
    },
    {
      id: 'reports-export',
      number: '11',
      title: 'Pusat Laporan Tambang, Cetak PDF & Ekspor CSV',
      category: 'LAPORAN',
      icon: FileSpreadsheet,
      targetTab: 'reports',
      summary:
        'Kompilasi 13 template laporan standar industri pertambangan siap cetak dan ekspor lembar kerja CSV/Excel.',
      steps: [
        {
          title: '13 Template Laporan Resmi',
          desc: 'Daftar template meliputi:\n1. Laporan Harian Pemeliharaan (Daily Maintenance Log)\n2. Laporan Kepatuhan Servis (PM Compliance Report)\n3. Laporan Kasus Kerusakan & Jam Henti (Breakdown Summary)\n4. Laporan Ketersediaan Armada (Fleet Availability PA/MA/UA)\n5. Laporan Kondisi Prediktif (PDM SOS Oil Report)\n6. Laporan Analisis Pareto Kerusakan\n7. Laporan Siklus Hidup Komponen\n8. Laporan Investigasi Kegagalan (RCA Report)\n9. Laporan Kebutuhan & Peramalan Suku Cadang\n10. Laporan Nilai Aset Stok Gudang\n11. Kartu Riwayat Unit (Equipment History Card)\n12. Laporan Biaya Pemeliharaan per Jam Kerja (Cost/HM)\n13. Executive Reliability Summary (Laporan Dewan Direksi)',
          tips: 'Pilih template yang diinginkan dari menu Report Center, lalu sesuaikan rentang tanggal dan site proyek.'
        },
        {
          title: 'Mencetak Laporan Format Resmi Pertambangan',
          desc: 'Klik tombol "Cetak Laporan / Print" (ikon printer). Tampilan telah dioptimalkan khusus (CSS @media print) untuk menghasilkan dokumen hitam-putih/berwarna resmi lengkap dengan kop perusahaan dan kolom tanda tangan pengesahan (Plant Manager & Maintenance Superintendent).',
          tips: 'Pilih opsi "Save as PDF" pada dialog cetak browser untuk menyimpan salinan dokumen digital.'
        },
        {
          title: 'Ekspor Data ke CSV / Excel',
          desc: 'Gunakan tombol "Export CSV" di setiap tabel data (Master Unit, Log HM, PM, WO, Part) untuk mengunduh data mentah ke lembar kerja Excel guna keperluan kalkulasi eksternal.',
          tips: 'Ekspor data secara periodik sebagai salinan cadangan sekunder operasional.'
        }
      ]
    },
    {
      id: 'backup-settings',
      number: '12',
      title: 'Pengaturan Sistem, Hak Akses & Backup / Restore',
      category: 'DASAR',
      icon: Settings,
      targetTab: 'settings',
      summary:
        'Konfigurasi parameter sistem, simulasi hak akses role, serta pencadangan (backup) dan pemulihan (restore) database lokal.',
      steps: [
        {
          title: 'Simulasi Hak Akses Berbasis Peran (RBAC)',
          desc: 'Sistem membatasi fungsi sesuai peran terpilih:\n- Super Admin & Plant Manager: Akses penuh CRUD seluruh modul dan pengaturan sistem.\n- Maintenance Planner: Manajemen jadwal PM, estimasi part, dan penjadwalan WO.\n- Reliability Engineer: Analisis Pareto, MTBF/MTTR, RCA 5-Why, dan umur komponen.\n- Field Mechanic: Input jam kerja WO dan catatan penyelesaian servis.\n- Warehouse Staff: Pengelolaan katalog stok part dan transaksi penerimaan/pengeluaran barang.',
          tips: 'Pengujian fitur dengan berbagai peran dapat dilakukan tanpa perlu login/logout berulang kali.'
        },
        {
          title: 'Cadangkan Database (Backup JSON)',
          desc: 'Klik tombol "Backup Data (JSON)" pada modal Import/Export Data di Header atas. Berkas JSON utuh yang berisi seluruh data unit, log, jadwal PM, WO, komponen, dan stok part akan diunduh ke komputer Anda.',
          tips: 'Lakukan backup berkala setiap selesai pembaruan data besar di akhir shift kerja.'
        },
        {
          title: 'Pulihkan Data (Restore JSON) atau Reset Demo Data',
          desc: 'Untuk mengembalikan data dari file cadangan sebelumnya, klik "Restore Data (JSON)" dan pilih berkas JSON terkait. Jika ingin kembali ke data simulasi bawaan tambang, klik tombol "Reset ke Data Default Tambang".',
          tips: 'Tombol Reset ke Data Default akan mengembalikan seluruh dataset ke kondisi awal simulasi tambang Sangatta & Morowali.'
        }
      ]
    }
  ];

  const filteredGuides = useMemo(() => {
    return guideData.filter((sec) => {
      const matchCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCategory;

      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchSteps = sec.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
      );
      const matchFormulas = sec.keyFormulas?.some(
        (f) => f.name.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q)
      );

      return matchCategory && (matchTitle || matchSummary || matchSteps || matchFormulas);
    });
  }, [guideData, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#0f172a] to-[#111827] border border-amber-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Petunjuk Penggunaan Aplikasi
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    MANUAL V2.4
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Panduan Komprehensif Operasional Plant Management System: Alat Berat • Dump Truck • Kendaraan Ringan
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={expandAll}
              className="flex-1 lg:flex-none px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Semua</span>
            </button>
            <button
              onClick={collapseAll}
              className="flex-1 lg:flex-none px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Tutup Semua</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-none px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Panduan</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari topik, rumus, modul, atau istilah teknis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Jump Modul Grid */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-amber-400" />
          Akses Cepat Modul Pembelajaran
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {guideData.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setExpandedSections((prev) => ({ ...prev, [sec.id]: true }));
                  const el = document.getElementById(`section-${sec.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-800/80 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="p-1.5 rounded bg-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono-nums font-bold text-amber-400">
                    Modul {sec.number}
                  </span>
                  <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                    {sec.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Diagram Banner: Alur Perawatan Alat Tambang */}
      <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-slate-800 rounded-xl p-4.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Standard Operating Procedure (SOP) Alur Pemeliharaan Alat Berat
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            SOP-PLANT-001 Rev. 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-400">TAHAP 1</span>
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Logging Meter Harian</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Operator / Foreman mencatat opening & closing HM/KM harian di pit tambang.
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-2 pt-2 border-t border-slate-800">
              Input di Log HM/KM →
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-400">TAHAP 2</span>
                <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Peringatan Jadwal Servis</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sistem mendeteksi sisa meter ≤ 50 HM (Due Soon). Planner menerbitkan Work Order PM.
              </p>
            </div>
            <div className="text-[10px] text-amber-400 font-medium mt-2 pt-2 border-t border-slate-800">
              Cek PM Schedule →
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-400">TAHAP 3</span>
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Eksekusi di Workshop</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mekanik mengambil spare part dari gudang, melakukan perbaikan, dan mencatat log aktivitas.
              </p>
            </div>
            <div className="text-[10px] text-sky-400 font-medium mt-2 pt-2 border-t border-slate-800">
              Kanban WO Tracking →
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-400">TAHAP 4</span>
                <Activity className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Pengujian & Rilis</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Unit dites fungsi hidrolik & engine. WO ditutup (Closed), unit kembali berstatus RUNNING.
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-2 pt-2 border-t border-slate-800">
              Rilis ke Produksi Pit →
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-400">TAHAP 5</span>
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Analisis Reliability & RCA</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Engineer meninjau Pareto breakdown, menghitung PA/MTBF, dan melakukan investigasi 5-Why.
              </p>
            </div>
            <div className="text-[10px] text-purple-400 font-medium mt-2 pt-2 border-t border-slate-800">
              Laporan Evaluasi KPI →
            </div>
          </div>
        </div>
      </div>

      {/* Main Accordion List of Sections */}
      <div className="space-y-4">
        {filteredGuides.map((sec) => {
          const Icon = sec.icon;
          const isExpanded = !!expandedSections[sec.id];

          return (
            <div
              key={sec.id}
              id={`section-${sec.id}`}
              className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleSection(sec.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-mono-nums font-bold text-xs">
                    {sec.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {sec.category}
                      </span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider truncate">
                        {sec.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-2xl">
                      {sec.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab(sec.targetTab);
                    }}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-1 rounded bg-slate-800 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Expanded Content */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 bg-[#0d131f] space-y-5 text-xs text-slate-300">
                  {/* Summary Callout */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sec.summary}
                    </p>
                  </div>

                  {/* Step by Step Guide */}
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Workflow className="w-3.5 h-3.5 text-amber-400" />
                      Langkah-Langkah & Panduan Praktis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sec.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="bg-[#111827] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h5 className="font-bold text-slate-100 text-xs">{st.title}</h5>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line pl-7">
                              {st.desc}
                            </p>
                          </div>

                          {st.tips && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2 pl-7">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-amber-300/90 leading-tight">
                                <strong>Tips Lapangan:</strong> {st.tips}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulas Section (if any) */}
                  {sec.keyFormulas && sec.keyFormulas.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                        Formula & Rumus Perhitungan Resmi
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sec.keyFormulas.map((fm, idx) => (
                          <div
                            key={idx}
                            className="bg-[#111827] border border-sky-900/30 rounded-lg p-3.5"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-sky-300 text-xs">{fm.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono-nums">RUMUS</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 rounded p-2 text-center my-2">
                              <code className="text-xs font-bold text-amber-400 font-mono-nums">
                                {fm.formula}
                              </code>
                            </div>
                            <p className="text-[11px] text-slate-400">{fm.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standards Checklist (if any) */}
                  {sec.standards && sec.standards.length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Standar Acuan Parameter Pertambangan
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {sec.standards.map((std, idx) => (
                          <div key={idx} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">{std.label}</span>
                            <div className="font-bold text-amber-400 text-xs mt-0.5">{std.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Jump Button inside section */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigateTab(sec.targetTab)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Langsung Buka Modul {sec.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGuides.length === 0 && (
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">Tidak ada topik panduan yang cocok</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tidak ditemukan topik panduan dengan kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata kunci lain seperti &quot;PM&quot;, &quot;HM&quot;, &quot;Kanban&quot;, atau &quot;Pareto&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-amber-400 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Frequently Asked Questions (FAQ) - Pertanyaan Umum Lapangan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-lg">
            <h5 className="font-bold text-amber-400 text-xs mb-1">
              Q: Apakah data tersimpan jika browser ditutup atau komputer restart?
            </h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Ya, tersimpan.</strong> Seluruh data disimpan langsung ke teknologi HTML5 LocalStorage browser. Data tetap ada selama Anda tidak menghapus &quot;Clear Browsing Data / LocalStorage&quot;. Untuk keamanan maksimal, ekspor file JSON cadangan dari menu Pengaturan.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-lg">
            <h5 className="font-bold text-amber-400 text-xs mb-1">
              Q: Kapan parameter unit menggunakan HM dan kapan menggunakan KM?
            </h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Sistem mendeteksi otomatis.</strong> Alat produksi tambang seperti Excavator, Dozer, Grader, dan Wheel Loader dihitung berdasarkan jam mesin (Hour Meter - HM). Kendaraan jalan raya dan pengangkutan seperti Dump Truck, LV, Fuel Truck, dan Water Truck menggunakan Kilometer (KM).
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-lg">
            <h5 className="font-bold text-amber-400 text-xs mb-1">
              Q: Apa yang harus dilakukan jika ada Work Order berstatus WAITING PART?
            </h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Buka tab <strong>Part Forecast Demand</strong> untuk melihat status ketersediaan suku cadang terkait di gudang. Buat Purchase Order jika stok habis atau alihkan part dari unit standby non-kritis bila diizinkan supervisor.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-lg">
            <h5 className="font-bold text-amber-400 text-xs mb-1">
              Q: Bagaimana cara mencetak laporan resmi untuk manajemen tambang?
            </h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Buka menu <strong>Report Center & Print</strong>, pilih salah satu dari 13 template laporan resmi, lalu klik tombol &quot;Cetak Laporan / Print&quot;. Halaman telah diformat otomatis untuk kertas A4 lengkap dengan kop perusahaan dan kolom tanda tangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
