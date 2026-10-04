import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Database, CheckCircle2, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showToast, setShowToast] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowToast(true);
      setJustCameOnline(false);
    } else {
      // Just reconnected
      setJustCameOnline(true);
      const timer = setTimeout(() => {
        setJustCameOnline(false);
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showToast && isOnline && !justCameOnline) {
    return null;
  }

  if (justCameOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-white shadow-2xl text-xs backdrop-blur-md animate-in slide-in-from-bottom-5">
        <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <div className="font-bold text-emerald-300">Koneksi Internet Kembali Aktif</div>
          <div className="text-[11px] text-slate-300">Data operasional lokal Anda tetap sinkron.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-950/95 to-slate-900/95 border border-amber-500/60 text-white shadow-2xl text-xs backdrop-blur-md animate-in slide-in-from-bottom-5 max-w-sm">
      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
        <WifiOff className="w-4 h-4 animate-pulse" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
            Mode Offline Tambang Aktif
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
          Aplikasi dapat terus digunakan di pit tanpa internet. Seluruh perubahan tersimpan di LocalStorage perangkat Anda.
        </p>
      </div>
      <button
        onClick={() => setShowToast(false)}
        className="p-1 rounded-md text-slate-400 hover:text-white shrink-0 hover:bg-slate-800"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
