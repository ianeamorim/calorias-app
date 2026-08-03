"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Template, TemplateCategory } from "@/lib/types";

type FormState = {
  name: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
  categoryValue: string; // "" = sem categoria, "new" = criar nova, ou o id em string
};

const EMPTY_FORM: FormState = {
  name: "",
  kcal: "",
  protein: "",
  carb: "",
  fat: "",
  categoryValue: "",
};

function templateToForm(t: Template): FormState {
  return {
    name: t.name,
    kcal: String(t.kcal),
    protein: String(t.protein),
    carb: String(t.carb),
    fat: String(t.fat),
    categoryValue: t.category_id != null ? String(t.category_id) : "",
  };
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryDraftName, setCategoryDraftName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryRenameDraft, setCategoryRenameDraft] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/template-categories").then((r) => r.json()),
    ]).then(([tData, cData]) => {
      setTemplates(tData.templates ?? []);
      setCategories(cData.categories ?? []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  function startEdit(t: Template) {
    setEditingId(t.id);
    setForm(templateToForm(t));
    setNewCategoryName("");
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_FORM);
    setNewCategoryName("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNewCategoryName("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.kcal) return;
    setSaving(true);

    let categoryId: number | null = null;
    if (form.categoryValue === "new") {
      if (!newCategoryName.trim()) {
        setSaving(false);
        return;
      }
      const res = await fetch("/api/template-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      categoryId = data.category.id;
    } else if (form.categoryValue !== "") {
      categoryId = Number(form.categoryValue);
    }

    const payload = {
      name: form.name,
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carb: Number(form.carb) || 0,
      fat: Number(form.fat) || 0,
      category_id: categoryId,
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

  async function handleMoveTemplate(id: number, direction: "up" | "down") {
    await fetch(`/api/templates/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    load();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryDraftName.trim()) return;
    setSavingCategory(true);
    await fetch("/api/template-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryDraftName.trim() }),
    });
    setSavingCategory(false);
    setCategoryDraftName("");
    setAddingCategory(false);
    load();
  }

  function startEditCategory(c: TemplateCategory) {
    setEditingCategoryId(c.id);
    setCategoryRenameDraft(c.name);
  }

  async function handleRenameCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryRenameDraft.trim() || editingCategoryId == null) return;
    setSavingCategory(true);
    await fetch(`/api/template-categories/${editingCategoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryRenameDraft.trim() }),
    });
    setSavingCategory(false);
    setEditingCategoryId(null);
    load();
  }

  async function handleDeleteCategory(id: number) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/template-categories/${id}`, { method: "DELETE" });
    load();
  }

  async function handleMoveCategory(id: number, direction: "up" | "down") {
    await fetch(`/api/template-categories/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    load();
  }

  const groups = [
    ...categories.map((c) => ({
      key: `cat-${c.id}`,
      title: c.name,
      items: templates.filter((t) => t.category_id === c.id),
    })),
    {
      key: "none",
      title: "Sem categoria",
      items: templates.filter((t) => t.category_id == null),
    },
  ];

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-6 flex-1">
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
        <>
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Categorias
            </h2>

            {categories.length > 0 && (
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm divide-y divide-[var(--color-border)]">
                {categories.map((c, idx) =>
                  editingCategoryId === c.id ? (
                    <form
                      key={c.id}
                      onSubmit={handleRenameCategory}
                      className="flex items-center gap-2 p-3"
                    >
                      <input
                        value={categoryRenameDraft}
                        onChange={(e) => setCategoryRenameDraft(e.target.value)}
                        autoFocus
                        className="flex-1 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={savingCategory}
                        className="text-sm text-[var(--color-accent)] font-medium shrink-0"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="text-sm text-[var(--color-muted)] shrink-0"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <div key={c.id} className="flex items-center gap-2 p-3">
                      <div className="flex flex-col shrink-0">
                        <button
                          onClick={() => handleMoveCategory(c.id, "up")}
                          disabled={idx === 0}
                          aria-label={`Mover ${c.name} para cima`}
                          className="leading-none px-1 text-[var(--color-muted)] disabled:opacity-25"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveCategory(c.id, "down")}
                          disabled={idx === categories.length - 1}
                          aria-label={`Mover ${c.name} para baixo`}
                          className="leading-none px-1 text-[var(--color-muted)] disabled:opacity-25"
                        >
                          ▼
                        </button>
                      </div>
                      <p className="flex-1 min-w-0 text-sm font-medium text-[var(--color-ink)] truncate">
                        {c.name}
                      </p>
                      <button
                        onClick={() => startEditCategory(c)}
                        className="text-xs text-[var(--color-accent)] font-medium shrink-0"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="text-xs text-[var(--color-danger)] font-medium shrink-0"
                      >
                        Apagar
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {addingCategory ? (
              <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                <input
                  value={categoryDraftName}
                  onChange={(e) => setCategoryDraftName(e.target.value)}
                  placeholder="Nome da categoria"
                  autoFocus
                  className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="rounded-lg bg-[var(--color-accent)] text-white px-3 py-2 text-sm font-medium shrink-0"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingCategory(false);
                    setCategoryDraftName("");
                  }}
                  className="text-sm text-[var(--color-muted)] shrink-0"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <button
                onClick={() => setAddingCategory(true)}
                className="w-full text-center text-sm font-medium text-[var(--color-accent)] py-2.5 rounded-xl border border-dashed border-[var(--color-accent)]"
              >
                + Nova categoria
              </button>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Refeições favoritas
            </h2>

            {groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.key} className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--color-ink)] px-1">
                      {group.title}
                    </h3>
                    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm divide-y divide-[var(--color-border)]">
                      {group.items.map((t, idx) =>
                        editingId === t.id ? (
                          <TemplateForm
                            key={t.id}
                            form={form}
                            setForm={setForm}
                            categories={categories}
                            newCategoryName={newCategoryName}
                            setNewCategoryName={setNewCategoryName}
                            onSubmit={handleSave}
                            onCancel={cancelEdit}
                            saving={saving}
                          />
                        ) : (
                          <div key={t.id} className="flex items-center gap-2 p-4">
                            <div className="flex flex-col shrink-0">
                              <button
                                onClick={() => handleMoveTemplate(t.id, "up")}
                                disabled={idx === 0}
                                aria-label={`Mover ${t.name} para cima`}
                                className="leading-none px-1 text-[var(--color-muted)] disabled:opacity-25"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveTemplate(t.id, "down")}
                                disabled={idx === group.items.length - 1}
                                aria-label={`Mover ${t.name} para baixo`}
                                className="leading-none px-1 text-[var(--color-muted)] disabled:opacity-25"
                              >
                                ▼
                              </button>
                            </div>
                            <div className="min-w-0 flex-1">
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
                  </div>
                )
            )}

            {editingId === "new" ? (
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm">
                <TemplateForm
                  form={form}
                  setForm={setForm}
                  categories={categories}
                  newCategoryName={newCategoryName}
                  setNewCategoryName={setNewCategoryName}
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
          </section>
        </>
      )}
    </div>
  );
}

function TemplateForm({
  form,
  setForm,
  categories,
  newCategoryName,
  setNewCategoryName,
  onSubmit,
  onCancel,
  saving,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  categories: TemplateCategory[];
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
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

      <div>
        <select
          value={form.categoryValue}
          onChange={(e) => setForm({ ...form, categoryValue: e.target.value })}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
          <option value="new">+ Nova categoria...</option>
        </select>
        {form.categoryValue === "new" && (
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da nova categoria"
            autoFocus
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
            required
          />
        )}
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
