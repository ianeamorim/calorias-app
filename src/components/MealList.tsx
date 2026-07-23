import { Meal } from "@/lib/types";

export default function MealList({
  meals,
  onDelete,
}: {
  meals: Meal[];
  onDelete: (id: number) => void;
}) {
  if (meals.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5">
        <p className="text-sm text-[var(--color-muted)]">
          Ainda não há refeições registadas neste dia.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm divide-y divide-[var(--color-border)]">
      {meals.map((meal) => (
        <div key={meal.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-ink)] truncate">
              {meal.name}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {Math.round(meal.kcal)} kcal · P {Math.round(meal.protein)}g · H{" "}
              {Math.round(meal.carb)}g · G {Math.round(meal.fat)}g
            </p>
          </div>
          <button
            onClick={() => onDelete(meal.id)}
            aria-label={`Apagar ${meal.name}`}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-danger)] hover:bg-red-50 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
