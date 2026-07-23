import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";
import { DAILY_GOALS, ANTHROPIC_MODEL } from "@/lib/config";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          kcal: { type: "number" },
          protein: { type: "number" },
          carb: { type: "number" },
          fat: { type: "number" },
        },
        required: ["name", "kcal", "protein", "carb", "fat"],
        additionalProperties: false,
      },
    },
    reply: { type: "string" },
  },
  required: ["items", "reply"],
  additionalProperties: false,
};

function systemPrompt() {
  return `Tu és um assistente de nutrição dentro de uma app pessoal de contagem de calorias.
A meta diária do utilizador é: ${DAILY_GOALS.kcal} kcal, ${DAILY_GOALS.protein}g proteína, ${DAILY_GOALS.carb}g hidratos, ${DAILY_GOALS.fat}g gordura.
Quando o utilizador descrever comida, estima ou pesquisa (usando a ferramenta de pesquisa na internet para produtos de marca específicos, como Mercadona, Lidl, Hacendado, ou outras marcas comerciais) as calorias e macros de cada alimento mencionado. Para comida caseira genérica, usa conhecimento geral sem pesquisar.
Responde sempre com o formato JSON estruturado indicado. Não peças esclarecimentos, faz sempre a melhor estimativa possível.
Se a mensagem do utilizador não for sobre comida (pergunta, cumprimento, etc.), o campo "items" deve vir vazio ([]) e "reply" responde normalmente em português, de forma simpática e breve.`;
}

type ParsedReply = {
  items: Array<{
    name: string;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
  }>;
  reply: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body?.message;
  const date = body?.date;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Mensagem em falta" }, { status: 400 });
  }

  const targetDate = date || new Date().toISOString().slice(0, 10);

  await sql`INSERT INTO chat_messages (date, role, text) VALUES (${targetDate}, 'user', ${message})`;

  let parsed: ParsedReply;

  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: systemPrompt(),
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 3 },
      ],
      output_config: {
        format: { type: "json_schema", schema: RESPONSE_SCHEMA },
      },
      messages: [{ role: "user", content: message }],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    if (!textBlock) {
      throw new Error("O modelo não devolveu texto estruturado");
    }
    parsed = JSON.parse(textBlock.text);
  } catch (err) {
    console.error("Erro ao chamar a Anthropic API:", err);
    const fallbackReply =
      "Desculpa, houve um erro ao processar o teu pedido. Tenta novamente ou usa o registo manual.";
    await sql`INSERT INTO chat_messages (date, role, text) VALUES (${targetDate}, 'assistant', ${fallbackReply})`;
    return NextResponse.json(
      { error: "Erro ao contactar o assistente", reply: fallbackReply },
      { status: 502 }
    );
  }

  for (const item of parsed.items) {
    await sql`
      INSERT INTO meals (date, name, kcal, protein, carb, fat)
      VALUES (${targetDate}, ${item.name}, ${item.kcal}, ${item.protein}, ${item.carb}, ${item.fat})
    `;
  }

  await sql`
    INSERT INTO chat_messages (date, role, text, added_count)
    VALUES (${targetDate}, 'assistant', ${parsed.reply}, ${parsed.items.length})
  `;

  return NextResponse.json({
    reply: parsed.reply,
    itemsAdded: parsed.items.length,
    items: parsed.items,
  });
}
