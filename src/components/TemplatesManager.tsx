"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Template } from "@/lib/types";

type FormState = {
  name: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
};

const EMPTY_FORM: FormState = { name: "", kcal: "", protein: "", carb: "", fat: "" };

function templateToForm(t: Template): FormState {
  return {
    name: t.name,
    kcal: String(t.kcal),
    protein: String(t.protein),
    carb: String(t.carb),
    fat: String(t.fat),
  };
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(t: Template) {
    setEditingId(t.id);
    setForm(templateToForm(t));
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_FORM);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.kcal) return;
    setSaving(true);

    const payload = {
      name: form.name,
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carb: Number(form.carb) || 0,
      fat: Number(form.fat) || 0,
    };

    if (editingId === "new") {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else if (editingId != null) {
      await fetch(`/api/templates/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    cancelEdit();
    load();
  }

  async function handleDelete(id: number) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-4 flex-1">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[var(--color-accent)] font-medium">
          ‹ Voltar
        </Link>
        <h1 className="text-lg font-semibold text-[var(--color-ink)]">
          Refeições favoritas
        </h1>
        <div className="w-12" />
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-6">
          A carregar...
        </p>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm divide-y divide-[var(--color-border)]">
          {templates.map((t) =>
            editingId === t.id ? (
              <TemplateForm
                key={t.id}
                form={form}
                setForm={setForm}
                onSubmit={handleSave}
                onCancel={cancelEdit}
                saving={saving}
              />
            ) : (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {Math.round(t.kcal)} kcal · P {t.protein}g · H {t.carb}g · G{" "}
                    {t.fat}g
                  </p>
                </div>
                <div className="flex gap-3 shrink-0 text-sm">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-[var(--color-accent)] font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-[var(--color-danger)] font-medium"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {editingId === "new" ? (
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm">
          <TemplateForm
            form={form}
            setForm={setForm}
            onSubmit={handleSave}
            onCancel={cancelEdit}
            saving={saving}
          />
        </div>
      ) : (
        <button
          onClick={startNew}
          className="w-full text-center text-sm font-medium text-[var(--color-accent)] py-3 rounded-2xl border border-dashed border-[var(--color-accent)]"
        >
          + Nova refeição favorita
        </button>
      )}
    </div>
  );
}

function TemplateForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="p-4 space-y-3">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nome"
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        required
      />
      <div className="grid grid-cols-4 gap-2">
        <input
          value={form.kcal}
          onChange={(e) => setForm({ ...form, kcal: e.target.value })}
          placeholder="Kcal"
          type="number"
          inputMode="decimal"
          className="rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
          required
        />
        <input
          value={form.protein}
          onChange={(e) => setForm({ ...form, protein: e.target.value })}
          placeholder="Prot."
          type="number"
          inputMode="decimal"
          className="rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
        <input
          value={form.carb}
          onChange={(e) => setForm({ ...form, carb: e.target.value })}
          placeholder="Hidr."
          type="number"
          inputMode="decimal"
          className="rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
        <input
          value={form.fat}
          onChange={(e) => setForm({ ...form, fat: e.target.value })}
          placeholder="Gord."
          type="number"
          inputMode="decimal"
          className="rounded-lg border border-[var(--color-border)] px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-[var(--color-accent)] text-white py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "A guardar..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
