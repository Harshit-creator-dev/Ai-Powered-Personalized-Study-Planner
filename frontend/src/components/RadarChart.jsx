import React from 'react';

export const RadarChart = ({ metrics = [], size = 320 }) => {
  if (!metrics || metrics.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No metric data to display.</div>;
  }

  const center = size / 2;
  const radius = (size / 2) - 48;
  const total = metrics.length;
  const angleStep = (Math.PI * 2) / total;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Calculate polygon points from actual metric scores (0-100)
  const dataPoints = metrics.map((m, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const valueRatio = Math.max(0, Math.min(100, m.score)) / 100;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (radius + 24) * Math.cos(angle),
      labelY: center + (radius + 24) * Math.sin(angle),
      score: m.score,
      name: m.name || m.rule,
    };
  });

  const polygonPath = dataPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grid Rings */}
        {levels.map((lvl, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * lvl}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={lvl < 1.0 ? '3 3' : 'none'}
          />
        ))}

        {/* Axis Spokes */}
        {metrics.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Evaluated Data Polygon with Gradient & Glow */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#4f46e5"
          strokeWidth="2.5"
        />

        {/* Data Points circles */}
        {dataPoints.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Labels */}
        {dataPoints.map((p, i) => {
          // Shorten labels for clean display
          const shortName = p.name.split(' ')[0];
          return (
            <text
              key={i}
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="600"
              fill="#475569"
            >
              {shortName} ({p.score}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};
