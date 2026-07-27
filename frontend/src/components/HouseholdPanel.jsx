import { useState } from "react";

const ELEVATION_LABELS = {
  riverbank: "Riverbank",
  low_lying: "Low-lying",
  mid_slope: "Mid-slope",
  high_ground: "High ground",
};

const EMPTY_FORM = {
  head_name: "",
  landmark_chain: "",
  elevation_band: "mid_slope",
  elderly_only: false,
  has_smartphone: true,
  mobility_limited: false,
  resident_count: 1,
};

export default function HouseholdPanel({ households, onCreate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreate(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-none bg-canvas border border-hairline flex flex-col h-full">
      <div className="flex items-center justify-between px-lg py-md border-b border-hairline">
        <h2 className="text-card-title font-normal text-ink">
          Households <span className="text-ink-subtle font-mono text-body-sm">({households.length})</span>
        </h2>
        <button onClick={() => setShowForm((s) => !s)} className="btn-ghost">
          {showForm ? "Cancel" : "+ Add household"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="px-lg py-md border-b border-hairline bg-surface-1 space-y-sm">
          <div className="grid grid-cols-2 gap-sm">
            <Field label="Head of household">
              <input
                required
                value={form.head_name}
                onChange={(e) => update("head_name", e.target.value)}
                className="input"
                placeholder="e.g. Meena Devi"
              />
            </Field>
            <Field label="Elevation">
              <select
                value={form.elevation_band}
                onChange={(e) => update("elevation_band", e.target.value)}
                className="input"
              >
                {Object.entries(ELEVATION_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Landmark chain (village / post office / nearest known point)">
            <input
              required
              value={form.landmark_chain}
              onChange={(e) => update("landmark_chain", e.target.value)}
              className="input"
              placeholder="e.g. near Shiv Mandir, behind the haat"
            />
          </Field>
          <div className="grid grid-cols-3 gap-sm">
            <Toggle
              label="Elderly-only"
              checked={form.elderly_only}
              onChange={(v) => update("elderly_only", v)}
            />
            <Toggle
              label="No smartphone"
              checked={!form.has_smartphone}
              onChange={(v) => update("has_smartphone", !v)}
            />
            <Toggle
              label="Limited mobility"
              checked={form.mobility_limited}
              onChange={(v) => update("mobility_limited", v)}
            />
          </div>
          <Field label="Residents">
            <input
              type="number"
              min={1}
              value={form.resident_count}
              onChange={(e) => update("resident_count", Number(e.target.value))}
              className="input w-24"
            />
          </Field>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save household"}
          </button>
        </form>
      )}

      <ul className="divide-y divide-hairline overflow-y-auto max-h-[480px]">
        {households.length === 0 && !showForm && (
          <li className="px-lg py-xl text-body-sm text-ink-muted text-center">
            No households mapped yet. Add the first one to start building this district's roster.
          </li>
        )}
        {households.map((h) => (
          <li key={h.id} className="px-lg py-sm flex items-start justify-between gap-sm">
            <div>
              <p className="text-body font-normal text-ink">{h.head_name}</p>
              <p className="text-body-sm text-ink-muted">{h.landmark_chain}</p>
              <div className="flex flex-wrap gap-xxs mt-xs">
                <span className="tag-neutral">{ELEVATION_LABELS[h.elevation_band]}</span>
                {h.elderly_only && <span className="tag-error">Elderly-only</span>}
                {!h.has_smartphone && <span className="tag-warning">No smartphone</span>}
                {h.mobility_limited && <span className="tag-error">Limited mobility</span>}
                <span className="tag-neutral">
                  {h.resident_count} resident{h.resident_count > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => onDelete(h.id)}
              className="text-caption text-ink-subtle hover:text-error shrink-0"
              title="Remove household"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-caption text-ink-muted mb-xxs">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-xs text-caption text-ink cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
      {label}
    </label>
  );
}
