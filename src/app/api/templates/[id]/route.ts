import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateDTO } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, kcal, protein, carb, fat } = body ?? {};

  if (!name || kcal == null || protein == null || carb == null || fat == null) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [row] = await sql`
    UPDATE templates
    SET name = ${name}, kcal = ${kcal}, protein = ${protein}, carb = ${carb}, fat = ${fat}
    WHERE id = ${id}
    RETURNING id, name, kcal, protein, carb, fat
  `;

  return NextResponse.json({ template: toTemplateDTO(row) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`DELETE FROM templates WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
