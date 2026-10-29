import { NextResponse } from "next/server";
import type { BrandKit } from "@/lib/brand-kit";

const ALEM_API_URL = process.env.ALEM_API_URL ?? "https://llm.alem.ai/v1/chat/completions";
const ALEM_MODEL = process.env.ALEM_MODEL ?? "qwen3-8";

type RequestBody = {
  mode?: "generate" | "edit" | "hashtags" | "week";
  sourceText?: string;
  currentText?: string;
  instruction?: string;
  language?: string;
  audience?: string;
  tone?: string;
  platforms?: string[];
  hashtagCount?: number;
  brandKit?: Partial<BrandKit>;
};

function brandPrompt(brand?: Partial<BrandKit>) {
  if (!brand?.brandName && !brand?.description && !brand?.aiInstructions) return "No Brand Kit is configured.";
  const lines = [
    brand.brandName && `Brand name: ${brand.brandName}`,
    brand.description && `Verified business description: ${brand.description}`,
    brand.audience && `Brand target audience: ${brand.audience}`,
    brand.tone && `Brand tone of voice: ${brand.tone}`,
    brand.slogan && `Official slogan: ${brand.slogan}`,
    brand.values && `Brand values: ${brand.values}`,
    brand.website && `Official website: ${brand.website}`,
    brand.phone && `Official phone: ${brand.phone}`,
    brand.email && `Official email: ${brand.email}`,
    brand.address && `Official address: ${brand.address}`,
    brand.requiredPhrases && `Required phrases when contextually appropriate: ${brand.requiredPhrases}`,
    brand.forbiddenPhrases && `Never use these words or claims: ${brand.forbiddenPhrases}`,
    brand.aiInstructions && `Additional binding instructions: ${brand.aiInstructions}`,
  ].filter(Boolean);
  return `BRAND KIT (use only these verified facts; missing facts must never be invented):\n${lines.join("\n")}`;
}

