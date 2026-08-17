type ProgressRingProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressRing({ value, max, label }: ProgressRingProps) {
  const safeMax = Math.max(max, 1);
  const pct = Math.min(1, Math.max(0, value / safeMax));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="progress-ring-wrap" role="img" aria-label={label}>
      <svg className="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="progress-ring-track" cx="50" cy="50" r={radius} />
        <circle
          className="progress-ring-fill"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring-label">
        <strong>{value}</strong>
        <span>/{max}</span>
      </div>
    </div>
  );
}
