import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Adiada para o momento da primeira query, para não rebentar durante o
// "collecting page data" do `next build`, que importa este módulo sem
// executar nenhuma query.
function missingUrl(): never {
  throw new Error("DATABASE_URL não está definida");
}

export const sql: NeonQueryFunction<false, false> = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : (new Proxy(() => {}, {
      apply: missingUrl,
    }) as unknown as NeonQueryFunction<false, false>);

export type Meal = {
  id: number;
  date: string;
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  created_at: string;
};

export type Template = {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  category_id: number | null;
  sort_order: number;
};

export type TemplateCategory = {
  id: number;
  name: string;
  sort_order: number;
};

export type ChatMessage = {
  id: number;
  date: string;
  role: "user" | "assistant";
  text: string;
  added_count: number;
  created_at: string;
};

type NumericRow = Record<string, unknown>;

export function toMealDTO(row: NumericRow) {
  return {
    id: Number(row.id),
    date: String(row.date),
    name: String(row.name),
    kcal: Number(row.kcal),
    protein: Number(row.protein),
    carb: Number(row.carb),
    fat: Number(row.fat),
    created_at: String(row.created_at),
  };
}

export function toTemplateDTO(row: NumericRow) {
  return {
    id: Number(row.id),
    name: String(row.name),
    kcal: Number(row.kcal),
    protein: Number(row.protein),
    carb: Number(row.carb),
    fat: Number(row.fat),
    category_id: row.category_id == null ? null : Number(row.category_id),
    sort_order: Number(row.sort_order),
  };
}

export function toTemplateCategoryDTO(row: NumericRow) {
  return {
    id: Number(row.id),
    name: String(row.name),
    sort_order: Number(row.sort_order),
  };
}
