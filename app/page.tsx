"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem("tomcaddy-scores");
      const savedHole = localStorage.getItem(
        "tomcaddy-current-hole"
      );

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
    <main className="min-h-screen bg-[#06452f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex justify-center">
          <div className="h-52 w-52 overflow-hidden rounded-full">
            <img
              src="/tomcaddy-logo.png"
              alt="TomCaddy Logo"
              className="h-full w-full rounded-full object-cover"
              style={{ mixBlendMode: "multiply" }}
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
