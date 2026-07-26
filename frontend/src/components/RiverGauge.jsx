const SEVERITY_CONFIG = {
  watch: { fill: 0.28, color: "#5B7A93", label: "Watch" },
  moderate: { fill: 0.52, color: "#D98E32", label: "Moderate" },
  severe: { fill: 0.78, color: "#B23A2E", label: "Severe" },
  extreme: { fill: 1.0, color: "#7A1E15", label: "Extreme" },
};

// A small vertical gauge, styled after the physical staff gauges used at
// river-monitoring stations, that fills according to alert severity. This is
// the app's one deliberate visual flourish: everything else stays quiet so
// this reads clearly as "how high has the water risen."
export default function RiverGauge({ severity, levelMeters }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.watch;
  const trackHeight = 64;
  const fillHeight = Math.max(6, trackHeight * cfg.fill);

  return (
    <div className="flex items-center gap-3">
      <svg width="22" height={trackHeight + 12} viewBox={`0 0 22 ${trackHeight + 12}`} aria-hidden="true">
        <rect x="8" y="0" width="6" height={trackHeight} rx="3" fill="#DBD4C1" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="2" y={(trackHeight / 4) * i} width="4" height="1.5" fill="#B7AF95" />
        ))}
        <rect
          x="8"
          y={trackHeight - fillHeight}
          width="6"
          height={fillHeight}
          rx="3"
          fill={cfg.color}
          style={{ transition: "height 700ms ease, y 700ms ease" }}
        />
        <circle cx="11" cy={trackHeight - fillHeight} r="4.5" fill={cfg.color} />
      </svg>
      <div className="leading-tight">
        <div className="font-mono text-xs uppercase tracking-wider" style={{ color: cfg.color }}>
          {cfg.label}
        </div>
        <div className="font-mono text-[11px] text-ink/60">{levelMeters?.toFixed(2)} m</div>
      </div>
    </div>
  );
}

export { SEVERITY_CONFIG };
