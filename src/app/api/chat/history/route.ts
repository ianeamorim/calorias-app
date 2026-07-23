import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Parâmetro date em falta" }, { status: 400 });
  }

  const messages = await sql`
    SELECT id, date, role, text, added_count, created_at
    FROM chat_messages
    WHERE date = ${date}
    ORDER BY created_at ASC
  `;

  return NextResponse.json({ messages });
}
