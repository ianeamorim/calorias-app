import { NextRequest, NextResponse } from "next/server";
import { sql, toMealDTO } from "@/lib/db";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Parâmetro date em falta" }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, date, name, kcal, protein, carb, fat, created_at
    FROM meals
    WHERE date = ${date}
    ORDER BY created_at ASC
  `;

  return NextResponse.json({ meals: rows.map(toMealDTO) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, name, kcal, protein, carb, fat } = body ?? {};

  if (!date || !name || kcal == null || protein == null || carb == null || fat == null) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO meals (date, name, kcal, protein, carb, fat)
    VALUES (${date}, ${name}, ${kcal}, ${protein}, ${carb}, ${fat})
    RETURNING id, date, name, kcal, protein, carb, fat, created_at
  `;

  return NextResponse.json({ meal: toMealDTO(row) });
}
