import { NextRequest, NextResponse } from "next/server";
import { sql, toTemplateCategoryDTO } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT id, name, sort_order FROM template_categories ORDER BY sort_order ASC, id ASC
  `;
  return NextResponse.json({ categories: rows.map(toTemplateCategoryDTO) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body?.name;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nome em falta" }, { status: 400 });
  }

  const [{ next_order }] = await sql`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM template_categories
  `;

  const [row] = await sql`
    INSERT INTO template_categories (name, sort_order)
    VALUES (${name.trim()}, ${next_order})
    RETURNING id, name, sort_order
  `;

  return NextResponse.json({ category: toTemplateCategoryDTO(row) });
}
