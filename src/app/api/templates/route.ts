import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateDTO } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT id, name, kcal, protein, carb, fat FROM templates ORDER BY id ASC
  `;
  return NextResponse.json({ templates: rows.map(toTemplateDTO) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, kcal, protein, carb, fat } = body ?? {};

  if (!name || kcal == null || protein == null || carb == null || fat == null) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO templates (name, kcal, protein, carb, fat)
    VALUES (${name}, ${kcal}, ${protein}, ${carb}, ${fat})
    RETURNING id, name, kcal, protein, carb, fat
  `;

  return NextResponse.json({ template: toTemplateDTO(row) });
}
