import { formatWeekLabel, getWeekEnd } from "@/lib/date";

export default function WeekNav({
  weekStart,
  onPrev,
  onNext,
}: {
  weekStart: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const weekEnd = getWeekEnd(weekStart);

  return (
    <div className="flex items-center justify-between px-1">
      <button
        onClick={onPrev}
        aria-label="Semana anterior"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)] active:scale-95 transition"
      >
        ‹
      </button>
      <div className="text-center">
        <h2 className="text-lg font-semibold capitalize text-[var(--color-ink)]">
          {formatWeekLabel(weekStart)}
        </h2>
        <p className="text-xs text-[var(--color-muted)]">
          {weekStart.split("-").reverse().join("/")} – {weekEnd.split("-").reverse().join("/")}
        </p>
      </div>
      <button
        onClick={onNext}
        aria-label="Semana seguinte"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)] active:scale-95 transition"
      >
        ›
      </button>
    </div>
  );
}
