import { formatDisplayDate } from "@/lib/date";

export default function DayNav({
  date,
  onPrev,
  onNext,
}: {
  date: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <button
        onClick={onPrev}
        aria-label="Dia anterior"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)] active:scale-95 transition"
      >
        ‹
      </button>
      <h2 className="text-lg font-semibold capitalize text-[var(--color-ink)]">
        {formatDisplayDate(date)}
      </h2>
      <button
        onClick={onNext}
        aria-label="Dia seguinte"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)] active:scale-95 transition"
      >
        ›
      </button>
    </div>
  );
}
