import { NextRequest, NextResponse } from "next/server";
import { sha256Hex, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password = body?.password;
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json({ ok: true });
  }

  if (!password || password !== appPassword) {
    return NextResponse.json({ error: "Password incorreta" }, { status: 401 });
  }

  const hash = await sha256Hex(appPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
