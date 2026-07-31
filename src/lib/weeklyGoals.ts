import { sql } from "@/lib/db";
import { computeKcal, type Goals } from "@/lib/goals";

export async function getWeeklyGoals(): Promise<Goals | null> {
  const rows = await sql`SELECT protein, carb, fat FROM weekly_goals WHERE id = 1`;
  const row = rows[0];
  if (!row || row.protein == null || row.carb == null || row.fat == null) {
    return null;
  }
  const protein = Number(row.protein);
  const carb = Number(row.carb);
  const fat = Number(row.fat);
  return { protein, carb, fat, kcal: computeKcal(protein, carb, fat) };
}

export async function saveWeeklyGoals(
  protein: number,
  carb: number,
  fat: number
): Promise<Goals> {
  await sql`
    INSERT INTO weekly_goals (id, protein, carb, fat)
    VALUES (1, ${protein}, ${carb}, ${fat})
    ON CONFLICT (id) DO UPDATE SET protein = ${protein}, carb = ${carb}, fat = ${fat}
  `;
  return { protein, carb, fat, kcal: computeKcal(protein, carb, fat) };
}
