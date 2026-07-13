import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(
  request: Request
) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term") || "";

  try {
    // your dictionary logic here
    return NextResponse.json({
      term,
      category: "Finance",
      difficulty: "Beginner",
      definition: "Example definition",
      example: "Example usage",
      importance: "Important",
      mistakes: [],
      relatedTerms: []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse Headers
    const simLatency = request.headers.get("x-sim-latency");
    const simError = request.headers.get("x-sim-error");
    const customKey = request.headers.get("x-gemini-key");

    // 1. Simulate Latency
    if (simLatency) {
      const ms = parseInt(simLatency, 10);
      if (!isNaN(ms) && ms > 0) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }

    // 2. Simulate Error
    if (simError === "500" || simError === "true") {
      return NextResponse.json({ error: "Simulated Internal Server Error" }, { status: 500 });
    }

    // Parse Body
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 3. Determine API Key
    const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY?.trim() || "";

    // 4. Fallback if no API key is configured or matches common placeholders
    const isPlaceholder = !apiKey || 
                          apiKey === "dummy-api-key" || 
                          apiKey.includes("your-api-key") || 
                          apiKey.startsWith("AQ."); // Default placeholder prefix in .env.local

    if (isPlaceholder) {
      return NextResponse.json({
        text: "[Demo Mode] No API key configured. Falling back to offline simulator response."
      });
    }

    // 5. Generate content using Gemini SDK
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ text });
    } catch (sdkError: any) {
      console.warn("Gemini SDK call failed, falling back to [Demo Mode]:", sdkError);
      return NextResponse.json({
        text: `[Demo Mode] Gemini API call failed. Falling back to offline simulation. Error: ${sdkError.message || sdkError}`
      });
    }
  } catch (error: any) {
    console.error("Error in /api/gemini POST route:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
