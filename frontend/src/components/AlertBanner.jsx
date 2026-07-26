import RiverGauge, { SEVERITY_CONFIG } from "./RiverGauge";

export default function AlertBanner({ alert, onSimulate, simulating }) {
  if (!alert) {
    return (
      <div className="rounded-lg border border-line bg-white/60 p-5 flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-ink">No active alert yet</p>
          <p className="text-sm text-ink/60 mt-1">
            Issue a simulated gauge update to see the checklist come to life.
          </p>
        </div>
        <SimulateButton onClick={onSimulate} loading={simulating} label="Issue first alert" />
      </div>
    );
  }

  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.watch;

  return (
    <div
      className="rounded-lg border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={{ borderColor: cfg.color, backgroundColor: `${cfg.color}10` }}
    >
      <div className="flex items-center gap-4">
        <RiverGauge severity={alert.severity} levelMeters={alert.river_level_m} />
        <div>
          <p className="font-display text-lg text-ink">{alert.forecast_note}</p>
          <p className="text-xs text-ink/50 mt-1 font-mono">
            issued {new Date(alert.issued_at).toLocaleString()} · source: {alert.source}
          </p>
        </div>
      </div>
      <SimulateButton onClick={onSimulate} loading={simulating} label="Simulate next update" />
    </div>
  );
}

function SimulateButton({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="shrink-0 rounded-md bg-slate text-paper px-4 py-2 text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50"
    >
      {loading ? "Fetching gauge update…" : label}
    </button>
  );
}
