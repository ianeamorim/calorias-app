"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/types";

export default function ChatBox({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await onSend(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wide">
          Regista o que comeste
        </h3>
      </div>

      <div ref={scrollRef} className="max-h-80 overflow-y-auto px-5 space-y-3 py-2">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--color-muted)] py-4">
            Escreve algo como &ldquo;comi 190g de peito de frango grelhado e uma
            banana&rdquo;.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-ink)]"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-muted)]">
              A pensar...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t border-[var(--color-border)]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="O que comeste?"
          className="flex-1 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-[var(--color-accent)] text-white px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
