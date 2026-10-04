import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home } from 'lucide-react';
import { resetAllToDefault } from '../../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in PMS Application:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset data lokal ke demo default? Data perubahan Anda akan dikembalikan ke kondisi awal.')) {
      resetAllToDefault();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/40 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Terjadi Kendala Sistem (Runtime Error)</h1>
                <p className="text-sm text-slate-400">Plant Management System mendeteksi error pada rendering UI</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-red-300 overflow-x-auto max-h-48">
              {this.state.error?.toString() || 'Unknown error occurred'}
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p className="font-semibold text-slate-200">Langkah Pemulihan yang Disarankan:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Klik tombol <strong>Muat Ulang Halaman</strong> untuk mencoba merender ulang.</li>
                <li>Jika data lokal di browser korup/rusak, klik <strong>Reset Database Lokal</strong> ke data awal pabrik.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-sm shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleResetData}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-red-200 font-semibold rounded-lg border border-red-900/40 transition-colors cursor-pointer text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Database Lokal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
