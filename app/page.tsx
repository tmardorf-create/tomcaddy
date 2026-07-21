"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GpsDistances from "./components/GpsDistances";

type Hole = {
  number: number;
  par: number;
};

const initialHoles: Hole[] = [
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

const totalPar = initialHoles.reduce(
  (sum, hole) => sum + hole.par,
  0
);

export default function Home() {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});

  const selectedHole =
    initialHoles.find((hole) => hole.number === currentHole) ??
    initialHoles[0];

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce(
      (sum, score) => sum + score,
      0
    );
  }, [scores]);

  const scoreDifference =
    totalScore > 0 ? totalScore - totalPar : 0;

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem("tomcaddy-scores");
      const savedHole = localStorage.getItem("tomcaddy-current-hole");

      if (savedScores) {
        setScores(JSON.parse(savedScores));
      }

      if (savedHole) {
        const parsedHole = Number(savedHole);

        if (
          initialHoles.some(
            (hole) => hole.number === parsedHole
          )
        ) {
          setCurrentHole(parsedHole);
        }
      }
    } catch {
      setScores({});
      setCurrentHole(1);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "tomcaddy-scores",
      JSON.stringify(scores)
    );
  }, [scores]);

  useEffect(() => {
    localStorage.setItem(
      "tomcaddy-current-hole",
      String(currentHole)
    );
  }, [currentHole]);

  function changeScore(amount: number) {
    setScores((currentScores) => {
      const currentScore = currentScores[currentHole] ?? 0;
      const newScore = Math.max(0, currentScore + amount);

      return {
        ...currentScores,
        [currentHole]: newScore,
      };
    });
  }

  function setFreeScore(value: string) {
    if (value === "") {
      setScores((currentScores) => {
        const updatedScores = { ...currentScores };
        delete updatedScores[currentHole];
        return updatedScores;
      });

      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && numericValue >= 0) {
      setScores((currentScores) => ({
        ...currentScores,
        [currentHole]: numericValue,
      }));
    }
  }

  function resetEverything() {
    setScores({});
    setCurrentHole(1);
    localStorage.removeItem("tomcaddy-scores");
    localStorage.removeItem("tomcaddy-current-hole");
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <img
            src="/tomcaddy-logo-transparent.png"
            alt="TomCaddy Logo"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <div className="rounded-3xl bg-[#075b3b] p-6 text-center text-white shadow-lg">
          <p className="text-sm uppercase tracking-wide opacity-80">
            Aktuelles Loch
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Loch {currentHole}
          </h1>

          <p className="mt-2 text-lg">
            Par {selectedHole.par}
          </p>

          <div className="mt-6">
            <p className="text-sm opacity-80">Gesamtscore</p>

            <div className="text-4xl font-bold">
              {totalScore || "—"}
            </div>

            {totalScore > 0 && (
              <div className="mt-1 text-sm">
                {scoreDifference > 0
                  ? `+${scoreDifference}`
                  : scoreDifference}
              </div>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
          <h2 className="text-xl font-bold">
            Schläge auf Loch {currentHole}
          </h2>

          <div className="mt-4 text-center text-5xl font-bold text-[#075b3b]">
            {scores[currentHole] ?? 0}
          </div>

          <input
            type="number"
            min="0"
            value={scores[currentHole] ?? ""}
            onChange={(event) =>
              setFreeScore(event.target.value)
            }
            placeholder="Schlagzahl eingeben"
            className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-center text-lg text-gray-900 outline-none focus:border-[#075b3b]"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => changeScore(-1)}
              className="rounded-2xl bg-gray-200 py-4 text-2xl font-bold text-gray-700"
            >
              −
            </button>

            <button
              onClick={() => changeScore(1)}
              className="rounded-2xl bg-[#075b3b] py-4 text-2xl font-bold text-white"
            >
              +
            </button>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={`/platzkarte?loch=${currentHole}`}
            className="rounded-2xl bg-blue-100 px-4 py-4 text-center font-semibold text-blue-900"
          >
            🗺️ Platzkarte
          </Link>

          <Link
            href="/spielempfehlung"
            className="rounded-2xl bg-green-100 px-4 py-4 text-center font-semibold text-green-900"
          >
            ⛳ Spielempfehlung
          </Link>

          <Link
            href="/regelcoach"
            className="rounded-2xl bg-yellow-100 px-4 py-4 text-center font-semibold text-yellow-900"
          >
            ⚖️ Regel-Coach
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold">
            Bahnenübersicht
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {initialHoles.map((hole) => (
              <div
                key={hole.number}
                className={`rounded-2xl p-3 text-center ${
                  currentHole === hole.number
                    ? "bg-[#075b3b] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <button
                  onClick={() => setCurrentHole(hole.number)}
                  className="w-full"
                >
                  <div className="text-sm">Loch</div>

                  <div className="text-2xl font-bold">
                    {hole.number}
                  </div>

                  <div className="text-xs">
                    Par {hole.par}
                  </div>

                  <div className="mt-1 font-semibold">
                    {scores[hole.number] ?? "—"}
                  </div>
                </button>

                <Link
                  href={`/platzkarte?loch=${hole.number}`}
                  className="mt-2 block text-xs underline"
                >
                  Karte
                </Link>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={resetEverything}
          className="mt-8 w-full rounded-xl bg-red-100 py-3 font-semibold text-red-800"
        >
          Scores zurücksetzen
        </button>

        <footer className="mt-8 text-center text-sm text-gray-500">
          TomCaddy · GolfPark Gudensberg
        </footer>
      </div>
    </main>
  );
}
