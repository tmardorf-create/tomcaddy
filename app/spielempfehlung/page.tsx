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

    if (savedHole) setCurrentHole(Number(savedHole));

    if (savedScores) {
      const scores = JSON.parse(savedScores);
      setScore(scores[Number(savedHole) || 1] ?? 0);
    }
  }, []);

  async function getRecommendation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setRecommendation("");

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Keine Empfehlung erhalten."
        );
      }

      setRecommendation(
        data.recommendation || "Keine Empfehlung erhalten."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unbekannter Fehler."
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
          🏌️ Spielempfehlung
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
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
