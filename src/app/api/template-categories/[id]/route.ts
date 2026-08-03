import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateCategoryDTO } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const name = body?.name;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nome em falta" }, { status: 400 });
  }

  const [row] = await sql`
    UPDATE template_categories
    SET name = ${name.trim()}
    WHERE id = ${id}
    RETURNING id, name, sort_order
  `;

  return NextResponse.json({ category: toTemplateCategoryDTO(row) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Os templates desta categoria não são apagados — a FK (ON DELETE SET NULL)
  // trata de os deixar "Sem categoria" automaticamente.
  await sql`DELETE FROM template_categories WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
