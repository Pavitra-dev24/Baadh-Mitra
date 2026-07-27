import RiverGauge, { SEVERITY_CONFIG } from "./RiverGauge";

export default function AlertBanner({ alert, onSimulate, simulating }) {
  if (!alert) {
    return (
      <div className="rounded-none bg-canvas border border-hairline p-lg flex items-center justify-between gap-md">
        <div>
          <p className="text-card-title font-normal text-ink">No active alert yet</p>
          <p className="text-body-sm text-ink-muted mt-xxs">
            Issue a simulated gauge update to see the checklist come to life.
          </p>
        </div>
        <button onClick={onSimulate} disabled={simulating} className="btn-primary shrink-0">
          {simulating ? "Fetching gauge update…" : "Issue first alert"}
        </button>
      </div>
    );
  }

  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.watch;
  const isExtreme = alert.severity === "extreme";

  return (
    <div
      className="rounded-none bg-canvas border border-hairline p-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md"
      style={{
        borderLeft: `4px solid ${cfg.color}`,
        // Extreme gets Carbon's "hairline-strong" outer ring layered on top of
        // the severity color, rather than a new off-system color, to read as
        // more urgent than "severe" without breaking the one-accent-plus-
        // semantics rule.
        outline: isExtreme ? "2px solid #161616" : "none",
        outlineOffset: isExtreme ? "-2px" : "0",
      }}
    >
      <div className="flex items-center gap-md">
        <RiverGauge severity={alert.severity} levelMeters={alert.river_level_m} />
        <div>
          <p className={`text-body text-ink ${isExtreme ? "font-semibold" : "font-normal"}`}>
            {alert.forecast_note}
          </p>
          <p className="text-caption text-ink-subtle mt-xxs font-mono">
            issued {new Date(alert.issued_at).toLocaleString()} · source: {alert.source}
          </p>
        </div>
      </div>
      <button onClick={onSimulate} disabled={simulating} className="btn-tertiary shrink-0">
        {simulating ? "Fetching gauge update…" : "Simulate next update"}
      </button>
    </div>
  );
}
