import OpenAI from "openai";
import { formatInventoryForAI, buildPrompt } from "./scoringPrompt.js";

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
// Production: calls our own /api/score serverless function, which holds the
//   OpenAI key SERVER-SIDE (never shipped to the browser).
// Local dev (vite): calls OpenAI directly with VITE_OPENAI_API_KEY from
//   .env.local — convenient and the key never leaves your machine.
export async function scoreInventory(constraints, allInventory) {
  if (import.meta.env.DEV) {
    return scoreDirectFromBrowser(constraints, allInventory);
  }
  return scoreViaServerless(constraints);
}

// ── Production path: serverless proxy ─────────────────────────────────────────
async function scoreViaServerless(constraints) {
  let res;
  try {
    res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ constraints }),
    });
  } catch {
    throw new Error("Couldn't reach the scoring service. Check your connection and try again.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error || "";
    } catch {
      /* ignore */
    }
    throw new Error(`Scoring failed (${res.status}). ${detail}`);
  }

  const data = await res.json();
  if (!data.scores) throw new Error('Scoring response missing "scores".');
  return data.scores;
}

// ── Local-dev path: direct browser call (key stays on your machine) ───────────
async function scoreDirectFromBrowser(constraints, allInventory) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "Local dev: add VITE_OPENAI_API_KEY to .env.local and restart `npm run dev`."
    );
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const items = formatInventoryForAI(allInventory);
  const prompt = buildPrompt(constraints, items);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content;
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error("AI returned malformed JSON. Raw response: " + raw.slice(0, 200));
  }
  if (!result.scores) {
    throw new Error('AI response missing "scores" key. Got: ' + JSON.stringify(result).slice(0, 200));
  }
  return result.scores;
}
