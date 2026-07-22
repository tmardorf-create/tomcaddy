"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type CaddyResponse = {
  recommendation?: string;
  error?: string;
};

const holes = [
  { number: 1, par: 3 },
  { number: 2, par: 3 },
  { number: 3, par: 3 },
  { number: 4, par: 4 },
  { number: 5, par: 4 },
  { number: 6, par: 3 },
  { number: 7, par: 3 },
  { number: 8, par: 3 },
  { number: 9, par: 3 },
];

function createShortReason(
  distance: number,
  wind: string,
  lie: string,
  playerLevel: string,
  par: number,
) {
  const reasons: string[] = [];

  if (distance >= 190) {
    reasons.push("Die große Entfernung spricht für einen Schläger mit mehr Reichweite");
  } else if (distance >= 150) {
    reasons.push("Die mittlere Distanz erfordert eine ausgewogene Kombination aus Länge und Kontrolle");
  } else if (distance >= 100) {
    reasons.push("Für diese Entfernung ist ein kontrollierter Annäherungsschlag sinnvoll");
  } else {
    reasons.push("Die kurze Distanz verlangt vor allem Präzision und Gefühl");
  }

  if (wind === "Starker Gegenwind") {
    reasons.push("wegen des starken Gegenwinds mit etwas mehr Reserve");
  } else if (wind === "Leichter Gegenwind") {
    reasons.push("weil der leichte Gegenwind die Flugweite reduziert");
  } else if (wind === "Rückenwind") {
    reasons.push("da der Rückenwind zusätzliche Länge bringt");
  } else if (wind === "Seitenwind") {
    reasons.push("um trotz Seitenwind möglichst kontrolliert zu spielen");
  } else {
    reasons.push("bei ruhigen Bedingungen mit normaler Flugkurve");
  }

  if (lie === "Rough") {
    reasons.push("Die Lage im Rough macht einen sicheren Treffmoment besonders wichtig");
  } else if (lie === "Bunker") {
    reasons.push("Aus dem Bunker steht ein kontrollierter Schlag mit ausreichendem Loft im Vordergrund");
  } else if (lie === "Wald") {
    reasons.push("Aus dem Wald sollte zunächst Sicherheit vor maximaler Länge gehen");
  } else if (lie === "Abschlag") {
    reasons.push("Vom Abschlag kann der Schlag aktiv und mit vollerem Durchschwung ausgeführt werden");
  } else {
    reasons.push("Vom Fairway aus sind Länge und Präzision gut planbar");
  }

  if (playerLevel === "Anfänger") {
    reasons.push("Für Anfänger ist dabei eine möglichst fehlerverzeihende Wahl sinnvoll");
  } else if (playerLevel === "Fortgeschritten") {
    reasons.push("Als fortgeschrittener Spieler kannst du die Distanz gezielt ausnutzen");
  } else {
    reasons.push("Mit viel Erfahrung kannst du die Flugkurve und Schlagform gezielt steuern");
  }

  if (par === 3) {
    reasons.push("Am Par 3 sollte der erste Schlag möglichst direkt auf die Fahne vorbereitet werden");
  } else {
    reasons.push("Am Par 4 ist ein guter Positionsschlag für den weiteren Verlauf entscheidend");
  }

  return `${reasons[0]}. ${reasons[1]}. ${reasons[2]}. ${reasons[3]}.`;
}

export default function Spielempfehlung() {
  const [currentHole, setCurrentHole] = useState(1);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState("");
  const [wind, setWind] = useState("Kein Wind");
  const [lie, setLie] = useState("Fairway");
  const [playerLevel, setPlayerLevel] = useState("Anfänger");
  const [recommendation, setRecommendation] = useState("");
  const [shortReason, setShortReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedHole =
    holes.find((hole) => hole.number === currentHole) ?? holes[0];

  useEffect(() => {
    const savedHole = localStorage.getItem("tomcaddy-current-hole");
    const savedScores = localStorage.getItem("tomcaddy-scores");

    if (savedHole) {
      setCurrentHole(Number(savedHole));
    }

    if (savedScores) {
      try {
        const scores = JSON.parse(savedScores);
        setScore(scores[Number(savedHole) || 1] ?? 0);
      } catch {
        setScore(0);
      }
    }
  }, []);

  async function getRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericDistance = Number(distance);

    setLoading(true);
    setError("");
    setRecommendation("");
    setShortReason("");

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance: numericDistance,
          par: selectedHole.par,
          wind,
          lie,
          hole: currentHole,
          score,
          playerLevel,
        }),
      });

      const data: CaddyResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Keine Empfehlung erhalten.");
      }

      setRecommendation(
        data.recommendation || "Keine Empfehlung erhalten.",
      );

      setShortReason(
        createShortReason(
          numericDistance,
          wind,
          lie,
          playerLevel,
          selectedHole.par,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unbekannter Fehler.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06452f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-green-100">
          ← Zurück zur Übersicht
        </Link>

        <h1 className="my-6 text-3xl font-bold">
          ⛳ Spielempfehlung
        </h1>

        <form
          onSubmit={getRecommendation}
          className="rounded-3xl bg-white p-5 text-gray-900 shadow-lg"
        >
          <label className="mb-4 block">
            Aktuelles Loch

            <select
              value={currentHole}
              onChange={(e) => setCurrentHole(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border p-3"
            >
              {holes.map((hole) => (
                <option key={hole.number} value={hole.number}>
                  Loch {hole.number} · Par {hole.par}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-4 block">
            Entfernung zum Grün in Metern

            <input
              type="number"
              min="1"
              required
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="z. B. 140"
              className="mt-1 w-full rounded-xl border p-3"
            />
          </label>

          <label className="mb-4 block">
            Wind

            <select
              value={wind}
              onChange={(e) => setWind(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            >
              <option>Kein Wind</option>
              <option>Leichter Gegenwind</option>
              <option>Starker Gegenwind</option>
              <option>Rückenwind</option>
              <option>Seitenwind</option>
            </select>
          </label>

          <label className="mb-4 block">
            Lage des Balls

            <select
              value={lie}
              onChange={(e) => setLie(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            >
              <option>Fairway</option>
              <option>Rough</option>
              <option>Bunker</option>
              <option>Wald</option>
              <option>Abschlag</option>
            </select>
          </label>

          <label className="block">
            Spielniveau

            <select
              value={playerLevel}
              onChange={(e) => setPlayerLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            >
              <option>Anfänger</option>
              <option>Fortgeschritten</option>
              <option>Sehr erfahren</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-[#075b3b] py-4 font-bold text-white disabled:bg-gray-400"
          >
            {loading
              ? "TomCaddy denkt nach …"
              : "Schläger empfehlen"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {recommendation && (
            <div className="mt-4 rounded-2xl bg-green-50 p-4 text-gray-800">
              <h2 className="mb-2 font-bold text-[#075b3b]">
                Empfehlung
              </h2>

              <p className="whitespace-pre-line text-sm">
                {recommendation}
              </p>

              {shortReason && (
                <div className="mt-4 border-t border-green-200 pt-3">
                  <h3 className="mb-1 font-bold text-[#075b3b]">
                    Kurzbegründung
                  </h3>

                  <p className="text-sm">
                    {shortReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
