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

export default function Spielempfehlung() {
  const [currentHole, setCurrentHole] = useState(1);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState("");
  const [wind, setWind] = useState("Kein Wind");
  const [lie, setLie] = useState("Fairway");
  const [playerLevel, setPlayerLevel] = useState("Anfänger");
  const [recommendation, setRecommendation] = useState("");
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

  function getLocalRecommendation() {
    const meters = Number(distance);

    if (!meters || meters <= 0) {
      return "Bitte zuerst eine gültige Entfernung eingeben.";
    }

    let club = "Eisen";

    if (meters < 80) {
      club = "Wedge";
    } else if (meters < 105) {
      club = "Pitching Wedge";
    } else if (meters < 125) {
      club = "9er-Eisen";
    } else if (meters < 145) {
      club = "8er-Eisen";
    } else if (meters < 165) {
      club = "7er-Eisen";
    } else if (meters < 185) {
      club = "6er-Eisen";
    } else {
      club = "5er-Eisen oder Hybrid";
    }

    let advice = "Ziele auf die Grünmitte.";

    if (lie === "Bunker" || lie === "Wald") {
      advice = "Spiele sicher zurück aufs Fairway.";
    } else if (lie === "Rough") {
      advice = "Nimm einen Schläger mehr und spiele kontrolliert.";
    }

    return `SCHLÄGER: ${club}
SCHLAG: Kontrollierter Schlag mit ausreichend Höhe.
ZIEL: Grünmitte
RISIKO: ${advice}
KURZBEGRÜNDUNG: Bei ${meters} m und ${wind.toLowerCase()} empfiehlt sich die sichere Variante.`;
  }

  async function getRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const localRecommendation = getLocalRecommendation();

    setRecommendation(localRecommendation);
    setError("");
    setLoading(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          distance: Number(distance),
          par: selectedHole.par,
          wind,
          lie,
          hole: currentHole,
          score,
          playerLevel,
        }),
      });

      const data: CaddyResponse = await response.json();

      if (response.ok && data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch {
      // Die lokale Empfehlung bleibt sichtbar.
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-green-700 hover:text-green-900"
        >
          ← Zurück zur Übersicht
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-green-900">
            ⛳ Spielempfehlung
          </h1>

          <form onSubmit={getRecommendation} className="space-y-5">
            <div>
              <label className="font-medium text-gray-700">
                Aktuelles Loch
              </label>

              <select
                value={currentHole}
                onChange={(event) =>
                  setCurrentHole(Number(event.target.value))
                }
                className="mt-1 w-full rounded-xl border p-3"
              >
                {holes.map((hole) => (
                  <option key={hole.number} value={hole.number}>
                    Loch {hole.number} · Par {hole.par}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700">
                Entfernung zum Grün in Metern
              </label>

              <input
                type="number"
                min="1"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
                placeholder="z. B. 140"
                className="mt-1 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Wind</label>

              <select
                value={wind}
                onChange={(event) => setWind(event.target.value)}
                className="mt-1 w-full rounded-xl border p-3"
              >
                <option>Kein Wind</option>
                <option>Leichter Gegenwind</option>
                <option>Starker Gegenwind</option>
                <option>Rückenwind</option>
                <option>Seitenwind</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700">
                Lage des Balls
              </label>

              <select
                value={lie}
                onChange={(event) => setLie(event.target.value)}
                className="mt-1 w-full rounded-xl border p-3"
              >
                <option>Fairway</option>
                <option>Rough</option>
                <option>Bunker</option>
                <option>Wald</option>
                <option>Abschlag</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700">
                Spielniveau
              </label>

              <select
                value={playerLevel}
                onChange={(event) => setPlayerLevel(event.target.value)}
                className="mt-1 w-full rounded-xl border p-3"
              >
                <option>Anfänger</option>
                <option>Fortgeschritten</option>
                <option>Sehr erfahren</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              {loading
                ? "TomCaddy denkt nach …"
                : "Schläger empfehlen"}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {recommendation && (
            <div className="mt-6 rounded-2xl bg-green-100 p-5">
              <h2 className="mb-3 text-xl font-bold text-green-900">
                🏌️ Empfehlung
              </h2>

              <p className="whitespace-pre-line text-gray-800">
                {recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
