import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Path to built dist or current directory
const distPath = path.resolve(__dirname, 'dist');
const targetPath = fs.existsSync(distPath) ? distPath : __dirname;

console.log('========================================================');
console.log('⚡ PLANT MANAGEMENT SYSTEM - LOCAL OFFLINE SERVER');
console.log('========================================================');
console.log(`Menyajikan direktori: ${targetPath}`);

app.use(express.static(targetPath));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  const indexPath = path.join(targetPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('File index.html tidak ditemukan. Silakan jalankan `npm run build` terlebih dahulu.');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n✅ Server Offline berhasil berjalan!`);
  console.log(`🌐 Buka di browser Anda: \x1b[36m${url}\x1b[0m\n`);
  console.log('💡 Aplikasi berjalan 100% offline tanpa membutuhkan koneksi internet.');
  console.log('💡 Tekan Ctrl + C di terminal ini untuk menghentikan server.\n');

  // Try to automatically open in default browser
  const startCmd = process.platform === 'win32' ? `start ${url}` :
                   process.platform === 'darwin' ? `open ${url}` :
                   `xdg-open ${url}`;
  exec(startCmd, () => {});
});
