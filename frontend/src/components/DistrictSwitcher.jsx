import { useState } from "react";

export default function DistrictSwitcher({ districts, activeId, onSelect, onCreate }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", river: "", state: "" });

  const submit = async (e) => {
    e.preventDefault();
    await onCreate(form);
    setForm({ name: "", river: "", state: "" });
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-sm">
      <select
        value={activeId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-none bg-transparent border border-inverse-ink-muted/40 text-inverse-ink
                   text-body-sm px-sm py-xs focus:outline-none focus:border-primary"
      >
        {districts.map((d) => (
          <option key={d.id} value={d.id} className="text-ink">
            {d.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setAdding((a) => !a)}
        className="text-caption text-inverse-ink-muted hover:text-inverse-ink"
      >
        {adding ? "cancel" : "+ new area"}
      </button>

      {adding && (
        <form
          onSubmit={submit}
          className="absolute top-14 left-4 z-10 bg-canvas border border-hairline p-md flex flex-col gap-sm w-72"
        >
          <input
            required
            placeholder="Area name (e.g. Ghongha Char, Ward 4)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="River"
            value={form.river}
            onChange={(e) => setForm((f) => ({ ...f, river: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="input"
          />
          <button type="submit" className="btn-primary">
            Add area
          </button>
        </form>
      )}
    </div>
  );
}
