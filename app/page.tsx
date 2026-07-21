"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Position = {
  lat: number;
  lon: number;
  accuracy?: number;
};

type Hole = {
  number: number;
  par: number;
  green?: Position;
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

function distanceInMeters(start: Position, end: Position) {
  const earthRadius = 6371000;

  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const deltaLat = ((end.lat - start.lat) * Math.PI) / 180;
  const deltaLon = ((end.lon - start.lon) * Math.PI) / 180;

  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  return Math.round(
    earthRadius *
      2 *
      Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

export default function Home() {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [position, setPosition] = useState<Position | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [status, setStatus] = useState("GPS noch nicht aktiviert");

  const selectedHole =
    initialHoles.find((hole) => hole.number === currentHole) ??
    initialHoles[0];

  const totalScore = useMemo(
    () =>
      Object.values(scores).reduce(
        (sum, score) => sum + score,
        0
      ),
    [scores]
  );

  const scoreDifference =
    totalScore > 0 ? totalScore - totalPar : 0;

  const distanceToGreen =
    position && selectedHole.green
      ? distanceInMeters(position, selectedHole.green)
      : null;

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem("tomcaddy-scores");
      const savedHole = localStorage.getItem("tomcaddy-current-hole");
      const savedPosition = localStorage.getItem("tomcaddy-position");

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

      if (savedPosition) {
        setPosition(JSON.parse(savedPosition));
      }
    } catch {
      setScores({});
      setCurrentHole(1);
      setPosition(null);
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

  useEffect(() => {
    if (position) {
      localStorage.setItem(
        "tomcaddy-position",
        JSON.stringify(position)
      );
    }
  }, [position]);

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

  function activateGps() {
    if (!navigator.geolocation) {
      setStatus("GPS wird nicht unterstützt.");
      return;
    }

    setGpsActive(true);
    setStatus("GPS wird ermittelt …");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });

        setStatus("GPS-Position erfolgreich ermittelt");
        setGpsActive(false);
      },
      () => {
        setGpsActive(false);
        setStatus("GPS konnte nicht abgerufen werden.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function resetEverything() {
    setScores({});
    setPosition(null);
    setCurrentHole(1);
    setGpsActive(false);
    setStatus("GPS noch nicht aktiviert");

    localStorage.removeItem("tomcaddy-scores");
    localStorage.removeItem("tomcaddy-position");
    localStorage.removeItem("tomcaddy-current-hole");
  }

  return (
    <main className="min-h-screen bg-[#06452f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex justify-center">
          <div className="flex h-52 w-52 items-center justify-center rounded-3xl bg-white p-3 shadow-xl">
            <img
              src="/tomcaddy-logo.png"
              alt="TomCaddy Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Aktuelles Loch
              </p>

              <h1 className="text-4xl font-bold text-[#075b3b]">
                Loch {currentHole}
              </h1>

              <p>Par {selectedHole.par}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Gesamtscore
              </p>

              <p className="text-3xl font-bold text-[#075b3b]">
                {totalScore || "—"}
              </p>

              {totalScore > 0 && (
                <p className="text-xs text-gray-500">
                  {scoreDifference > 0
                    ? `+${scoreDifference}`
                    : scoreDifference}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4 rounded-2xl bg-gray-100 p-5 text-center">
            <p className="text-sm text-gray-500">
              Schläge auf Loch {currentHole}
            </p>

            <p className="text-5xl font-bold text-[#075b3b]">
              {scores[currentHole] ?? 0}
            </p>

            <input
              type="number"
              min="0"
              step="1"
              value={scores[currentHole] ?? ""}
              onChange={(event) =>
                setFreeScore(event.target.value)
              }
              placeholder="Schlagzahl eingeben"
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-center text-lg text-gray-900 outline-none focus:border-[#075b3b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => changeScore(-1)}
              className="rounded-2xl bg-gray-200 py-4 text-2xl font-bold text-gray-700"
            >
              −
            </button>

            <button
              type="button"
              onClick={() => changeScore(1)}
              className="rounded-2xl bg-[#075b3b] py-4 text-2xl font-bold text-white"
            >
              +
            </button>
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 font-bold">
            GPS und Entfernung
          </h2>

          <button
            type="button"
            onClick={activateGps}
            className="w-full rounded-2xl bg-[#075b3b] py-3 font-semibold text-white"
          >
            {gpsActive
              ? "GPS wird ermittelt …"
              : "GPS aktivieren"}
          </button>

          <p className="mt-3 text-center text-sm text-gray-500">
            {status}
          </p>

          {distanceToGreen !== null && (
            <p className="mt-2 text-center text-xl font-bold text-[#075b3b]">
              {distanceToGreen} m bis zum Grün
            </p>
          )}
        </section>

        <section className="mb-4 grid gap-3">
          <Link
            href="/spielempfehlung"
            className="rounded-2xl bg-white p-4 text-center font-bold text-[#075b3b] shadow-lg transition hover:bg-green-50"
          >
            🏌️ Spielempfehlung
          </Link>

          <Link
            href="/regelcoach"
            className="rounded-2xl bg-white p-4 text-center font-bold text-[#075b3b] shadow-lg transition hover:bg-green-50"
          >
            ⚖️ Regel-Coach
          </Link>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 font-bold">
            Bahnenübersicht
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {initialHoles.map((hole) => (
              <button
                key={hole.number}
                type="button"
                onClick={() => setCurrentHole(hole.number)}
                className={`rounded-2xl p-3 text-center ${
                  currentHole === hole.number
                    ? "bg-[#075b3b] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-xs">Loch</div>

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

        <button
          type="button"
          onClick={resetEverything}
          className="mb-4 w-full rounded-2xl border border-green-300/40 py-3 text-sm text-green-100"
        >
          Scores und GPS-Daten zurücksetzen
        </button>

        <p className="pb-4 text-center text-xs text-green-200">
          TomCaddy · GolfPark Gudensberg
        </p>
      </div>
    </main>
  );
}
