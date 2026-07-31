"use client";

import { useCallback, useEffect, useState } from "react";
import { addWeeks, daysElapsedInWeek, getWeekStart, todayISO } from "@/lib/date";
import WeekNav from "./WeekNav";
import WeeklySummaryCard from "./WeeklySummaryCard";
import GoalsEditor from "./GoalsEditor";

type Goals = { kcal: number; protein: number; carb: number; fat: number };
type Totals = { kcal: number; protein: number; carb: number; fat: number };

const EMPTY_TOTALS: Totals = { kcal: 0, protein: 0, carb: 0, fat: 0 };

export default function WeeklyView() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayISO()));
  const [totals, setTotals] = useState<Totals>(EMPTY_TOTALS);
  const [count, setCount] = useState(0);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingGoals, setEditingGoals] = useState(false);

  const loadWeek = useCallback(async (start: string) => {
    const res = await fetch(`/api/meals/week?start=${start}`).then((r) => r.json());
    setTotals(res.totals ?? EMPTY_TOTALS);
    setCount(res.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/weekly-goals")
      .then((r) => r.json())
      .then((data) => {
        setGoals(data.goals ?? null);
        setGoalsLoaded(true);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca de dados ao mudar de semana
    loadWeek(weekStart);
  }, [weekStart, loadWeek]);

  const daysElapsed = daysElapsedInWeek(weekStart, todayISO());

  return (
    <div className="space-y-4">
      <WeekNav
        weekStart={weekStart}
        onPrev={() => {
          setLoading(true);
          setWeekStart((w) => addWeeks(w, -1));
        }}
        onNext={() => {
          setLoading(true);
          setWeekStart((w) => addWeeks(w, 1));
        }}
      />

      {loading || !goalsLoaded ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-4">
          A carregar...
        </p>
      ) : (
        <WeeklySummaryCard
          totals={totals}
          goals={goals}
          count={count}
          daysElapsed={daysElapsed}
          onEditGoals={() => setEditingGoals(true)}
        />
      )}

      {editingGoals && (
        <GoalsEditor
          goals={goals}
          title="Editar meta semanal"
          endpoint="/api/weekly-goals"
          onClose={() => setEditingGoals(false)}
          onSaved={(g) => {
            setGoals(g);
            setEditingGoals(false);
          }}
        />
      )}
    </div>
  );
}
