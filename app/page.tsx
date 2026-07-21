"use client";

import { useEffect, useMemo, useState } from "react";

type Hole = {
  number: number;
  par: number;
};

type Scores = Record<number, string>;

const holes: Hole[] = [
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
  const [currentHole, setCurrentHole] = useState<number>(1);
  const [scores, setScores] = useState<Scores>({});
  const [gpsStatus, setGpsStatus] = useState<string>(
    "GPS nicht aktiviert"
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const currentHoleData = holes.find(
    (hole) => hole.number === currentHole
  );

  const currentScore = scores[currentHole] ?? "";

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((total, score) => {
      const numericScore = Number(score);

      if (!Number.isFinite(numericScore)) {
        return total;
      }

      return total + numericScore;
    }, 0);
  }, [scores]);

  const playedHoles = Object.values(scores).filter(
    (score) => score !== ""
  ).length;

  useEffect(() => {
    try {
      const savedScores = window.localStorage.getItem("tomcaddy-scores");
      const savedHole = window.localStorage.getItem("tomcaddy-current-hole");

      if (savedScores) {
        const parsedScores = JSON.parse(savedScores) as Scores;
        setScores(parsedScores);
      }

      if (savedHole) {
        const parsedHole = Number(savedHole);

        if (holes.some((hole) => hole.number === parsedHole)) {
          setCurrentHole(parsedHole);
        }
      }
    } catch {
      setScores({});
      setCurrentHole(1);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(
      "tomcaddy-scores",
      JSON.stringify(scores)
    );

    window.localStorage.setItem(
      "tomcaddy-current-hole",
      String(currentHole)
    );
  }, [scores, currentHole, isLoaded]);

  function updateScore(value: string) {
    if (value === "") {
      setScores((previousScores) => {
        const updatedScores = { ...previousScores };
        delete updatedScores[currentHole];
        return updatedScores;
      });

      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    setScores((previousScores) => ({
      ...previousScores,
      [currentHole]: value,
    }));
  }

  function goToPreviousHole() {
    setCurrentHole((hole) => Math.max(1, hole - 1));
  }

  function goToNextHole() {
    setCurrentHole((hole) => Math.min(holes.length, hole + 1));
  }

  function activateGps() {
    if (!("geolocation" in navigator)) {
      setGpsStatus("GPS wird von diesem Gerät nicht unterstützt");
      return;
    }

    setGpsStatus("GPS wird ermittelt ...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);

        setGpsStatus(`GPS aktiv: ${latitude}, ${longitude}`);
      },
      () => {
        setGpsStatus(
          "GPS konnte nicht aktiviert werden. Bitte Berechtigung prüfen."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function resetApp() {
    const confirmed = window.confirm(
      "Möchtest du wirklich alle gespeicherten Schläge löschen?"
    );

    if (!confirmed) {
      return;
    }

    setScores({});
    setCurrentHole(1);
    window.localStorage.removeItem("tomcaddy-scores");
    window.localStorage.removeItem("tomcaddy-current-hole");
  }

  if (!currentHoleData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-green-950 px-4 py-6 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-green-300">
            GolfPark Gudensberg
          </p>

          <h1 className="text-4xl font-bold">TomCaddy</h1>

          <p className="mt-2 text-green-200">
            Deine digitale Scorekarte
          </p>
        </header>

        <section className="mb-4 rounded-2xl bg-white p-5 text-gray-900 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktuelles Loch</p>

              <h2 className="text-3xl font-bold">
                Loch {currentHoleData.number}
              </h2>
            </div>

            <div className="rounded-xl bg-green-100 px-4 py-3 text-center text-green-900">
              <p className="text-xs uppercase">Par</p>
              <p className="text-2xl font-bold">{currentHoleData.par}</p>
            </div>
          </div>

          <label
            htmlFor="score"
            className="mb-2 block text-sm font-semibold"
          >
            Schläge
          </label>

          <input
            id="score"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={currentScore}
            onChange={(event) => updateScore(event.target.value)}
            placeholder="Schläge eingeben"
            className="w-full rounded-xl border-2 border-green-200 px-4 py-4 text-center text-3xl font-bold outline-none focus:border-green-700"
          />

          <p className="mt-2 text-center text-xs text-gray-500">
            Du kannst beliebig viele Schläge eintragen.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={goToPreviousHole}
              disabled={currentHole === 1}
              className="rounded-xl bg-gray-200 px-4 py-3 font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Zurück
            </button>

            <button
              type="button"
              onClick={goToNextHole}
              disabled={currentHole === holes.length}
              className="rounded-xl bg-green-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Weiter →
            </button>
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-green-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Scorekarte</h2>

            <div className="text-right">
              <p className="text-xs text-green-300">Gesamt</p>
              <p className="text-2xl font-bold">{totalScore}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {holes.map((hole) => {
              const isActive = hole.number === currentHole;
              const score = scores[hole.number];

              return (
                <button
                  key={hole.number}
                  type="button"
                  onClick={() => setCurrentHole(hole.number)}
                  className={`rounded-xl p-3 text-center transition ${
                    isActive
                      ? "bg-yellow-400 text-green-950"
                      : "bg-green-800 text-white hover:bg-green-700"
                  }`}
                >
                  <p className="text-xs">Loch</p>
                  <p className="text-xl font-bold">{hole.number}</p>
                  <p className="text-xs">Par {hole.par}</p>
                  <p className="mt-1 text-lg font-bold">
                    {score || "—"}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-sm text-green-200">
            {playedHoles} von {holes.length} Löchern gespielt
          </p>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-5 text-gray-900 shadow-xl">
          <h2 className="mb-3 text-xl font-bold">GPS</h2>

          <p className="mb-4 text-sm text-gray-600">{gpsStatus}</p>

          <button
            type="button"
            onClick={activateGps}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            📍 GPS aktivieren
          </button>
        </section>

        <button
          type="button"
          onClick={resetApp}
          className="w-full rounded-xl border border-green-400 px-4 py-3 text-sm text-green-200 hover:bg-green-900"
        >
          Scorekarte zurücksetzen
        </button>

        <footer className="mt-6 text-center text-xs text-green-300">
          TomCaddy · Deine Golf-App
        </footer>
      </div>
    </main>
  );
}
