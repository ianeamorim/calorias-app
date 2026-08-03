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
