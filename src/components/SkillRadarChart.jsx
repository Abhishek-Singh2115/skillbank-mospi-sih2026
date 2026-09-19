import React from 'react';

// --- REUSABLE RADAR CHART (SVG) ---
export default function SkillRadarChart({ currentScores, benchmarkScores, labels }) {
  const size = 340;
  const center = size / 2;
  const radius = 120;
  const totalAxes = labels.length;

  const getCoordinates = (value, index) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const currentPoints = currentScores.map((score, i) => {
    const { x, y } = getCoordinates(score, i);
    return `${x},${y}`;
  }).join(' ');

  const benchmarkPoints = benchmarkScores.map((score, i) => {
    const { x, y } = getCoordinates(score, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#E2E8F0"
              strokeDasharray={level < 1 ? "4 4" : "none"}
              strokeWidth="1.2"
            />
          ))}

          {labels.map((label, i) => {
            const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
            const lineX = center + radius * Math.cos(angle);
            const lineY = center + radius * Math.sin(angle);
            
            const labelRadius = radius + 28;
            const labelX = center + labelRadius * Math.cos(angle);
            const labelY = center + labelRadius * Math.sin(angle);

            return (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={lineX}
                  y2={lineY}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none font-sans"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Benchmark Polygon (Dashed Amber) */}
          <polygon
            points={benchmarkPoints}
            fill="rgba(245, 158, 11, 0.12)"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />

          {/* Current User Polygon (Solid Blue) */}
          <polygon
            points={currentPoints}
            fill="rgba(37, 99, 235, 0.25)"
            stroke="#2563EB"
            strokeWidth="3"
          />

          {currentScores.map((score, i) => {
            const { x, y } = getCoordinates(score, i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="#1E3A8A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-blue-600 inline-block shadow-sm"></span>
          <span>Your Current Level</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-dashed border-amber-500 bg-amber-100 inline-block"></span>
          <span>MoSPI / Industry Benchmark</span>
        </div>
      </div>
    </div>
  );
}
