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
    <div className="flex items-center gap-2">
      <select
        value={activeId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-transparent border border-paper/30 text-paper rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:border-amber"
      >
        {districts.map((d) => (
          <option key={d.id} value={d.id} className="text-ink">
            {d.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setAdding((a) => !a)}
        className="text-xs text-paper/70 hover:text-paper underline"
      >
        {adding ? "cancel" : "+ new area"}
      </button>

      {adding && (
        <form
          onSubmit={submit}
          className="absolute top-14 left-4 z-10 bg-white border border-line rounded-lg shadow-lg p-4 flex flex-col gap-2 w-72"
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
          <button type="submit" className="rounded-md bg-slate text-paper px-3 py-1.5 text-sm">
            Add area
          </button>
        </form>
      )}
    </div>
  );
}
