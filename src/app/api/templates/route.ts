import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateDTO } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT id, name, kcal, protein, carb, fat, category_id, sort_order
    FROM templates
    ORDER BY sort_order ASC, id ASC
  `;
  return NextResponse.json({ templates: rows.map(toTemplateDTO) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, kcal, protein, carb, fat } = body ?? {};
  const categoryId = body?.category_id ?? null;

  if (!name || kcal == null || protein == null || carb == null || fat == null) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [{ next_order }] = await sql`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
    FROM templates
    WHERE category_id IS NOT DISTINCT FROM ${categoryId}
  `;

  const [row] = await sql`
    INSERT INTO templates (name, kcal, protein, carb, fat, category_id, sort_order)
    VALUES (${name}, ${kcal}, ${protein}, ${carb}, ${fat}, ${categoryId}, ${next_order})
    RETURNING id, name, kcal, protein, carb, fat, category_id, sort_order
  `;

  return NextResponse.json({ template: toTemplateDTO(row) });
}
