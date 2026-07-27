// Carbon reserves IBM Blue for links/CTAs and uses green/yellow/red for
// semantic status - so the gauge maps directly onto DESIGN.md's semantic
// tokens rather than a custom palette. Severe and extreme share the same
// error red (Carbon documents no fifth "more severe than error" token);
// they're told apart by fill height and by AlertBanner's stronger border
// treatment at extreme, not by inventing an off-system color.
const SEVERITY_CONFIG = {
  watch: { fill: 0.28, color: "#0f62fe", label: "Watch" },
  moderate: { fill: 0.52, color: "#f1c21b", label: "Moderate" },
  severe: { fill: 0.78, color: "#da1e28", label: "Severe" },
  extreme: { fill: 1.0, color: "#da1e28", label: "Extreme" },
};

export default function RiverGauge({ severity, levelMeters }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.watch;
  const trackHeight = 64;
  const fillHeight = Math.max(6, trackHeight * cfg.fill);

  return (
    <div className="flex items-center gap-sm">
      <svg width="18" height={trackHeight + 12} viewBox={`0 0 18 ${trackHeight + 12}`} aria-hidden="true">
        {/* Flat-square track, no rounding - the gauge itself stays a rectangle */}
        <rect x="6" y="0" width="6" height={trackHeight} fill="#e0e0e0" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="1" y={(trackHeight / 4) * i} width="4" height="1" fill="#8c8c8c" />
        ))}
        <rect
          x="6"
          y={trackHeight - fillHeight}
          width="6"
          height={fillHeight}
          fill={cfg.color}
          style={{ transition: "height 700ms ease, y 700ms ease" }}
        />
      </svg>
      <div className="leading-tight">
        <div className="text-caption font-normal" style={{ color: cfg.color }}>
          {cfg.label}
        </div>
        <div className="font-mono text-caption text-ink-subtle">{levelMeters?.toFixed(2)} m</div>
      </div>
    </div>
  );
}

export { SEVERITY_CONFIG };
