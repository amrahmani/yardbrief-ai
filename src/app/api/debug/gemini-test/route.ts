import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Development-only diagnostic route.
// Do not expose real API keys in responses or commit real keys into env files.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        message: "Not found.",
      },
      { status: 404 },
    );
  }

  const aiProvider = process.env.AI_PROVIDER ?? "template";
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!hasGeminiKey) {
    return NextResponse.json(
      {
        ok: false,
        aiProvider,
        hasGeminiKey,
        model,
        message: "Gemini test could not run.",
        errorMessage: "GEMINI_API_KEY is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model,
      contents: "Reply with exactly: Gemini connected",
    });

    const text = response.text?.trim() || "";

    return NextResponse.json({
      ok: text === "Gemini connected",
      aiProvider,
      hasGeminiKey,
      model,
      message: text || "No response text returned.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        aiProvider,
        hasGeminiKey,
        model,
        message: "Gemini test failed.",
        errorMessage:
          error instanceof Error ? error.message : "Unknown Gemini test error.",
      },
      { status: 500 },
    );
  }
}
