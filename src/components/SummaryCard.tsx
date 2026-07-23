import { Meal } from "@/lib/types";
import ProgressBar from "./ProgressBar";

export default function SummaryCard({
  meals,
  goals,
}: {
  meals: Meal[];
  goals: { kcal: number; protein: number; carb: number; fat: number };
}) {
  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carb: acc.carb + m.carb,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 }
  );

  const kcalOver = totals.kcal > goals.kcal;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
            Calorias
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
      </div>

      <div className="space-y-3">
        <ProgressBar label="Proteína" value={totals.protein} goal={goals.protein} />
        <ProgressBar label="Hidratos" value={totals.carb} goal={goals.carb} />
        <ProgressBar label="Gordura" value={totals.fat} goal={goals.fat} />
      </div>
    </div>
  );
}
