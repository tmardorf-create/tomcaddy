"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

type CaddyResponse = {
  recommendation?: string;
  error?: string;
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
      Math.atan2(
        Math.sqrt(value),
        Math.sqrt(1 - value)
      )
  );
}

function removeWhiteBackground(image: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return image.src;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];

    if (red > 235 && green > 235 && blue > 235) {
      pixels[i + 3] = 0;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}

export default function Home() {
  const [holes] = useState<Hole[]>(initialHoles);
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [position, setPosition] =
    useState<Position | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [status, setStatus] = useState(
    "GPS noch nicht aktiviert"
  );
  const [logoSource, setLogoSource] = useState(
    "/tomcaddy-logo.png"
  );

  const [distance, setDistance] = useState("");
  const [wind, setWind] = useState("Kein Wind");
  const [lie, setLie] = useState("Fairway");
  const [playerLevel, setPlayerLevel] =
    useState("Anfänger");
  const [recommendation, setRecommendation] =
    useState("");
  const [caddyLoading, setCaddyLoading] =
    useState(false);
  const [caddyError, setCaddyError] = useState("");

  const selectedHole =
    holes.find((hole) => hole.number === currentHole) ??
    holes[0];

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce(
      (sum, score) => sum + score,
      0
    );
  }, [scores]);

  const scoreDifference =
    totalScore > 0 ? totalScore - totalPar : 0;

  const distanceToGreen =
    position && selectedHole.green
      ? distanceInMeters(position, selectedHole.green)
      : null;

  useEffect(() => {
    const savedScores = localStorage.getItem(
      "tomcaddy-scores"
    );

    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "tomcaddy-scores",
      JSON.stringify(scores)
    );
  }, [scores]);

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      setLogoSource(removeWhiteBackground(image));
    };

    image.src = "/tomcaddy-logo.png";
  }, []);

  function changeScore(amount: number) {
    setScores((currentScores) => {
      const currentScore =
        currentScores[currentHole] ?? 0;

      const newScore = Math.max(
        0,
        currentScore + amount
      );

      return {
        ...currentScores,
        [currentHole]: newScore,
      };
    });
  }

  function activateGps() {
    if (!navigator.geolocation) {
      setStatus(
        "GPS wird von diesem Gerät nicht unterstützt."
      );
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

        setStatus(
          "GPS-Position erfolgreich ermittelt"
        );
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

  async function getRecommendation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCaddyLoading(true);
    setRecommendation("");
    setCaddyError("");

    try {
      const response = await fetch("/api/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance:
            distanceToGreen ?? Number(distance || 0),
          par: selectedHole.par,
          wind,
          lie,
          hole: currentHole,
          score: scores[currentHole] ?? 0,
          playerLevel,
        }),
      });

      const data: CaddyResponse =
        await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error ||
            "TomCaddy konnte nicht antworten."
        );
      }

      setRecommendation(
        data.recommendation ||
          "Keine Empfehlung erhalten."
      );
    } catch (error) {
      setCaddyError(
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler."
      );
    } finally {
      setCaddyLoading(false);
    }
  }

  function resetEverything() {
    setScores({});
    setPosition(null);
    setGpsActive(false);
    setStatus("GPS noch nicht aktiviert");
    setRecommendation("");
    localStorage.removeItem("tomcaddy-scores");
  }

  return (
    <main className="min-h-screen bg-[#06452f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex justify-center">
          <img
            src={logoSource}
            alt="TomCaddy Logo"
            className="h-48 w-48 object-contain"
          />
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

              <p className="text-sm">
                Par {selectedHole.par}
              </p>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => changeScore(-1)}
              className="rounded-2xl bg-gray-200 py-4 text-2xl font-bold text-gray-700 active:scale-95"
            >
              −
            </button>

            <button
              onClick={() => changeScore(1)}
              className="rounded-2xl bg-[#075b3b] py-4 text-2xl font-bold text-white active:scale-95"
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
            onClick={activateGps}
            className="w-full rounded-2xl bg-[#075b3b] py-3 font-semibold text-white active:scale-95"
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

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 font-bold">
            TomCaddy fragen
          </h2>

          <form onSubmit={getRecommendation}>
            <label className="mb-3 block text-sm">
              Entfernung zum Grün in Metern
              <input
                type="number"
                min="1"
                value={distance}
                onChange={(event) =>
                  setDistance(event.target.value)
                }
                placeholder="z. B. 140"
                className="mt-1 w-full rounded-xl border border-gray-300 p-3"
                required={distanceToGreen === null}
              />
            </label>

            <label className="mb-3 block text-sm">
              Wind
              <select
                value={wind}
                onChange={(event) =>
                  setWind(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-gray-300 p-3"
              >
                <option>Kein Wind</option>
                <option>Leichter Gegenwind</option>
                <option>Starker Gegenwind</option>
                <option>Rückenwind</option>
                <option>Seitenwind</option>
              </select>
            </label>

            <label className="mb-3 block text-sm">
              Lage des Balls
              <select
                value={lie}
                onChange={(event) =>
                  setLie(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-gray-300 p-3"
              >
                <option>Fairway</option>
                <option>Rough</option>
                <option>Bunker</option>
                <option>Wald</option>
                <option>Abschlag</option>
              </select>
            </label>

            <label className="block text-sm">
              Dein Spielniveau
              <select
                value={playerLevel}
                onChange={(event) =>
                  setPlayerLevel(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-gray-300 p-3"
              >
                <option>Anfänger</option>
                <option>Fortgeschritten</option>
                <option>Sehr erfahren</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={caddyLoading}
              className="mt-4 w-full rounded-2xl bg-[#075b3b] py-4 font-bold text-white active:scale-95 disabled:bg-gray-400"
            >
              {caddyLoading
                ? "TomCaddy denkt nach …"
                : "Schläger empfehlen"}
            </button>
          </form>

          {caddyError && (
            <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
              {caddyError}
            </p>
          )}

          {recommendation && (
            <div className="mt-4 rounded-2xl bg-green-50 p-4 text-gray-800">
              <h3 className="mb-2 font-bold text-[#075b3b]">
                Empfehlung
              </h3>

              <p className="whitespace-pre-line text-sm leading-relaxed">
                {recommendation}
              </p>
            </div>
          )}
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <h2 className="mb-3 font-bold">
            Bahnenübersicht
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {holes.map((hole) => (
              <button
                key={hole.number}
                onClick={() =>
                  setCurrentHole(hole.number)
                }
                className={`rounded-2xl p-3 text-center active:scale-95 ${
                  currentHole === hole.number
                    ? "bg-[#075b3b] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-xs opacity-70">
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

        <button
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
