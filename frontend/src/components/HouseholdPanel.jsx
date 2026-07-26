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
    <div className="rounded-lg border border-line bg-white/60 flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h2 className="font-display text-base">
          Households <span className="text-ink/40 font-mono text-sm">({households.length})</span>
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm font-medium text-teal hover:underline"
        >
          {showForm ? "Cancel" : "+ Add household"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="px-5 py-4 border-b border-line bg-paper/60 space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-3 gap-3">
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
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-teal text-paper px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save household"}
          </button>
        </form>
      )}

      <ul className="divide-y divide-line overflow-y-auto max-h-[480px]">
        {households.length === 0 && !showForm && (
          <li className="px-5 py-8 text-sm text-ink/50 text-center">
            No households mapped yet. Add the first one to start building this district's roster.
          </li>
        )}
        {households.map((h) => (
          <li key={h.id} className="px-5 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm">{h.head_name}</p>
              <p className="text-xs text-ink/60">{h.landmark_chain}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Tag>{ELEVATION_LABELS[h.elevation_band]}</Tag>
                {h.elderly_only && <Tag tone="brick">Elderly-only</Tag>}
                {!h.has_smartphone && <Tag tone="amber">No smartphone</Tag>}
                {h.mobility_limited && <Tag tone="brick">Limited mobility</Tag>}
                <Tag>{h.resident_count} resident{h.resident_count > 1 ? "s" : ""}</Tag>
              </div>
            </div>
            <button
              onClick={() => onDelete(h.id)}
              className="text-xs text-ink/40 hover:text-brick shrink-0"
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
      <span className="block text-xs font-medium text-ink/60 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-teal"
      />
      {label}
    </label>
  );
}

function Tag({ children, tone }) {
  const toneClasses = {
    brick: "bg-brick/10 text-brick border-brick/30",
    amber: "bg-amber/10 text-amber border-amber/30",
  };
  return (
    <span
      className={`text-[11px] px-1.5 py-0.5 rounded border ${
        toneClasses[tone] || "bg-ink/5 text-ink/60 border-ink/10"
      }`}
    >
      {children}
    </span>
  );
}
