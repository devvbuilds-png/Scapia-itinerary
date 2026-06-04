// Vercel Serverless Function — POST /api/score
// Holds the OpenAI key SERVER-SIDE (process.env.OPENAI_API_KEY). The browser
// never sees it. Builds the prompt from OUR OWN inventory so the endpoint can't
// be abused as an open OpenAI proxy — it only ever scores the Scapia demo set.

import OpenAI from "openai";
import { ALL_INVENTORY } from "../src/data/inventory.js";
import { formatInventoryForAI, buildPrompt } from "../src/engine/scoringPrompt.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Basic anti-abuse: only allow calls from our own site (or localhost) ─────
  // The browser sends an Origin header on POST; requests from other websites or
  // bare scripts (curl) won't match our host and get rejected. Set ALLOWED_ORIGIN
  // in Vercel for any extra domains. (Real spend safety = an OpenAI budget cap.)
  const host = req.headers.host || "";
  const origin = req.headers.origin || req.headers.referer || "";
  let originHost = "";
  try { originHost = origin ? new URL(origin).host : ""; } catch { originHost = ""; }
  const sameSite = !!originHost && originHost === host;
  const isLocal = host.includes("localhost") || originHost.includes("localhost");
  const allowedEnv = process.env.ALLOWED_ORIGIN || "";
  const allowedByEnv = !!originHost && allowedEnv.split(",").map((s) => s.trim()).includes(originHost);
  if (!sameSite && !isLocal && !allowedByEnv) {
    return res.status(403).json({ error: "Forbidden." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing OPENAI_API_KEY." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const constraints = body.constraints;
    if (!constraints || !Array.isArray(constraints.cities)) {
      return res.status(400).json({ error: "Missing or invalid constraints." });
    }

    const openai = new OpenAI({ apiKey });
    const items = formatInventoryForAI(ALL_INVENTORY);
    const prompt = buildPrompt(constraints, items);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = response.choices?.[0]?.message?.content ?? "";
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "AI returned malformed JSON." });
    }
    if (!result.scores) {
      return res.status(502).json({ error: 'AI response missing "scores".' });
    }

    return res.status(200).json({ scores: result.scores });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Scoring error." });
  }
}
