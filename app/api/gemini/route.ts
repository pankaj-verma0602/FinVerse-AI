import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Simulated Latency from Admin settings
    const simLatency = req.headers.get("x-sim-latency");
    if (simLatency) {
      const ms = Number(simLatency);
      if (!isNaN(ms) && ms > 0) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }

    // Forced Error Simulation from Admin settings
    const simError = req.headers.get("x-sim-error");
    if (simError === "true") {
      throw new Error("[Simulated API Error] Forced API failure enabled in Admin Panel diagnostics.");
    }

    const customApiKey = req.headers.get("x-gemini-key");
    const apiKey = (customApiKey && customApiKey !== "undefined" && customApiKey !== "") ? customApiKey : process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "dummy-gemini-key") {
      // If key is not configured, provide a mock response for easy local testing
      return NextResponse.json({
        text: `[Demo Mode] Gemini API Key is not configured. You asked: "${prompt}". Set your GEMINI_API_KEY in .env.local to enable live AI responses.`,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-3.5-flash as default stable text model
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to contact Gemini API" },
      { status: 500 }
    );
  }
}
