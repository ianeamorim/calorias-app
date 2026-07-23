"use client";

import { useState } from "react";

export default function ManualAddForm({
  onAdd,
}: {
  onAdd: (data: {
    name: string;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !kcal) return;
    setSubmitting(true);
    await onAdd({
      name,
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carb: Number(carb) || 0,
      fat: Number(fat) || 0,
    });
    setSubmitting(false);
    setName("");
    setKcal("");
    setProtein("");
    setCarb("");
    setFat("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-sm font-medium text-[var(--color-accent)] py-3 rounded-2xl border border-dashed border-[var(--color-accent)]"
      >
        + Adicionar manualmente
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wide">
          Adicionar manualmente
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-muted)]"
        >
          Cancelar
        </button>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do alimento"
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        required
      />
      <div className="grid grid-cols-4 gap-2">
        <input
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          placeholder="Kcal"
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
          required
        />
        <input
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="Prot."
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
        <input
          value={carb}
          onChange={(e) => setCarb(e.target.value)}
          placeholder="Hidr."
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
        <input
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="Gord."
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--color-accent)] text-white py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? "A adicionar..." : "Adicionar"}
      </button>
    </form>
  );
}
