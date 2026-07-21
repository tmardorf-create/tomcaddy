import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      distance,
      par,
      wind,
      lie,
      hole,
      score,
      playerLevel,
    } = body;

    const prompt = `
Du bist TomCaddy, ein freundlicher virtueller Golf-Caddy.

Analysiere diese Spielsituation:

Bahn: ${hole || "unbekannt"}
Par: ${par || "unbekannt"}
Entfernung zum Ziel: ${distance || "unbekannt"} Meter
Wind: ${wind || "kein Wind angegeben"}
Balllage: ${lie || "unbekannt"}
Aktueller Score: ${score || "unbekannt"}
Spielstärke: ${playerLevel || "unbekannt"}

Gib eine kurze, praktische Empfehlung auf Deutsch.

Antworte exakt in diesem Format:

SCHLÄGER: [Schläger]
SCHLAG: [konkrete Empfehlung]
ZIEL: [Zielpunkt]
RISIKO: [mögliche Gefahr]
KURZBEGRÜNDUNG: [maximal zwei Sätze]

Wichtig:
- Berücksichtige Gegenwind und Rückenwind.
- Gib keine unrealistisch präzisen Garantien.
- Wenn wichtige Daten fehlen, weise kurz darauf hin.
- Die Empfehlung ist nur eine Entscheidungshilfe.
`;

    const response = await fetch(
      "https://api.mammouth.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MAMMOUTH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.MAMMOUTH_MODEL || "gpt-4.1",
          messages: [
            {
              role: "system",
              content: "Du bist TomCaddy, ein erfahrener Golf-Caddy.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content;

    return NextResponse.json({ recommendation });
  } catch {
    return NextResponse.json(
      { error: "TomCaddy konnte keine Empfehlung erstellen." },
      { status: 500 }
    );
  }
}
