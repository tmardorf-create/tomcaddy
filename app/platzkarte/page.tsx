"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Hole = {
  number: number;
  par: number;
  meters: number;
  title: string;
  description: string;
};

const holes: Hole[] = [
  {
    number: 1,
    par: 3,
    meters: 119,
    title: "Schönes Spiel",
    description:
      "Ein solides Eisen sollte hier ein sicheres Bogey ermöglichen. Rechts am Abschlag lauert das Aus. Ein Wasserlauf und ein Bunker vor dem Grün erfordern einen kontrollierten Schlag.",
  },
  {
    number: 2,
    par: 3,
    meters: 95,
    title: "Der Schein trügt",
    description:
      "Die kurze Distanz täuscht. Rechts und hinter dem Grün befindet sich Aus. Links begleiten ein Bunker und ein kleines Wasserhindernis die Bahn.",
  },
  {
    number: 3,
    par: 3,
    meters: 137,
    title: "Straight on",
    description:
      "Das Fairway ist schmal. Rechts drohen Bäume und Aus, links schützt ein Bunker das kurze Grün. Hier ist ein gerader Schlag besonders wichtig.",
  },
  {
    number: 4,
    par: 4,
    meters: 330,
    title: "Die Schöne und ein Biest",
    description:
      "Das erste Par 4 bietet einen schönen Blick auf die Obernburg. Ein langes Drive macht die Landezone schmaler. Wasser und hohes Rough erschweren den Angriff.",
  },
  {
    number: 5,
    par: 4,
    meters: 314,
    title: "Grip it and Rip it!",
    description:
      "Die schwerste Bahn des Platzes. Rechts befindet sich auf der gesamten Länge Aus. Links kommen Wasser, Wald und Weidegras ins Spiel.",
  },
  {
    number: 6,
    par: 3,
    meters: 181,
    title: "Par 3 Monster",
    description:
      "Ein langes und hohes Grün erfordert einen sehr guten Schlag. Rechts begleitet ein Biotop die Bahn. Bei Wind kann dieses Loch besonders anspruchsvoll werden.",
  },
  {
    number: 7,
    par: 3,
    meters: 141,
    title: "Highway to Feld",
    description:
      "Entlang der rechten Seite befindet sich Aus und dahinter das Feld. Der beste Ansatz ist ein konzentrierter, gerader Schlag direkt auf das Grün.",
  },
  {
    number: 8,
    par: 3,
    meters: 143,
    title: "The Wall",
    description:
      "Das erhöhte Grün ist vom Abschlag nicht vollständig einsehbar. Der Anstieg spielt sich wie eine Wand. Deshalb sollte mindestens ein Schläger mehr gewählt werden.",
  },
  {
    number: 9,
    par: 3,
    meters: 108,
    title: "In the Hole!",
    description:
      "Ein schönes, aber anspruchsvolles Abschlussloch. Wasser, Bunker, Buschwerk und Aus liegen rund um das Grün. Wer die Fahne angreift, kann hier noch viel gewinnen.",
  },
];

const mapImage =
  "https://golfpark-gudensberg.de/fileadmin/user_upload/Golfplatz_Ansicht.PNG";

export default function Platzkarte() {
  const [currentHole, setCurrentHole] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hole = Number(params.get("loch"));

    if (hole >= 1 && hole <= 9) {
      setCurrentHole(hole);
    }
  }, []);

  const selectedHole =
    holes.find((hole) => hole.number === currentHole) ?? holes[0];

  function selectHole(number: number) {
    setCurrentHole(number);
    window.history.replaceState({}, "", `/platzkarte?loch=${number}`);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-[#075b3b]"
        >
          ← Zurück zur Übersicht
        </Link>

        <h1 className="text-3xl font-bold text-[#075b3b]">
          🗺️ Platzkarte
        </h1>

        <p className="mt-2 text-gray-600">
          GolfPark Gudensberg · 9-Loch-Platz
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-gray-50 shadow-sm">
          <img
            src={mapImage}
            alt="Platzkarte GolfPark Gudensberg"
            className="h-auto w-full"
          />

          <div className="p-3 text-center text-xs text-gray-500">
            Platzübersicht: GolfPark Gudensberg
          </div>
        </div>

        <h2 className="mt-8 text-xl font-bold">Loch auswählen</h2>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
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
              <div className="text-sm">Loch</div>
              <div className="text-2xl font-bold">{hole.number}</div>
              <div className="text-xs">
                Par {hole.par}
              </div>
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">
                Loch {selectedHole.number}
              </p>

              <h2 className="text-2xl font-bold text-[#075b3b]">
                {selectedHole.title}
              </h2>
            </div>

            <div className="text-right">
              <div className="font-semibold">Par {selectedHole.par}</div>
              <div className="text-sm text-gray-500">
                {selectedHole.meters} m
              </div>
            </div>
          </div>

          <p className="mt-5 leading-7 text-gray-700">
            {selectedHole.description}
          </p>

          <a
            href={mapImage}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-xl bg-[#075b3b] px-4 py-3 font-semibold text-white"
          >
            Platzkarte groß öffnen
          </a>
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          Die Platzkarte und Bahnbeschreibungen dienen als praktische
          Orientierung.
        </p>
      </div>
    </main>
  );
}
