export default function ChecklistPanel({ items, progress, onMark, onRegenerate, regenerating }) {
  return (
    <div className="rounded-lg border border-line bg-white/60 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base">Door-to-door checklist</h2>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-sm font-medium text-teal hover:underline disabled:opacity-50"
          >
            {regenerating ? "Ranking…" : "Rebuild ranking"}
          </button>
        </div>
        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-ink/60 mb-1">
              <span>
                {progress.warned + progress.unreachable}/{progress.total} reached
              </span>
              <span>{progress.percent_complete}%</span>
            </div>
            <div className="h-2 rounded-full bg-line overflow-hidden">
              <div
                className="h-full bg-teal transition-all duration-500"
                style={{ width: `${progress.percent_complete}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <ol className="divide-y divide-line overflow-y-auto max-h-[480px]">
        {items.length === 0 && (
          <li className="px-5 py-8 text-sm text-ink/50 text-center">
            No checklist yet for this alert. Add households, then rebuild the ranking.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className={`px-5 py-3 flex items-start justify-between gap-3 ${
              item.status !== "pending" ? "opacity-50" : ""
            }`}
          >
            <div>
              <p className="text-sm">
                <span className="font-mono text-ink/40 mr-2">#{item.rank}</span>
                <span className="font-medium">{item.household.head_name}</span>
              </p>
              <p className="text-xs text-ink/60 mt-0.5">{item.household.landmark_chain}</p>
              <p className="text-xs text-ink/50 mt-0.5 italic">{item.reason}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-mono text-[11px] text-ink/40">
                score {item.priority_score}
              </span>
              {item.status === "pending" ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onMark(item.id, "warned")}
                    className="text-xs px-2 py-1 rounded bg-teal text-paper hover:opacity-90"
                  >
                    Warned
                  </button>
                  <button
                    onClick={() => onMark(item.id, "unreachable")}
                    className="text-xs px-2 py-1 rounded bg-ink/10 text-ink hover:bg-ink/20"
                  >
                    Unreachable
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onMark(item.id, "pending")}
                  className="text-xs px-2 py-1 rounded border border-line hover:bg-white"
                >
                  {item.status === "warned" ? "✓ Warned — undo" : "✕ Unreachable — undo"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
