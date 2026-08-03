import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const direction = body?.direction;

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "direction inválida" }, { status: 400 });
  }

  const siblings = await sql`
    SELECT id, sort_order FROM template_categories ORDER BY sort_order ASC, id ASC
  `;

  const idx = siblings.findIndex((s) => String(s.id) === String(id));
  if (idx === -1) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return NextResponse.json({ ok: true }); // já está no limite, nada a fazer
  }

  const current = siblings[idx];
  const other = siblings[swapIdx];

  await sql`UPDATE template_categories SET sort_order = ${other.sort_order} WHERE id = ${current.id}`;
  await sql`UPDATE template_categories SET sort_order = ${current.sort_order} WHERE id = ${other.id}`;

  return NextResponse.json({ ok: true });
}
