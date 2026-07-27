export default function ChecklistPanel({ items, progress, onMark, onRegenerate, regenerating }) {
  const isComplete = progress && progress.percent_complete === 100;

  return (
    <div className="rounded-none bg-canvas border border-hairline flex flex-col h-full">
      <div className="px-lg py-md border-b border-hairline">
        <div className="flex items-center justify-between">
          <h2 className="text-card-title font-normal text-ink">Door-to-door checklist</h2>
          <button onClick={onRegenerate} disabled={regenerating} className="btn-ghost">
            {regenerating ? "Ranking…" : "Rebuild ranking"}
          </button>
        </div>
        {progress && (
          <div className="mt-sm">
            <div className="flex items-center justify-between font-mono text-caption text-ink-muted mb-xxs">
              <span>
                {progress.warned + progress.unreachable}/{progress.total} reached
              </span>
              <span>{progress.percent_complete}%</span>
            </div>
            <div className="h-1 bg-surface-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isComplete ? "bg-success" : "bg-primary"}`}
                style={{ width: `${progress.percent_complete}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <ol className="divide-y divide-hairline overflow-y-auto max-h-[480px]">
        {items.length === 0 && (
          <li className="px-lg py-xl text-body-sm text-ink-muted text-center">
            No checklist yet for this alert. Add households, then rebuild the ranking.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className={`px-lg py-sm flex items-start justify-between gap-sm ${
              item.status !== "pending" ? "opacity-50" : ""
            }`}
          >
            <div>
              <p className="text-body text-ink">
                <span className="font-mono text-ink-subtle mr-xs">#{item.rank}</span>
                <span className="font-normal">{item.household.head_name}</span>
              </p>
              <p className="text-body-sm text-ink-muted mt-xxs">{item.household.landmark_chain}</p>
              <p className="text-body-sm text-ink-subtle mt-xxs">{item.reason}</p>
            </div>
            <div className="flex flex-col items-end gap-xs shrink-0">
              <span className="font-mono text-caption text-ink-subtle">
                score {item.priority_score}
              </span>
              {item.status === "pending" ? (
                <div className="flex gap-xs">
                  <button onClick={() => onMark(item.id, "warned")} className="btn-tag-success">
                    Warned
                  </button>
                  <button onClick={() => onMark(item.id, "unreachable")} className="btn-tag-neutral">
                    Unreachable
                  </button>
                </div>
              ) : (
                <button onClick={() => onMark(item.id, "pending")} className="btn-tag-neutral">
                  {item.status === "warned" ? "Warned (undo)" : "Unreachable (undo)"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
