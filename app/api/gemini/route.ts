import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPlaceholderKey(key: string): boolean {
  return (
    !key ||
    key === "dummy-api-key" ||
    key.includes("your-api-key") ||
    key.includes("your_api_key")
  );
}

/** Returns true when the Google API rejected the key as invalid/expired. */
function isInvalidKeyError(err: any): boolean {
  const msg: string = err?.message || "";
  return (
    msg.includes("API_KEY_INVALID") ||
    msg.includes("API key not valid") ||
    msg.includes("400 Bad Request")
  );
}

// ─── GET  ─────────────────────────────────────────────────────────────────────
// Used by /financial-dictionary to look up a term definition via Gemini.
// Falls back to a static stub when no real API key is present.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = (searchParams.get("term") || "").trim();

  if (!term) {
    return NextResponse.json({ error: "term query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";

  if (isPlaceholderKey(apiKey)) {
    return NextResponse.json({
      term,
      category: "Finance",
      difficulty: "Beginner",
      definition: `[Demo Mode] No Gemini API key configured. To get a real definition of "${term}", add a valid GEMINI_API_KEY to your .env.local file.`,
      example: "See Settings → API Keys to configure your Gemini key.",
      importance: "Configure GEMINI_API_KEY to unlock AI-powered definitions.",
      mistakes: [],
      relatedTerms: [],
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const geminiPrompt = `Define the financial term "${term}" as a JSON object with these exact keys:
- term (string)
- category (string, e.g. Investment, Loans, Banking)
- difficulty (string: Beginner | Intermediate | Advanced)
- definition (string, clear 1-2 sentence definition)
- example (string, real-world example)
- importance (string, why it matters)
- mistakes (string[], common mistakes people make, max 3)
- relatedTerms (string[], related financial terms, max 4)

Return ONLY the raw JSON object, no markdown code fences.`;

    const result = await model.generateContent(geminiPrompt);
    let text = result.response.text().trim();

    // Strip markdown code block wrappers if Gemini added them
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Gemini GET /api/gemini error:", error);

    // Invalid / expired key — return a friendly demo stub instead of crashing
    if (isInvalidKeyError(error)) {
      return NextResponse.json({
        term,
        category: "Finance",
        difficulty: "Beginner",
        definition: `[Demo Mode] Gemini API key is invalid or expired. Please update GEMINI_API_KEY in .env.local with a valid key from https://aistudio.google.com/app/apikey`,
        example: "Go to Settings → API Keys to enter a working key.",
        importance: "A valid GEMINI_API_KEY is required for live AI definitions.",
        mistakes: [],
        relatedTerms: [],
      });
    }

    return NextResponse.json({ error: error.message || "Gemini API call failed" }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
// General-purpose Gemini text-generation endpoint used by:
//   • AI Money Mentor  (/mentor)
//   • Document Decoder (/document-decoder)
//   • Scam Shield      (/scam-shield)

export async function POST(request: Request) {
  try {
    // ── Simulation headers (injected by Admin Settings) ──
    const simLatency = request.headers.get("x-sim-latency");
    const simError = request.headers.get("x-sim-error");
    const customKey = request.headers.get("x-gemini-key");

    // 1. Simulate artificial latency
    if (simLatency) {
      const ms = parseInt(simLatency, 10);
      if (!isNaN(ms) && ms > 0) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }

    // 2. Simulate forced error
    if (simError === "500" || simError === "true") {
      return NextResponse.json({ error: "Simulated Internal Server Error" }, { status: 500 });
    }

    // 3. Parse body
    const body = await request.json();
    const { prompt } = body;
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // 4. Resolve API key (user-supplied via header takes precedence)
    const apiKey = (customKey?.trim() || process.env.GEMINI_API_KEY?.trim() || "");

    // 5. Return demo-mode stub when no valid key is present
    if (isPlaceholderKey(apiKey)) {
      return NextResponse.json({
        text: "[Demo Mode] No Gemini API key configured. Add a valid GEMINI_API_KEY to .env.local (or via Settings → API Keys) to enable live AI responses.",
      });
    }

    // 6. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Gemini POST /api/gemini error:", error);

    // Invalid / expired key — return demo-mode text so the UI falls back
    // gracefully instead of showing a raw error to the user.
    if (isInvalidKeyError(error)) {
      return NextResponse.json({
        text: "[Demo Mode] Gemini API key is invalid or expired. Go to https://aistudio.google.com/app/apikey to get a valid key, then update GEMINI_API_KEY in .env.local and restart the server.",
      });
    }

    return NextResponse.json(
      { error: error.message || "Gemini API call failed" },
      { status: 500 }
    );
  }
}
