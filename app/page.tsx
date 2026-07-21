"use client";

import { FormEvent, useState } from "react";

type CaddyResponse = {
  recommendation?: string;
  error?: string;
};

export default function Home() {
  const [distance, setDistance] = useState("140");
  const [par, setPar] = useState("4");
  const [wind, setWind] = useState("Kein Wind");
  const [lie, setLie] = useState("Fairway");
  const [hole, setHole] = useState("1");
  const [playerLevel, setPlayerLevel] = useState("Anfänger");
  const [score, setScore] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setRecommendation("");
    setError("");

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance,
          par,
          wind,
          lie,
          hole,
          score,
          playerLevel,
        }),
      });

      const data: CaddyResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "TomCaddy konnte nicht antworten.");
      }

      setRecommendation(data.recommendation || "Keine Empfehlung erhalten.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Es ist ein unbekannter Fehler aufgetreten."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <div className="mb-2 text-5xl">🏌️‍♂️</div>
          <h1 className="text-4xl font-bold tracking-tight">TomCaddy</h1>
          <p className="mt-2 text-green-100">
            Dein KI-Caddy für den Golfplatz
          </p>
          <p className="mt-1 text-sm text-green-300">
            Golfpark Gudensberg
          </p>
        </header>

        <form
          onSubmit={getRecommendation}
          className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl"
        >
          <h2 className="mb-4 text-xl font-bold">Spielsituation</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Entfernung
              </span>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full rounded-l-xl border border-slate-300 px-3 py-3 text-lg outline-none focus:border-green-600"
                  required
                />
                <span className="flex items-center rounded-r-xl bg-slate-100 px-3 text-sm">
                  m
                </span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Bahn</span>
              <input
                type="number"
                min="1"
                max="18"
                value={hole}
                onChange={(e) => setHole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 text-lg outline-none focus:border-green-600"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Par</span>
              <select
                value={par}
                onChange={(e) => setPar(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600"
              >
                <option value="3">Par 3</option>
                <option value="4">Par 4</option>
                <option value="5">Par 5</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Balllage
              </span>
              <select
                value={lie}
                onChange={(e) => setLie(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600"
              >
                <option>Fairway</option>
                <option>Rough</option>
                <option>Bunker</option>
                <option>Abschlag</option>
                <option>Gras nass</option>
                <option>Ball liegt schlecht</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold">Wind</span>
            <select
              value={wind}
              onChange={(e) => setWind(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600"
            >
              <option>Kein Wind</option>
              <option>Leichter Gegenwind</option>
              <option>Starker Gegenwind</option>
              <option>Leichter Rückenwind</option>
              <option>Starker Rückenwind</option>
              <option>Wind von links</option>
              <option>Wind von rechts</option>
            </select>
          </label>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Spielstärke
              </span>
              <select
                value={playerLevel}
                onChange={(e) => setPlayerLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600"
              >
                <option>Anfänger</option>
                <option>Hobbyspieler</option>
                <option>Fortgeschritten</option>
                <option>Sehr gut</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Aktueller Score
              </span>
              <input
                type="text"
                placeholder="z. B. +1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-green-600"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-green-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "⏳ TomCaddy denkt nach..." : "🏌️ Schläger empfehlen"}
          </button>
        </form>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-100 p-4 text-red-800">
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {recommendation && (
          <section className="mt-5 rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-green-800">
              ⛳ TomCaddys Empfehlung
            </h2>

            <div className="whitespace-pre-line rounded-2xl bg-green-50 p-4 leading-relaxed">
              {recommendation}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Hinweis: Die Empfehlung ist eine Entscheidungshilfe und ersetzt
              keine eigene Einschätzung der Spielsituation.
            </p>
          </section>
        )}

        <footer className="mt-6 text-center text-xs text-green-200">
          TomCaddy – dein digitaler Golfbegleiter
        </footer>
      </div>
    </main>
  );
}
