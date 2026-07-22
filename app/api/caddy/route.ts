import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT = `
Du bist „Manni der Golfpro“, ein schneller und erfahrener Golf-Caddy.
Antworte ausschließlich auf Deutsch, kurz und direkt.
Maximal 3 kurze Sätze.
Keine langen Erklärungen, keine Tabellen und keine Wiederholung der Frage.
Wenn wichtige Angaben fehlen, stelle höchstens eine kurze Rückfrage.
`;

export async function POST(request: Request) {
  const apiKey = process.env.MAMMOUTH_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "MAMMOUTH_API_KEY fehlt in Vercel." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : `Gib eine kurze Golfempfehlung:
Entfernung: ${body.distance ?? "unbekannt"} Meter
Bahn: ${body.hole ?? "unbekannt"}
Par: ${body.par ?? "unbekannt"}
Wind: ${body.wind ?? "unbekannt"}
Balllage: ${body.lie ?? "unbekannt"}
Spielniveau: ${body.playerLevel ?? "unbekannt"}`;

    if (!question) {
      return NextResponse.json(
        { error: "Bitte eine Frage eingeben." },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);

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
          // Schnellere konkrete Auswahl statt mammouth-recommended
          model:
            process.env.MAMMOUTH_MODEL || "mistral-small-2603",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: question.slice(0, 1000),
            },
          ],
          temperature: 0.1,
          max_tokens: 120,
          stream: false,
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
            data?.error ||
            `Mammouth-Fehler ${response.status}`,
        },
        { status: response.status },
      );
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Mammouth hat keine Antwort geliefert." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      answer,
      recommendation: answer,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "Mammouth antwortet zu langsam. Bitte kurze Frage erneut senden.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Verbindung zu Mammouth fehlgeschlagen." },
      { status: 500 },
    );
  }
}
