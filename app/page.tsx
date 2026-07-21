"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Scores = Record<number, number>;

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

export default function Home() {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Scores>({});
  const [gpsStatus, setGpsStatus] = useState("GPS nicht aktiviert");

  useEffect(() => {
    const savedScores = localStorage.getItem("tomcaddy-scores");
    const savedHole = localStorage.getItem("tomcaddy-hole");

    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores) as Scores);
      } catch {
        setScores({});
      }
    }

    if (savedHole) {
      const hole = Number(savedHole);

      if (holes.some((item) => item.number === hole)) {
        setCurrentHole(hole);
      }
    }
  }, []);

  function selectHole(hole: number) {
    setCurrentHole(hole);
    localStorage.setItem("tomcaddy-hole", String(hole));
  }

  function saveScore(score: number) {
    const updatedScores = {
      ...scores,
      [currentHole]: score,
    };

    setScores(updatedScores);
    localStorage.setItem(
      "tomcaddy-scores",
      JSON.stringify(updatedScores)
    );
  }

  function activateGps() {
    if (!navigator.geolocation) {
      setGpsStatus("GPS wird nicht unterstützt");
      return;
    }

    setGpsStatus("GPS wird ermittelt ...");

    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsStatus("GPS aktiviert");
      },
      () => {
        setGpsStatus("GPS konnte nicht aktiviert werden");
      }
    );
  }

  function resetApp() {
    setScores({});
    setCurrentHole(1);
    setGpsStatus("GPS nicht aktiviert");

    localStorage.removeItem("tomcaddy-scores");
    localStorage.removeItem("tomcaddy-hole");
  }

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);

  const difference = totalScore - totalPar;

  return (
    <main className="min-h-screen bg-green-800 px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <div className="text-5xl">🏌️</div>

          <h1 className="mt-2 text-3xl font-bold">
            TomCaddy
          </h1>

          <p className="text-green-100">
            GolfPark Gudensberg
          </p>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Aktuelles Loch
              </p>

              <p className="text-5xl font-bold text-green-800">
                {currentHole}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Par
              </p>

              <p className="text-4xl font-bold">
                {holes[currentHole - 1].par}
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Score für Loch {currentHole}
          </p>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => saveScore(score)}
                className={`rounded-xl py-3 text-lg font-bold ${
                  scores[currentHole] === score
                    ? "bg-green-800 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 text-lg font-bold">
            GPS
          </h2>

          <button
            type="button"
            onClick={activateGps}
            className="w-full rounded-xl bg-green-800 py-3 font-semibold text-white"
          >
            GPS aktivieren
          </button>

          <p className="mt-3 text-center text-sm text-gray-500">
            {gpsStatus}
          </p>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center text-gray-900 shadow-lg">
            <p className="text-sm text-gray-500">
              Gesamt
            </p>

            <p className="text-3xl font-bold text-green-800">
              {totalScore || "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center text-gray-900 shadow-lg">
            <p className="text-sm text-gray-500">
              Zu Par
            </p>

            <p className="text-3xl font-bold text-green-800">
              {totalScore ? (difference > 0 ? `+${difference}` : difference) : "—"}
            </p>
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 text-lg font-bold">
            Bahnenübersicht
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {holes.map((hole) => (
              <button
                key={hole.number}
                type="button"
                onClick={() => selectHole(hole.number)}
                className={`rounded-xl p-3 ${
                  currentHole === hole.number
                    ? "bg-green-800 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-xs">
                  Loch
                </div>

                <div className="text-xl font-bold">
                  {hole.number}
                </div>

                <div className="text-xs">
                  Par {hole.par}
                </div>

                <div className="mt-1 text-lg font-bold">
                  {scores[hole.number] ?? "—"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mb-4 grid gap-3">
          <Link
            href="/spielempfehlung"
            className="rounded-xl bg-white p-4 text-center font-bold text-green-800 shadow-lg"
          >
            🏌️ Spielempfehlung
          </Link>

          <Link
            href="/regelcoach"
            className="rounded-xl bg-white p-4 text-center font-bold text-green-800 shadow-lg"
          >
            ⚖️ Regel-Coach
          </Link>
        </div>

        <button
          type="button"
          onClick={resetApp}
          className="w-full rounded-xl border border-green-200 py-3 text-sm text-green-100"
        >
          Daten zurücksetzen
        </button>

        <p className="mt-5 text-center text-xs text-green-200">
          TomCaddy · GolfPark Gudensberg
        </p>
      </div>
    </main>
  );
}
