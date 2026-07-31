import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getWeekEnd } from "@/lib/date";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  if (!start) {
    return NextResponse.json({ error: "Parâmetro start em falta" }, { status: 400 });
  }
  const end = getWeekEnd(start);

  const rows = await sql`
    SELECT
      COALESCE(SUM(kcal), 0) AS kcal,
      COALESCE(SUM(protein), 0) AS protein,
      COALESCE(SUM(carb), 0) AS carb,
      COALESCE(SUM(fat), 0) AS fat,
      COUNT(*)::int AS count
    FROM meals
    WHERE date >= ${start} AND date <= ${end}
  `;
  const row = rows[0];

  return NextResponse.json({
    totals: {
      kcal: Number(row.kcal),
      protein: Number(row.protein),
      carb: Number(row.carb),
      fat: Number(row.fat),
    },
    count: Number(row.count),
  });
}
