"use client";

import { useCallback, useEffect, useState } from "react";
import { Meal, Template, ChatMessage } from "@/lib/types";
import { addDays, todayISO } from "@/lib/date";
import DayNav from "./DayNav";
import SummaryCard from "./SummaryCard";
import ChatBox from "./ChatBox";
import MealList from "./MealList";
import QuickAdd from "./QuickAdd";
import ManualAddForm from "./ManualAddForm";

type Goals = { kcal: number; protein: number; carb: number; fat: number };

export default function Dashboard({ goals }: { goals: Goals }) {
  const [date, setDate] = useState(todayISO());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDay = useCallback(async (d: string) => {
    const [mealsRes, chatRes] = await Promise.all([
      fetch(`/api/meals?date=${d}`).then((r) => r.json()),
      fetch(`/api/chat/history?date=${d}`).then((r) => r.json()),
    ]);
    setMeals(mealsRes.meals ?? []);
    setMessages(chatRes.messages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca de dados ao mudar de dia
    loadDay(date);
  }, [date, loadDay]);

  async function handleSendChat(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        date,
        role: "user",
        text,
        added_count: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, date }),
    });
    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        date,
        role: "assistant",
        text: data.reply ?? "Não consegui processar o pedido.",
        added_count: data.itemsAdded ?? 0,
        created_at: new Date().toISOString(),
      },
    ]);

    if (data.itemsAdded > 0) {
      await loadDay(date);
    }
  }

  async function handleDeleteMeal(id: number) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
  }

  async function handleQuickAdd(templateId: number, multiplier: number) {
    const res = await fetch(`/api/templates/${templateId}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, multiplier }),
    });
    const data = await res.json();
    if (data.meal) {
      setMeals((prev) => [...prev, data.meal]);
    }
  }

  async function handleManualAdd(item: {
    name: string;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
  }) {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...item }),
    });
    const data = await res.json();
    if (data.meal) {
      setMeals((prev) => [...prev, data.meal]);
    }
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-4 flex-1">
      <DayNav
        date={date}
        onPrev={() => {
          setLoading(true);
          setDate((d) => addDays(d, -1));
        }}
        onNext={() => {
          setLoading(true);
          setDate((d) => addDays(d, 1));
        }}
      />

      <SummaryCard meals={meals} goals={goals} />

      <ChatBox messages={messages} onSend={handleSendChat} />

      {loading ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-4">
          A carregar...
        </p>
      ) : (
        <MealList meals={meals} onDelete={handleDeleteMeal} />
      )}

      <QuickAdd templates={templates} onAdd={handleQuickAdd} />

      <ManualAddForm onAdd={handleManualAdd} />
    </div>
  );
}
