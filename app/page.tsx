"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Hole = {
  number: number;
  par: number;
};

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
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [gpsActive, setGpsActive] = useState(false);
  const [status, setStatus] = useState("GPS noch nicht aktiviert");
  const [position, setPosition] = useState<string>("");

  const selectedHole =
    holes.find((hole) => hole.number === currentHole) ?? holes[0];

  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  const difference = totalScore > 0 ? totalScore - totalPar : 0;

  useEffect(() => {
    const savedScores = localStorage.getItem("tomcaddy-scores");
    const savedHole = localStorage.getItem("tomcaddy-current-hole");
    const savedGps = localStorage.getItem("tomcaddy-gps-status");
    const savedPosition = localStorage.getItem("tomcaddy-position");

    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }

    if (savedHole) {
      setCurrentHole(Number(savedHole));
    }

    if (savedGps === "true") {
      setGpsActive(true);
      setStatus("GPS aktiviert");
    }

    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

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
      setStatus("GPS wird von diesem Gerät nicht unterstützt.");
      return;
    }

    setStatus("GPS wird ermittelt …");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const latitude = location.coords.latitude.toFixed(5);
        const longitude = location.coords.longitude.toFixed(5);
        const newPosition = `${latitude}, ${longitude}`;

        setGpsActive(true);
        setStatus("GPS erfolgreich aktiviert");
        setPosition(newPosition);

        localStorage.setItem("tomcaddy-gps-status", "true");
        localStorage.setItem("tomcaddy-position", newPosition);
      },
      () => {
        setGpsActive(false);
        setStatus(
          "GPS konnte nicht aktiviert werden. Bitte Standortzugriff erlauben."
        );
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
    setCurrentHole(1);
    setGpsActive(false);
    setStatus("GPS noch nicht aktiviert");
    setPosition("");

    localStorage.removeItem("tomcaddy-scores");
    localStorage.removeItem("tomcaddy-current-hole");
    localStorage.removeItem("tomcaddy-gps-status");
    localStorage.removeItem("tomcaddy-position");
  }

  function selectHole(number: number) {
    setCurrentHole(number);
    localStorage.setItem(
      "tomcaddy-current-hole",
      String(number)
    );
  }

  return (
    <main className="min-h-screen bg-[#075b3b] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <div className="mb-2 text-5xl">🏌️</div>
          <h1 className="text-3xl font-bold">TomCaddy</h1>
          <p className="text-green-100">
            GolfPark Gudensberg
          </p>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktuelles Loch</p>
              <h2 className="text-4xl font-bold text-[#075b3b]">
                {selectedHole.number}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Par</p>
              <p className="text-3xl font-bold">
                {selectedHole.par}
              </p>
            </div>
          </div>

          <p className="mb-3 text-center text-sm text-gray-500">
            Score für Loch {currentHole} eintragen
          </p>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => saveScore(score)}
                className={`rounded-xl py-3 text-lg font-bold ${
                  scores[currentHole] === score
                    ? "bg-[#075b3b] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {score}
              </button>
            ))}
          </div>

          {scores[currentHole] && (
            <p className="mt-4 text-center font-semibold text-[#075b3b]">
              Eingetragener Score: {scores[currentHole]}
            </p>
          )}
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-4 text-lg font-bold">
            GPS und Entfernung
          </h2>

          <button
            onClick={activateGps}
            className="w-full rounded-2xl bg-[#075b3b] py-3 font-semibold text-white"
          >
            {gpsActive ? "GPS ist aktiviert" : "GPS aktivieren"}
          </button>

          <p className="mt-3 text-center text-sm text-gray-500">
            {status}
          </p>

          {position && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Standort: {position}
            </p>
          )}
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center text-gray-900 shadow-lg">
            <p className="text-sm text-gray-500">Gesamt</p>
            <p className="text-3xl font-bold text-[#075b3b]">
              {totalScore || "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center text-gray-900 shadow-lg">
            <p className="text-sm text-gray-500">Zu Par</p>
            <p className="text-3xl font-bold text-[#075b3b]">
              {totalScore ? (difference > 0 ? `+${difference}` : difference) : "—"}
            </p>
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 font-bold">Bahnenübersicht</h2>

          <div className="grid grid-cols-3 gap-2">
            {holes.map((hole) => (
              <button
                key={hole.number}
                onClick={() => selectHole(hole.number)}
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
                <div className="text-xs">Par {hole.par}</div>
                <div className="mt-1 text-lg font-bold">
                  {scores[hole.number] ?? "—"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mb-4 grid gap-3">
      <div className="mb-4 grid gap-3">
  <Link
    href="/spielempfehlung"
    className="rounded-2xl bg-white p-4 text-center font-bold text-[#075b3b] shadow-lg"
  >
    🏌️ Spielempfehlung
  </Link>

  <Link
    href="/regelcoach"
    className="rounded-2xl bg-white p-4 text-center font-bold text-[#075b3b] shadow-lg"
  >
    ⚖️ Regel-Coach
  </Link>
</div>
