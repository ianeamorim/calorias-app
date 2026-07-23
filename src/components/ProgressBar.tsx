export default function ProgressBar({
  label,
  value,
  goal,
  unit = "g",
}: {
  label: string;
  value: number;
  goal: number;
  unit?: string;
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const over = value > goal;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
          {label}
        </span>
        <span
          className={`text-xs font-semibold ${
            over ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]"
          }`}
        >
          {Math.round(value)}
          {unit} / {goal}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            over ? "bg-[var(--color-danger)]" : "bg-[var(--color-accent)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
