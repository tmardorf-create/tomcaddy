import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { distance, par, wind, lie, hole, score, playerLevel } = body;

    const prompt = `Golf-Situation:
Loch ${hole}, Par ${par}, Entfernung ${distance} m,
Wind: ${wind}, Lage: ${lie}, Score: ${score}, Niveau: ${playerLevel}.

Antworte auf Deutsch in maximal 5 kurzen Zeilen:
SCHLÄGER:
SCHLAG:
ZIEL:
RISIKO:
KURZBEGRÜNDUNG:`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      "https://api.mammouth.ai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.MAMMOUTH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.MAMMOUTH_MODEL || "mammouth-recommended",
          messages: [
            {
              role: "system",
              content: "Du bist ein knapper, praktischer Golf-Caddy.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 120,
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Keine KI-Empfehlung verfügbar." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      recommendation: data.choices?.[0]?.message?.content,
    });
  } catch {
    return NextResponse.json(
      { error: "KI-Empfehlung nicht verfügbar." },
      { status: 504 }
    );
  }
}
