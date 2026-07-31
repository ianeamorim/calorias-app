import ProgressBar from "./ProgressBar";

type Totals = { kcal: number; protein: number; carb: number; fat: number };
type Goals = { kcal: number; protein: number; carb: number; fat: number };

export default function WeeklySummaryCard({
  totals,
  goals,
  count,
  daysElapsed,
  onEditGoals,
}: {
  totals: Totals;
  goals: Goals | null;
  count: number;
  daysElapsed: number;
  onEditGoals: () => void;
}) {
  if (!goals) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5 space-y-3 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Ainda não definiste uma meta semanal.
        </p>
        <button
          onClick={onEditGoals}
          className="rounded-lg bg-[var(--color-accent)] text-white px-4 py-2.5 text-sm font-medium"
        >
          Definir meta semanal
        </button>
      </div>
    );
  }

  const kcalOver = totals.kcal > goals.kcal;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
            Total da semana
          </p>
          <p
            className={`text-4xl font-bold ${
              kcalOver ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]"
            }`}
          >
            {Math.round(totals.kcal)}
            <span className="text-lg font-medium text-[var(--color-muted)]">
              {" "}
              / {goals.kcal} kcal
            </span>
          </p>
        </div>
        <button
          onClick={onEditGoals}
          className="text-xs font-medium text-[var(--color-accent)] shrink-0"
        >
          Editar meta
        </button>
      </div>

      {count === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Ainda não há refeições registadas nesta semana.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            <ProgressBar label="Proteína" value={totals.protein} goal={goals.protein} />
            <ProgressBar label="Hidratos" value={totals.carb} goal={goals.carb} />
            <ProgressBar label="Gordura" value={totals.fat} goal={goals.fat} />
          </div>

          {daysElapsed > 0 && (
            <div className="rounded-lg bg-[var(--color-bg)] px-3 py-2 space-y-1">
              <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
                Média diária ({daysElapsed} {daysElapsed === 1 ? "dia" : "dias"})
              </p>
              <p className="text-sm text-[var(--color-ink)]">
                {Math.round(totals.kcal / daysElapsed)} kcal · P{" "}
                {Math.round(totals.protein / daysElapsed)}g · H{" "}
                {Math.round(totals.carb / daysElapsed)}g · G{" "}
                {Math.round(totals.fat / daysElapsed)}g
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
