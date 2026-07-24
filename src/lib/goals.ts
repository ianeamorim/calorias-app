import { sql } from "@/lib/db";

export const DEFAULT_GOALS = { protein: 146, carb: 97, fat: 53 };

export type Goals = {
  protein: number;
  carb: number;
  fat: number;
  kcal: number;
};

export function computeKcal(protein: number, carb: number, fat: number): number {
  return protein * 4 + carb * 4 + fat * 9;
}

export async function getGoals(): Promise<Goals> {
  const rows = await sql`SELECT protein, carb, fat FROM goals WHERE id = 1`;
  const row = rows[0] ?? DEFAULT_GOALS;
  const protein = Number(row.protein);
  const carb = Number(row.carb);
  const fat = Number(row.fat);
  return { protein, carb, fat, kcal: computeKcal(protein, carb, fat) };
}

export async function saveGoals(
  protein: number,
  carb: number,
  fat: number
): Promise<Goals> {
  await sql`
    INSERT INTO goals (id, protein, carb, fat)
    VALUES (1, ${protein}, ${carb}, ${fat})
    ON CONFLICT (id) DO UPDATE SET protein = ${protein}, carb = ${carb}, fat = ${fat}
  `;
  return { protein, carb, fat, kcal: computeKcal(protein, carb, fat) };
}
