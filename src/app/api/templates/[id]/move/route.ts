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

  const [target] = await sql`SELECT id, category_id, sort_order FROM templates WHERE id = ${id}`;
  if (!target) {
    return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
  }

  const siblings = await sql`
    SELECT id, sort_order FROM templates
    WHERE category_id IS NOT DISTINCT FROM ${target.category_id}
    ORDER BY sort_order ASC, id ASC
  `;

  const idx = siblings.findIndex((s) => String(s.id) === String(target.id));
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return NextResponse.json({ ok: true }); // já está no limite, nada a fazer
  }

  const other = siblings[swapIdx];

  await sql`UPDATE templates SET sort_order = ${other.sort_order} WHERE id = ${target.id}`;
  await sql`UPDATE templates SET sort_order = ${target.sort_order} WHERE id = ${other.id}`;

  return NextResponse.json({ ok: true });
}
