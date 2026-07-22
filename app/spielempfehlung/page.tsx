"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type CaddyResponse = {
  recommendation?: string;
  error?: string;
};

type QuickRecommendation = {
  club: string;
  distance: number;
  note: string;
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

const clubs = [
  { name: "Driver", distance: 210 },
  { name: "Holz 3", distance: 185 },
  { name: "Hybrid", distance: 165 },
  { name: "Eisen 5", distance: 150 },
  { name: "Eisen 6", distance: 140 },
  { name: "Eisen 7", distance: 130 },
  { name: "Eisen 8", distance: 120 },
  { name: "Eisen 9", distance: 110 },
  { name: "Pitching Wedge", distance: 95 },
  { name: "Sand Wedge", distance: 70 },
];

function getQuickRecommendation(
  distance: number,
  wind: string,
  lie: string,
): QuickRecommendation | null {
  if (!distance || distance <= 0) {
    return null;
  }

  let effectiveDistance = distance;
  let note = "Normale Bedingungen";

  if (wind === "Leichter Gegenwind") {
    effectiveDistance *= 1.08;
    note = "Eine Schlägerlänge wegen Gegenwind";
  }

  if (wind === "Starker Gegenwind") {
    effectiveDistance *= 1.15;
    note = "Mehr Länge wegen starkem Gegenwind";
  }

  if (wind === "Rückenwind") {
    effectiveDistance *= 0.92;
    note = "Etwas weniger Schläger wegen Rückenwind";
  }

  if (lie === "Rough") {
    effectiveDistance *= 1.05;
    note = "Etwas mehr Länge aus dem Rough";
  }

  if (lie === "Bunker") {
    return {
      club: "Sand Wedge",
      distance: 70,
      note: "Aus dem Bunker zuerst sicher aufs Grün spielen",
    };
  }

  if (lie === "Wald") {
    return {
      club: "Hybrid",
      distance: 165,
      note: "Sicherheits-Schlag zurück aufs Fairway",
    };
  }

  const suitableClub =
    clubs.find((club) => club.distance >= effectiveDistance) ??
    clubs[clubs.length - 1];

  return {
    club: suitableClub.name,
    distance: suitableClub.distance,
    note,
  };
}

export default function Spielempfehlung() {
  const [currentHole, setCurrentHole] = useState(1);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState("");
  const [wind, setWind] = useState("Kein Wind");
  const [lie, setLie] = useState("Fairway");
  const [playerLevel, setPlayerLevel] = useState("Anfänger");

  const [quickRecommendation, setQuickRecommendation] =
    useState<QuickRecommendation | null>(null);

  const [aiRecommendation, setAiRecommendation] = useState("");
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
        const holeNumber = Number(savedHole) || 1;
        setScore(scores[holeNumber] ?? 0);
      } catch {
        setScore(0);
      }
    }
  }, []);

  function handleDistanceChange(value: string) {
    setDistance(value);
    setAiRecommendation("");
    setError("");

    const recommendation = getQuickRecommendation(
      Number(value),
      wind,
      lie,
    );

    setQuickRecommendation(recommendation);
  }

  function handleWindChange(value: string) {
    setWind(value);
    setAiRecommendation("");

    const recommendation = getQuickRecommendation(
      Number(distance),
      value,
      lie,
    );

    setQuickRecommendation(recommendation);
  }

  function handleLieChange(value: string) {
    setLie(value);
    setAiRecommendation("");

    const recommendation = getQuickRecommendation(
      Number(distance),
      wind,
      value,
    );

    setQuickRecommendation(recommendation);
  }

  async function getRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericDistance = Number(distance);

    if (!numericDistance || numericDistance <= 0) {
      setError("Bitte gib eine gültige Entfernung ein.");
      return;
    }

    const quick = getQuickRecommendation(
      numericDistance,
      wind,
      lie,
    );

    setQuickRecommendation(quick);
    setAiRecommendation("");
    setError("");
    setLoading(true);

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
        throw new Error(
          data.error || "Keine KI-Empfehlung erhalten.",
        );
      }

      setAiRecommendation(
        data.recommendation || "Keine zusätzliche Erklärung erhalten.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Die KI-Empfehlung konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-green-700"
        >
          ← Zurück zur Übersicht
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-green-950">
          ⛳ Spielempfehlung
        </h1>

        <form
          onSubmit={getRecommendation}
          className="space-y-4 rounded-2xl bg-white p-5 shadow"
        >
          <div>
            <label className="font-medium text-gray-800">
              Aktuelles Loch
            </label>

            <select
              value={currentHole}
              onChange={(event) => {
                const hole = Number(event.target.value);
                setCurrentHole(hole);
                localStorage.setItem(
                  "tomcaddy-current-hole",
                  String(hole),
                );
              }}
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
            <label className="font-medium text-gray-800">
              Entfernung zum Grün in Metern
            </label>

            <input
              type="number"
              inputMode="decimal"
              min="1"
              value={distance}
              onChange={(event) =>
                handleDistanceChange(event.target.value)
              }
              placeholder="z. B. 140"
              className="mt-1 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="font-medium text-gray-800">
              Wind
            </label>

            <select
              value={wind}
              onChange={(event) =>
                handleWindChange(event.target.value)
              }
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
            <label className="font-medium text-gray-800">
              Lage des Balls
            </label>

            <select
              value={lie}
              onChange={(event) =>
                handleLieChange(event.target.value)
              }
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
            <label className="font-medium text-gray-800">
              Spielniveau
            </label>

            <select
              value={playerLevel}
              onChange={(event) =>
                setPlayerLevel(event.target.value)
              }
              className="mt-1 w-full rounded-xl border p-3"
            >
              <option>Anfänger</option>
              <option>Fortgeschritten</option>
              <option>Sehr erfahren</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 p-3 font-bold text-white hover:bg-green-800"
          >
            {loading
              ? "KI ergänzt die Empfehlung …"
              : "Schläger empfehlen"}
          </button>
        </form>

        {quickRecommendation && (
          <section className="mt-5 rounded-2xl bg-green-700 p-5 text-white shadow">
            <p className="text-sm font-medium uppercase opacity-80">
              Sofort-Empfehlung
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              {quickRecommendation.club}
            </h2>

            <p className="mt-1 text-lg">
              Zielweite: ca. {quickRecommendation.distance} m
            </p>

            <p className="mt-3 text-sm">
              {quickRecommendation.note}
            </p>
          </section>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {aiRecommendation && (
          <section className="mt-5 rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-3 text-xl font-bold text-green-950">
              TomCaddys zusätzliche Einschätzung
            </h2>

            <p className="whitespace-pre-wrap text-gray-800">
              {aiRecommendation}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
