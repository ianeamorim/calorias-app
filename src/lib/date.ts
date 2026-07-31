export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = todayISO();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (isoDate === today) return "Hoje";
  if (isoDate === yesterday) return "Ontem";
  if (isoDate === tomorrow) return "Amanhã";

  return date.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getWeekStart(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 = domingo, 1 = segunda, ... 6 = sábado
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

export function getWeekEnd(weekStartISO: string): string {
  return addDays(weekStartISO, 6);
}

export function addWeeks(weekStartISO: string, weeks: number): string {
  return addDays(weekStartISO, weeks * 7);
}

/** Dias já decorridos na semana (1-indexado), capado a 7. 0 se a semana ainda não começou. */
export function daysElapsedInWeek(weekStartISO: string, todayISODate: string): number {
  const [ys, ms, ds] = weekStartISO.split("-").map(Number);
  const [yt, mt, dt] = todayISODate.split("-").map(Number);
  const start = new Date(ys, ms - 1, ds);
  const today = new Date(yt, mt - 1, dt);
  const diffDays = Math.round((today.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return 0;
  if (diffDays > 6) return 7;
  return diffDays + 1;
}

export function formatWeekLabel(weekStartISO: string): string {
  const currentWeekStart = getWeekStart(todayISO());
  if (weekStartISO === currentWeekStart) return "Esta semana";
  if (weekStartISO === addWeeks(currentWeekStart, -1)) return "Semana passada";
  if (weekStartISO === addWeeks(currentWeekStart, 1)) return "Próxima semana";

  const weekEndISO = getWeekEnd(weekStartISO);
  const [ys, ms, ds] = weekStartISO.split("-").map(Number);
  const [ye, me, de] = weekEndISO.split("-").map(Number);
  const start = new Date(ys, ms - 1, ds);
  const end = new Date(ye, me - 1, de);
  const startStr = start.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: ms === me ? undefined : "short",
  });
  const endStr = end.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  return `${startStr} – ${endStr}`;
}