async function callAlem(messages: Array<{ role: "system" | "user"; content: string }>, temperature = 0.7, jsonMode = false) {
  const apiKey = process.env.ALEM_API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(ALEM_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: ALEM_MODEL, temperature, max_tokens: 2500, ...(jsonMode ? { response_format: { type: "json_object" } } : {}), chat_template_kwargs: { enable_thinking: false }, messages }),
      cache: "no-store",
      signal: controller.signal,
    });
    const raw = await response.text();
    if (!response.ok) {
      console.error("Alem AI request failed", response.status, raw.slice(0, 500));
      throw new Error(`AI_HTTP_${response.status}`);
    }
    const data = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("AI_EMPTY_RESPONSE");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(content: string) {
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("AI_INVALID_JSON");
  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    const repaired = candidate
      .replace(/([\[:,]\s*)#([^\s,\]\}]+)/g, '$1"#$2"')
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
    return JSON.parse(repaired);
  }
}

async function callAlemJson(messages: Array<{ role: "system" | "user"; content: string }>, temperature = 0.7) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const retryInstruction = attempt === 0 ? [] : [{
        role: "user" as const,
        content: "Your previous response was not valid JSON. Return only one complete valid JSON object. Do not add markdown, comments, reasoning, or text outside the JSON object.",
      }];
      return parseJson(await callAlem([...messages, ...retryInstruction], Math.max(0.2, temperature - attempt * 0.15), true));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI_INVALID_JSON");
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeContent(value: any, platforms: string[]) {
  const tags = value?.hashtags ?? {};
  const platformValues = value?.platforms ?? {};
  const normalizedPlatforms = Object.fromEntries(platforms.map((platform) => {
    const item = platformValues[platform] ?? {};
    return [platform, {
      title: String(item.title ?? value?.headline ?? ""),
      text: String(item.text ?? value?.body ?? ""),
      cta: String(item.cta ?? value?.cta ?? ""),
      hashtags: strings(item.hashtags),
      extra: String(item.extra ?? ""),
    }];
  }));
  return {
    headline: String(value?.headline ?? ""), body: String(value?.body ?? ""), cta: String(value?.cta ?? ""),
    shortVersion: String(value?.shortVersion ?? ""), storyIdea: String(value?.storyIdea ?? ""), videoIdea: String(value?.videoIdea ?? ""),
    hashtags: { primary: strings(tags.primary), thematic: strings(tags.thematic), local: strings(tags.local) },
    platforms: normalizedPlatforms,
  };
}

export async function POST(request: Request) {
  let body: RequestBody;
  try { body = (await request.json()) as RequestBody; }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const sourceText = body.sourceText?.trim();
  if (!sourceText) return NextResponse.json({ error: "Enter an idea or source text." }, { status: 400 });
  if (sourceText.length > 5000) return NextResponse.json({ error: "The text must not exceed 5000 characters." }, { status: 400 });

  const mode = body.mode ?? "generate";
  const language = body.language ?? "Russian";
  const audience = body.audience ?? "Small business";
  const tone = body.tone ?? "Professional";
  const platforms = body.platforms?.length ? body.platforms : ["Instagram"];
  const brandContext = brandPrompt(body.brandKit);

  try {
    if (mode === "edit") {
      const content = await callAlem([
        { role: "system", content: "You are a senior social media editor. Return only the revised post without explanations or markdown fences. Never alter factual details." },
        { role: "user", content: `Language: ${language}\n${brandContext}\nInstruction: ${body.instruction ?? "Improve the text"}\nOriginal idea for fact checking: ${sourceText}\nText to revise: ${body.currentText ?? sourceText}` },
      ], 0.55);
      return NextResponse.json({ text: content });
    }

    if (mode === "hashtags") {
      const count = Math.min(30, Math.max(5, body.hashtagCount ?? 10));
      const content = await callAlemJson([
        { role: "system", content: "Return valid JSON only. Hashtags must contain no spaces." },
        { role: "user", content: `${brandContext}\nCreate exactly ${count} relevant hashtags in ${language} for: ${sourceText}. Return {"primary":[],"thematic":[],"local":[]}. Distribute all ${count} tags across the three arrays.` },
      ], 0.5);
      return NextResponse.json({ hashtags: content });
    }

    if (mode === "week") {
      const content = await callAlemJson([
        { role: "system", content: "You are a content strategist. Return valid JSON only, without markdown." },
        { role: "user", content: `${brandContext}\nCreate a seven-day content plan in ${language} for this idea: ${sourceText}. Audience: ${audience}. Return {"days":[{"day":1,"title":"","format":"","idea":""}]} with exactly 7 items.` },
      ], 0.65);
      return NextResponse.json({ weekPlan: content.days ?? [] });
    }

    const platformRules = "Instagram: engaging caption, emoji if useful, CTA, hashtags, and 3-4 Story slides. TikTok: hook, short video script, caption and hashtags. Telegram: detailed informative post. Facebook: accessible universal post. LinkedIn: professional business version. YouTube: title, description, hashtags and thumbnail idea. WhatsApp: concise conversational message suitable for a channel or customer broadcast, with a clear CTA and minimal hashtags. Threads: natural conversational post that invites replies, concise and community-focused. VK / ВКонтакте: informative community post with a strong opening, useful detail, CTA and relevant hashtags. X / Twitter: concise punchy post within 280 characters, with a clear hook and no more than 2-3 hashtags. Google Business: concise update, service/company context and CTA.";
    const content = await callAlemJson([
      { role: "system", content: "You are the AI content studio for businesses in Kazakhstan. Preserve every factual detail. Never invent company names (including QADAM MEDIA), services, addresses, prices, dates, contacts, promo codes, awards, guarantees or scarcity claims. Every named entity, offer condition and business detail must come directly from the source idea. Return valid JSON only without markdown fences." },
      { role: "user", content: [
        `Language: ${language}. Audience: ${audience}. Style: ${tone}.`, brandContext,
        `Platforms: ${platforms.join(", ")}.`, platformRules, `Source idea: ${sourceText}`,
        "Return this exact JSON shape: {\"headline\":\"\",\"body\":\"\",\"cta\":\"\",\"shortVersion\":\"\",\"storyIdea\":\"\",\"videoIdea\":\"\",\"hashtags\":{\"primary\":[],\"thematic\":[],\"local\":[]},\"platforms\":{\"Instagram\":{\"title\":\"\",\"text\":\"\",\"cta\":\"\",\"hashtags\":[],\"extra\":\"\"}}}. Include one object under platforms for every requested platform. For Instagram extra contains Story slides; TikTok a script; YouTube a thumbnail idea; other platforms a useful format-specific note."
      ].join("\n") },
    ], 0.7);
    return NextResponse.json({ content: normalizeContent(content, platforms) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    console.error("Alem AI generation error", message);
    if (message === "API_KEY_MISSING") return NextResponse.json({ error: "AI API key is not configured on the server." }, { status: 503 });
    if (error instanceof Error && error.name === "AbortError") return NextResponse.json({ error: "The AI service did not respond within 90 seconds." }, { status: 504 });
    return NextResponse.json({ error: "Could not generate content. Please try again." }, { status: 502 });
  }
}
