export default function ScoreHistoryChart({ history }) {
  const width = 100;
  const height = 100;
  const padding = 8;

  if (history.length < 2) {
    return (
      <div className="score-chart-empty">
        <p>Trigger a threat or remediate a finding to see your score change over time.</p>
      </div>
    );
  }

  const scores = history.map((h) => h.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const range = max - min || 1;

  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - padding * 2);
    const y = height - padding - ((h.score - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const latest = scores[scores.length - 1];
  const previous = scores[scores.length - 2];
  const trend = latest - previous;
  const trendColor = trend > 0 ? 'var(--status-healthy)' : trend < 0 ? 'var(--status-critical)' : 'var(--text-muted)';

  return (
    <div className="score-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="score-chart-svg" preserveAspectRatio="none">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => {
          const [x, y] = p.split(',');
          return <circle key={i} cx={x} cy={y} r="1.6" fill="var(--accent-cyan)" />;
        })}
      </svg>
      <div className="score-chart-trend" style={{ color: trendColor }}>
        {trend > 0 ? '▲' : trend < 0 ? '▼' : '—'} {Math.abs(trend)}% since last change
      </div>
    </div>
  );
}