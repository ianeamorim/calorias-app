import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateDTO } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, kcal, protein, carb, fat } = body ?? {};
  const categoryId = body?.category_id ?? null;

  if (!name || kcal == null || protein == null || carb == null || fat == null) {
    return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
  }

  const [existing] = await sql`SELECT category_id FROM templates WHERE id = ${id}`;
  if (!existing) {
    return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
  }

  const categoryChanged = String(existing.category_id) !== String(categoryId);
  let sortOrder: number | null = null;

  if (categoryChanged) {
    const [{ next_order }] = await sql`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
      FROM templates
      WHERE category_id IS NOT DISTINCT FROM ${categoryId}
    `;
    sortOrder = next_order;
  }

  const row = categoryChanged
    ? (
        await sql`
          UPDATE templates
          SET name = ${name}, kcal = ${kcal}, protein = ${protein}, carb = ${carb}, fat = ${fat},
              category_id = ${categoryId}, sort_order = ${sortOrder}
          WHERE id = ${id}
          RETURNING id, name, kcal, protein, carb, fat, category_id, sort_order
        `
      )[0]
    : (
        await sql`
          UPDATE templates
          SET name = ${name}, kcal = ${kcal}, protein = ${protein}, carb = ${carb}, fat = ${fat}
          WHERE id = ${id}
          RETURNING id, name, kcal, protein, carb, fat, category_id, sort_order
        `
      )[0];

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
