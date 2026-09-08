import React from 'react';

/**
 * ComplianceTrendChart Component
 * Renders class average handwashing score trend graph.
 */
export function ComplianceTrendChart({ data = [] }) {
  const defaultData = [
    { day: 'Mon', avgScore: 72 },
    { day: 'Tue', avgScore: 78 },
    { day: 'Wed', avgScore: 84 },
    { day: 'Thu', avgScore: 81 },
    { day: 'Fri', avgScore: 89 },
    { day: 'Sat', avgScore: 92 },
    { day: 'Sun', avgScore: 95 }
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const width = 600;
  const height = 220;
  const padding = 40;

  const maxScore = 100;
  const minScore = 50;

  // Calculate SVG line path points
  const points = chartData.map((d, index) => {
    const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.avgScore - minScore) / (maxScore - minScore)) * (height - padding * 2);
    return { x, y, score: d.avgScore, day: d.day };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.4)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>Class Compliance Trend</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Weekly Class Average Score</p>
        </div>
        <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
          ↗ +18% Improvement
        </span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
          {/* Background grid lines */}
          {[60, 80, 100].map(val => {
            const y = height - padding - ((val - minScore) / (maxScore - minScore)) * (height - padding * 2);
            return (
              <g key={val}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Gradient fill under line */}
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#scoreGradient)"
          />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
              <text x={p.x} y={height - padding + 18} fill="#94a3b8" fontSize="11" textAnchor="middle">{p.day}</text>
              <text x={p.x} y={p.y - 10} fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">{p.score}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
