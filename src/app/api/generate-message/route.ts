// app/api/generate-message/route.ts
//
// Takes a recipient's name, relationship, vibe, an optional language, and
// an optional freeform custom prompt from the user — then asks Gemini for
// a short personalized birthday message. Locked behind requireUser().

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireUser } from "@/lib/requireUser";

const VIBE_TONE: Record<string, string> = {
  "warm-family": "warm, heartfelt, and family-appropriate",
  "funny-close": "playful, funny, and casual — like texting a close friend",
  sweet: "sweet, affectionate, and a little poetic",
  formal: "polished and respectful, suitable for a colleague or acquaintance",
  minimal: "short, simple, and understated — no more than two sentences",
  "photo-poster":
    "short and upbeat — this sits under a photo, so keep it brief",
};

// A separate tone override, independent of the email vibe — lets someone
// ask for a specific tone without changing which email design they're using.
const TONE_OVERRIDE: Record<string, string> = {
  savage:
    "Make it playfully savage and roast-y — teasing, sarcastic, brutally honest in a funny way — but still clearly affectionate underneath, like how close friends rib each other on a birthday. Not genuinely mean.",
  wholesome:
    "Make it extra wholesome and heartfelt — sincere, warm, a little emotional, the kind of message that makes someone tear up a bit.",
  nostalgic:
    "Make it nostalgic — reflect on time passing, shared history, and how far the relationship has come, without needing specific memories (the sender can edit in real ones after).",
  filmy:
    "Make it dramatic and over-the-top in a fun, Bollywood-filmy way — grand declarations, larger-than-life phrasing, theatrical flair, but still clearly a birthday message and not cringe-serious.",
  shayari:
    "Write it in the style of Hindi/Urdu shayari — short rhyming or rhythmic verses with emotional, poetic phrasing, even if the target language is English.",
  hype: "Make it high-energy and hype — like a motivational hype-man psyching someone up for their best year yet, enthusiastic and celebratory.",
};

const LANGUAGE_INSTRUCTION: Record<string, string> = {
  english: "Write it in English.",
  hindi: "Write it entirely in Hindi, using Devanagari script.",
  gujarati: "Write it entirely in Gujarati, using Gujarati script.",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini occasionally returns 503 "high demand" when a model is
// overloaded — transient, not a real failure. Retries a few times with
// increasing delay before giving up. Any other kind of error (bad key,
// bad request) is thrown immediately, no retry.
async function generateWithRetry(
  ai: InstanceType<typeof GoogleGenAI>,
  params: Parameters<
    InstanceType<typeof GoogleGenAI>["models"]["generateContent"]
  >[0],
  maxRetries = 3,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const isOverloaded =
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("high demand");

      if (!isOverloaded || attempt === maxRetries) throw err;

      const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      await sleep(delayMs);
    }
  }
  throw lastError;
}

export async function POST(req: Request) {
  const { user, error: authError } = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { name, relationship, vibe, language, tone, customPrompt } =
    await req.json();

  if (!name || !relationship) {
    return NextResponse.json(
      { error: "Missing name or relationship" },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  const toneInstruction =
    tone && TONE_OVERRIDE[tone]
      ? TONE_OVERRIDE[tone]
      : `Tone: ${VIBE_TONE[vibe as string] ?? VIBE_TONE["warm-family"]}.`;

  const languageInstruction =
    LANGUAGE_INSTRUCTION[language as string] ?? LANGUAGE_INSTRUCTION.english;

  const basePrompt = `Write a short, original birthday message for someone named ${name}, who is the sender's ${relationship}. ${toneInstruction} ${languageInstruction} 2-4 sentences unless the instructions below ask for something longer. No greeting like "Dear" or sign-off — just the message body itself, ready to drop into an email.`;

  const fullPrompt = customPrompt
    ? `${basePrompt} Additional instructions from the sender, follow these closely: ${customPrompt}`
    : basePrompt;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await generateWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents: fullPrompt,
    });

    const message = response.text?.trim();
    if (!message) throw new Error("Gemini returned an empty response");

    return NextResponse.json({ message });
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : "Unknown error";
    const isOverloaded =
      rawMessage.includes("503") ||
      rawMessage.includes("UNAVAILABLE") ||
      rawMessage.includes("high demand");

    const errMessage = isOverloaded
      ? "Gemini is overloaded right now, even after retrying — please try again in a minute."
      : rawMessage;

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
