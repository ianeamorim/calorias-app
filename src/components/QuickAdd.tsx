"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Template, TemplateCategory } from "@/lib/types";

export default function QuickAdd({
  templates,
  onAdd,
}: {
  templates: Template[];
  onAdd: (templateId: number, multiplier: number) => void;
}) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/template-categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  function toggle(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
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
  ].filter((g) => g.items.length > 0);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wide">
          Adicionar rápido
        </h3>
        <Link
          href="/templates"
          className="text-xs text-[var(--color-accent)] font-medium"
        >
          Gerir
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Ainda não tens favoritos.{" "}
          <Link href="/templates" className="text-[var(--color-accent)] underline">
            Criar um
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isCollapsed = !!collapsed[group.key];
            return (
              <div key={group.key}>
                <button
                  onClick={() => toggle(group.key)}
                  className="w-full flex items-center justify-between py-1"
                  aria-expanded={!isCollapsed}
                >
                  <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                    {group.title} ({group.items.length})
                  </span>
                  <span
                    className={`text-[var(--color-muted)] transition-transform ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="space-y-2 mt-1">
                    {group.items.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                            {t.name}
                          </p>
                          <p className="text-xs text-[var(--color-muted)]">
                            {Math.round(t.kcal)} kcal
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => onAdd(t.id, 1)}
                            className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold active:scale-95 transition"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onAdd(t.id, 2)}
                            className="w-9 h-9 rounded-full bg-[var(--color-accent-dark)] text-white text-sm font-semibold active:scale-95 transition"
                          >
                            +2
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
