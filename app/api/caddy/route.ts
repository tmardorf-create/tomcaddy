import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Du bist „Manni der Golfpro“, ein erfahrener, ruhiger Golf-Caddy für TomCaddy.

Antworte immer auf Deutsch.
Antworte kurz, direkt und praktisch.
Vermeide lange Erklärungen und unnötige Einleitungen.
Gib konkrete Handlungsempfehlungen für die aktuelle Situation.
Wenn wichtige Angaben fehlen, stelle höchstens eine kurze Rückfrage.
Erfinde keine Entfernungen, Platzdaten oder Golfregeln.
Bei Regelthemen weise knapp darauf hin, wenn die genaue Situation entscheidend ist.
Maximal 5 kurze Sätze.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        { error: "Bitte gib eine Frage ein." },
        { status: 400 },
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Die Frage ist zu lang." },
        { status: 400 },
      );
    }

    const apiKey = process.env.MAMMOUTH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Mammouth API-Key fehlt in Vercel." },
        { status: 500 },
      );
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 9000);

    const response = await fetch(
      "https://api.mammouth.ai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            process.env.MAMMOUTH_MODEL ||
            "mammouth-recommended",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.2,
          max_tokens: 180,
        }),
      },
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Mammouth konnte keine Antwort liefern.",
        },
        { status: response.status },
      );
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Mammouth hat leer geantwortet." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        { error: "Die Antwort hat zu lange gedauert." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Mammouth ist momentan nicht erreichbar." },
      { status: 500 },
    );
  }
}
