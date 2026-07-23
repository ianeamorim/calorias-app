import Link from "next/link";
import { Template } from "@/lib/types";

export default function QuickAdd({
  templates,
  onAdd,
}: {
  templates: Template[];
  onAdd: (templateId: number, multiplier: number) => void;
}) {
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
        <div className="space-y-2">
          {templates.map((t) => (
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
}
