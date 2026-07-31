import { NextRequest, NextResponse } from "next/server";
import { getWeeklyGoals, saveWeeklyGoals } from "@/lib/weeklyGoals";

export async function GET() {
  const goals = await getWeeklyGoals();
  return NextResponse.json({ goals });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const protein = Number(body?.protein);
  const carb = Number(body?.carb);
  const fat = Number(body?.fat);

  if (
    !Number.isFinite(protein) ||
    !Number.isFinite(carb) ||
    !Number.isFinite(fat) ||
    protein < 0 ||
    carb < 0 ||
    fat < 0
  ) {
    return NextResponse.json({ error: "Valores inválidos" }, { status: 400 });
  }

  const goals = await saveWeeklyGoals(protein, carb, fat);
  return NextResponse.json({ goals });
}
