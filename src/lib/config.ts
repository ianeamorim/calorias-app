export const DAILY_GOALS = {
  kcal: Number(process.env.GOAL_KCAL ?? 1449),
  protein: Number(process.env.GOAL_PROTEIN ?? 146),
  carb: Number(process.env.GOAL_CARB ?? 97),
  fat: Number(process.env.GOAL_FAT ?? 53),
};

export const ANTHROPIC_MODEL = "claude-sonnet-5";
