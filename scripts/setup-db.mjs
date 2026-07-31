import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não está definida. Corre com: node --env-file=.env.local scripts/setup-db.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const templates = [
  { name: "Marmita (190g cachaço cozido escorrido + 50g massa)", kcal: 500, protein: 50, carb: 13, fat: 29 },
  { name: "Marmita lombo (190g lombo de porco moído cozido + 50g massa)", kcal: 380, protein: 59, carb: 13, fat: 12 },
  { name: "Wrap de peru (1 tortilla trigo integral ~36g + 60g Pechuga de Pavo Hacendado Finas Lonchas)", kcal: 165, protein: 14, carb: 20, fat: 3 },
  { name: "Tosta de peru (2 fatias pão 100% integral ~29g/fatia + 60g Pechuga de Pavo Hacendado Finas Lonchas)", kcal: 185, protein: 17, carb: 24, fat: 3 },
  { name: "Bolachas de arroz com peru (8 tortitas de arroz naturais + 80g Pechuga de Pavo Hacendado Finas Lonchas)", kcal: 285, protein: 20, carb: 47, fat: 3 },
  { name: "Bolachas de milho sabor presunto (1 pacote 4un. ~35g + 60g Pechuga de Pavo Hacendado Finas Lonchas)", kcal: 192, protein: 13, carb: 28, fat: 4 },
  { name: "Bolachas de milho camponesa (1 pacote 4un. ~35g + 60g Pechuga de Pavo Hacendado Finas Lonchas)", kcal: 191, protein: 13, carb: 27, fat: 4 },
  { name: "Go On Protein Crisp Peanut & Caramel (1 barra, 50g)", kcal: 238, protein: 10, carb: 23, fat: 12 },
  { name: "L.casei Fresa Morango (1 garrafa, ~95ml)", kcal: 65, protein: 2.5, carb: 10, fat: 1.3 },
];

async function main() {
  console.log("A criar tabelas...");

  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      name TEXT NOT NULL,
      kcal NUMERIC NOT NULL,
      protein NUMERIC NOT NULL,
      carb NUMERIC NOT NULL,
      fat NUMERIC NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      kcal NUMERIC NOT NULL,
      protein NUMERIC NOT NULL,
      carb NUMERIC NOT NULL,
      fat NUMERIC NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      added_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY DEFAULT 1,
      protein NUMERIC NOT NULL,
      carb NUMERIC NOT NULL,
      fat NUMERIC NOT NULL,
      CONSTRAINT goals_single_row CHECK (id = 1)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS weekly_goals (
      id INTEGER PRIMARY KEY DEFAULT 1,
      protein NUMERIC,
      carb NUMERIC,
      fat NUMERIC,
      CONSTRAINT weekly_goals_single_row CHECK (id = 1)
    )
  `;

  console.log("Tabelas criadas.");

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM templates`;
  if (count > 0) {
    console.log(`Templates já existem (${count}) — a saltar seed.`);
  } else {
    console.log("A popular templates...");
    for (const t of templates) {
      await sql`
        INSERT INTO templates (name, kcal, protein, carb, fat)
        VALUES (${t.name}, ${t.kcal}, ${t.protein}, ${t.carb}, ${t.fat})
      `;
    }
    console.log(`${templates.length} templates inseridos.`);
  }

  const [existingGoals] = await sql`SELECT id FROM goals WHERE id = 1`;
  if (existingGoals) {
    console.log("Meta já existe — a saltar seed.");
  } else {
    await sql`
      INSERT INTO goals (id, protein, carb, fat) VALUES (1, 146, 97, 53)
    `;
    console.log("Meta inicial inserida (146g proteína, 97g hidratos, 53g gordura).");
  }

  console.log("Concluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
