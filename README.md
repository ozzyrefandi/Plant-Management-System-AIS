# Plant Management System (PMS) - Mining Fleet Operations

Sistem Manajemen Alat Berat & Perawatan Pertambangan (Fleet Monitoring, HM/KM Daily Log, Preventive & Predictive Maintenance, Work Order, RCA, Pareto Analysis, dan Spare Part Forecasting).

---

## ⚠️ Solusi Masalah "Layar Putih" (White Screen)

Jika Anda mendownload repository ini atau membukanya di GitHub dan hanya tampil **layar putih**, berikut adalah penyebab dan solusinya:

### 1. Kenapa Terjadi Layar Putih?
- **Saat dibuka offline via klik ganda `index.html` (protokol `file:///`):**
  Browser modern (Chrome, Edge, Firefox) memiliki kebijakan keamanan **CORS** yang secara ketat **memblokir modul JavaScript (`<script type="module">`)** jika dibuka langsung dari file explorer tanpa web server lokal.
- **Saat diunggah / repost ke GitHub Pages sebelumnya:**
  File build lama menggunakan path absolut (`/assets/...`) sehingga saat dibuka di URL GitHub Pages (`https://username.github.io/nama-repo/`), browser mencari aset di `https://username.github.io/assets/...` (404 Not Found).
  **Perbaikan:** Kami telah mengonfigurasi `base: './'` (relative path) dan menambahkan file workflow GitHub Actions otomatis.

---

## 🚀 Cara Menjalankan Aplikasi Secara Offline

### Cara 1: Menggunakan Launcher 1-Klik (Paling Mudah)
1. **Windows**: Cukup klik dua kali file **`start-offline.bat`**.
2. **Mac / Linux**: Buka terminal di folder ini dan ketik:
   ```bash
   chmod +x start-offline.sh
   ./start-offline.sh
   ```
Browser akan otomatis terbuka menampilkan aplikasi di `http://localhost:3000`.

---

### Cara 2: Melalui Terminal / Command Prompt
Pastikan sudah terinstal [Node.js](https://nodejs.org/) di komputer Anda:
```bash
# 1. Install dependensi (hanya perlu sekali)
npm install

# 2. Build aplikasi
npm run build

# 3. Jalankan server offline
npm run serve
# atau
npm run preview
```
Buka browser di alamat: `http://localhost:3000` atau `http://localhost:4173`.

---

### Cara 3: Menggunakan Python (Tanpa Node.js)
Jika Anda memiliki Python di komputer Anda:
```bash
cd dist
python -m http.server 3000
```
Lalu buka browser di `http://localhost:3000`.

---

### Cara 4: Menggunakan VS Code (Live Server)
1. Buka folder ini di **VS Code**.
2. Install ekstensi **Live Server**.
3. Klik kanan pada `dist/index.html` &rarr; pilih **"Open with Live Server"**.

---

## 🌐 Cara Deploy ke GitHub Pages (Bebas Layar Putih)

Repository ini sudah dilengkapi dengan **GitHub Actions** otomatis (`.github/workflows/deploy.yml`):

1. Push / Repost kode ini ke repository GitHub Anda.
2. Di halaman repository GitHub Anda, buka menu **Settings** &rarr; **Pages** (di sidebar kiri).
3. Pada bagian **Build and deployment** &rarr; **Source**, pilih opsi:
   👉 **GitHub Actions**
4. Tunggu workflow selesai (sekitar 1 menit di tab **Actions**).
5. Buka link yang diberikan oleh GitHub Pages. Aplikasi akan tampil sempurna tanpa layar putih!

---

## 📱 Menggunakan sebagai Aplikasi Offline (PWA)

Aplikasi ini sudah berstandar **Progressive Web App (PWA)**:
1. Buka aplikasi sekali di browser (baik via GitHub Pages atau `http://localhost:3000`).
2. Klik tombol **"Install App"** di pojok kanan atas navbar (atau ikon install di bilah alamat browser).
3. Setelah terpasang, aplikasi dapat dibuka langsung dari Desktop / Menu Aplikasi HP / Laptop kapan saja, **bahkan tanpa koneksi internet sama sekali**!
4. Semua data (Unit, HM/KM, Work Order, Suku Cadang) tersimpan aman di penyimpanan lokal perangkat (*IndexedDB & LocalStorage*).
