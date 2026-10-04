import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RadialGaugeChartProps {
  score: number; // 0 - 100
  title?: string;
  subtitle?: string;
  totalUnits?: number;
  excellentCount?: number;
  goodCount?: number;
  watchCount?: number;
  criticalCount?: number;
}

export const RadialGaugeChart: React.FC<RadialGaugeChartProps> = ({
  score,
  title = 'Rata-rata Skor Kesehatan Armada',
  subtitle = 'Average Fleet Health Index',
  totalUnits = 0,
  excellentCount = 0,
  goodCount = 0,
  watchCount = 0,
  criticalCount = 0
}) => {
  // Clamped score
  const safeScore = Math.min(100, Math.max(0, isNaN(score) ? 0 : score));

  // Determine classification and colors
  let statusText = 'EXCELLENT';
  let statusColor = '#10b981'; // emerald-500
  let statusBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let desc = 'Kondisi keandalan armada optimal, kepatuhan servis tinggi.';

  if (safeScore < 60) {
    statusText = 'CRITICAL';
    statusColor = '#ef4444'; // rose-500
    statusBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    desc = 'Banyak unit mengalami breakdown atau PDM kritis, perlu tindakan segera.';
  } else if (safeScore < 75) {
    statusText = 'WATCH';
    statusColor = '#f59e0b'; // amber-500
    statusBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    desc = 'Terdapat unit mendekati batas servis dan backlog perbaikan.';
  } else if (safeScore < 90) {
    statusText = 'GOOD';
    statusColor = '#38bdf8'; // sky-400
    statusBg = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    desc = 'Armada beroperasi stabil dengan tingkat kesiapan tinggi.';
  }

  // Radial Gauge Geometry (220-degree sweep)
  const radius = 80;
  const cx = 120;
  const cy = 115;
  const totalAngle = 220; // total arc span in degrees
  const startAngle = 160; // start angle from positive x-axis (clockwise)
  
  // Circumference of full circle
  const circumference = 2 * Math.PI * radius;
  // Total arc length for 220 degrees
  const arcLength = (totalAngle / 360) * circumference;
  // Progress stroke length
  const progressLength = (safeScore / 100) * arcLength;

  // Function to polar to cartesian coordinate
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  // SVG Arc description (Clockwise from startA to endA)
  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    if (Math.abs(endA - startA) < 0.05) return '';
    const pStart = polarToCartesian(x, y, r, startA);
    const pEnd = polarToCartesian(x, y, r, endA);
    const largeArcFlag = Math.abs(endA - startA) > 180 ? '1' : '0';
    return ['M', pStart.x, pStart.y, 'A', r, r, 0, largeArcFlag, 1, pEnd.x, pEnd.y].join(' ');
  };

  // Arc paths
  // 220 degrees: from -110 to +110 relative to top (12 o'clock)
  const trackPath = describeArc(cx, cy, radius, -110, 110);
  const currentAngle = -110 + (safeScore / 100) * totalAngle;
  const valuePath = describeArc(cx, cy, radius, -110, currentAngle);
  const tipCoord = polarToCartesian(cx, cy, radius, currentAngle);

  // Ticks at 0, 25, 50, 75, 100
  const ticks = [
    { val: 0, angle: -110, label: '0' },
    { val: 25, angle: -110 + 0.25 * totalAngle, label: '25' },
    { val: 50, angle: -110 + 0.5 * totalAngle, label: '50' },
    { val: 75, angle: -110 + 0.75 * totalAngle, label: '75' },
    { val: 100, angle: 110, label: '100' }
  ];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
      {/* Gauge Visualization Side */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative w-64 h-48 flex items-center justify-center">
          <svg viewBox="0 0 240 210" className="w-full h-full overflow-visible">
            <defs>
              {/* Radial gradient for the progress bar */}
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Threshold Zones in Background */}
              <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            {/* Background Track Arc */}
            <path
              d={trackPath}
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Threshold color hints along the outer radius */}
            {/* Critical zone: 0-60 */}
            <path
              d={describeArc(cx, cy, radius + 11, -110, -110 + 0.6 * totalAngle)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              opacity="0.45"
            />
            {/* Watch zone: 60-75 */}
            <path
              d={describeArc(cx, cy, radius + 11, -110 + 0.6 * totalAngle, -110 + 0.75 * totalAngle)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              opacity="0.55"
            />
            {/* Good zone: 75-90 */}
            <path
              d={describeArc(cx, cy, radius + 11, -110 + 0.75 * totalAngle, -110 + 0.9 * totalAngle)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.55"
            />
            {/* Excellent zone: 90-100 */}
            <path
              d={describeArc(cx, cy, radius + 11, -110 + 0.9 * totalAngle, 110)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              opacity="0.65"
            />

            {/* Active Progress Value Arc */}
            {safeScore > 0 && (
              <path
                d={valuePath}
                fill="none"
                stroke={statusColor}
                strokeWidth="14"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${statusColor}90)`
                }}
              />
            )}

            {/* Current Value Illuminated Indicator Tip */}
            {safeScore > 0 && (
              <g className="transition-all duration-700 ease-out">
                <circle
                  cx={tipCoord.x}
                  cy={tipCoord.y}
                  r="7"
                  fill={statusColor}
                  stroke="#0b0f17"
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 8px ${statusColor})` }}
                />
                <circle
                  cx={tipCoord.x}
                  cy={tipCoord.y}
                  r="2.5"
                  fill="#ffffff"
                />
              </g>
            )}

            {/* Scale Ticks & Labels */}
            {ticks.map((t) => {
              const pOuter = polarToCartesian(cx, cy, radius - 12, t.angle);
              const pLabel = polarToCartesian(cx, cy, radius - 24, t.angle);
              return (
                <g key={t.val}>
                  <circle cx={pOuter.x} cy={pOuter.y} r="2" fill="#64748b" />
                  <text
                    x={pLabel.x}
                    y={pLabel.y + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Central Score Readout Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center pointer-events-none">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              FLEET AVERAGE
            </span>
            <div
              className="text-4xl font-black font-mono-nums tracking-tight my-0.5"
              style={{ color: statusColor }}
            >
              {safeScore.toFixed(1)}
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">
              / 100 Index
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 -mt-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusBg}`}>
            {statusText} CONDITION
          </span>
        </div>
      </div>

      {/* Description & Fleet Distribution Side */}
      <div className="flex-1 space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            {desc} Indeks ini dihitung secara otomatis sebagai rata-rata dari seluruh skor kesehatan individu unit alat berat dan kendaraan yang aktif.
          </p>
        </div>

        {/* Multi-Tier Distribution Bar */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Distribusi Kesiapan Armada ({totalUnits} Unit):</span>
            <span className="font-mono-nums font-bold text-amber-400">
              Target Rata-rata ≥ 85.0
            </span>
          </div>

          {/* Progress Strip Segments */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {totalUnits > 0 && (
              <>
                <div
                  style={{ width: `${(excellentCount / totalUnits) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Excellent: ${excellentCount} unit`}
                />
                <div
                  style={{ width: `${(goodCount / totalUnits) * 100}%` }}
                  className="bg-sky-400 h-full"
                  title={`Good: ${goodCount} unit`}
                />
                <div
                  style={{ width: `${(watchCount / totalUnits) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Watch: ${watchCount} unit`}
                />
                <div
                  style={{ width: `${(criticalCount / totalUnits) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Critical: ${criticalCount} unit`}
                />
              </>
            )}
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">90-100:</span>
              <strong className="text-emerald-400 font-mono-nums">{excellentCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span className="text-slate-400">75-89:</span>
              <strong className="text-sky-400 font-mono-nums">{goodCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">60-74:</span>
              <strong className="text-amber-400 font-mono-nums">{watchCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">&lt;60:</span>
              <strong className="text-rose-400 font-mono-nums">{criticalCount}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
