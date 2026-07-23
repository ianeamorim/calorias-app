import { NextRequest, NextResponse } from "next/server";
import { sql, toMealDTO } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const date = body?.date;
  const multiplier = Number(body?.multiplier ?? 1);

  if (!date || !multiplier || multiplier <= 0) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [template] = await sql`
    SELECT name, kcal, protein, carb, fat FROM templates WHERE id = ${id}
  `;

  if (!template) {
    return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
  }

  const name =
    multiplier === 1 ? template.name : `${template.name} (x${multiplier})`;

  const [row] = await sql`
    INSERT INTO meals (date, name, kcal, protein, carb, fat)
    VALUES (
      ${date},
      ${name},
      ${Number(template.kcal) * multiplier},
      ${Number(template.protein) * multiplier},
      ${Number(template.carb) * multiplier},
      ${Number(template.fat) * multiplier}
    )
    RETURNING id, date, name, kcal, protein, carb, fat, created_at
  `;

  return NextResponse.json({ meal: toMealDTO(row) });
}
