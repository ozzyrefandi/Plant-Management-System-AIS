import React, { useState } from 'react';
import { DownloadCloud, Check, X, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // In development iframe or unsupported browser, show info
      setShowIOSModal(true);
    }
  };

  // Header compact pill style
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-sm cursor-pointer ${className}`}
          title="Pasang / Install Aplikasi untuk Penggunaan Offline di Pit Tambang"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install Offline App</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Pasang Aplikasi Tambang (PWA)
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Aplikasi <strong>Plant Management System</strong> mendukung operasi <strong>100% Offline</strong> di area pit tambang tanpa sinyal internet:
                </p>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="font-bold text-amber-400 text-xs">Petunjuk Instalasi:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>
                      <strong>Android / Chrome / Edge:</strong> Klik ikon titik tiga di browser Anda atau ikon pasang di address bar, lalu pilih <strong>&quot;Install PlantMS&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                    </li>
                    <li>
                      <strong>iOS Safari (iPhone/iPad):</strong> Tekan tombol <strong>Share</strong> (ikon kotak berpanah ke atas), lalu gulir ke bawah dan pilih <strong>&quot;Add to Home Screen&quot;</strong> (Tambah ke Layar Utama).
                    </li>
                    <li>
                      <strong>Laptop / Komputer Windows & Mac:</strong> Buka di Chrome/Edge, klik ikon pasang di sebelah kanan bilah URL.
                    </li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Data tersimpan aman di perangkat lokal Anda dan dapat dioperasikan penuh saat sinyal tambang terputus.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Sidebar variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" />
          <span>Pasang Aplikasi Offline</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-extrabold uppercase">
          PWA
        </span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pasang Aplikasi Tambang (PWA)
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Aplikasi <strong>Plant Management System</strong> mendukung operasional <strong>100% Offline</strong> di area pit tambang tanpa sinyal internet:
              </p>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="font-bold text-amber-400 text-xs">Petunjuk Instalasi:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>
                    <strong>Android / Chrome / Edge:</strong> Klik ikon menu browser, pilih <strong>&quot;Install PlantMS&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                  </li>
                  <li>
                    <strong>iOS Safari (iPhone/iPad):</strong> Tekan tombol <strong>Share</strong> di Safari, lalu pilih <strong>&quot;Add to Home Screen&quot;</strong>.
                  </li>
                  <li>
                    <strong>Desktop PC / Laptop:</strong> Klik tombol install pada address bar browser.
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Data operasional tersimpan otomatis di perangkat lokal Anda dan tidak akan hilang saat offline.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
