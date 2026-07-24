"use client";

import { useState } from "react";

type Goals = { kcal: number; protein: number; carb: number; fat: number };

export default function GoalsEditor({
  goals,
  onClose,
  onSaved,
}: {
  goals: Goals;
  onClose: () => void;
  onSaved: (goals: Goals) => void;
}) {
  const [protein, setProtein] = useState(String(goals.protein));
  const [carb, setCarb] = useState(String(goals.carb));
  const [fat, setFat] = useState(String(goals.fat));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const proteinNum = Number(protein) || 0;
  const carbNum = Number(carb) || 0;
  const fatNum = Number(fat) || 0;
  const kcal = proteinNum * 4 + carbNum * 4 + fatNum * 9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ protein: proteinNum, carb: carbNum, fat: fatNum }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Não foi possível guardar. Tenta novamente.");
      return;
    }

    const data = await res.json();
    onSaved(data.goals);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl shadow-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Editar meta diária
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-muted)]"
          >
            Cancelar
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Proteína (g)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Hidratos (g)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={carb}
              onChange={(e) => setCarb(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Gordura (g)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              required
            />
          </label>
        </div>

        <div className="rounded-lg bg-[var(--color-bg)] px-3 py-2 flex items-baseline justify-between">
          <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
            Calorias calculadas
          </span>
          <span className="text-lg font-bold text-[var(--color-ink)]">
            {Math.round(kcal)} kcal
          </span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[var(--color-accent)] text-white py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "A guardar..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
