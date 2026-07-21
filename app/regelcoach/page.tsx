"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Situation =
  | "aus"
  | "verloren"
  | "rotesPenalty"
  | "gelbesPenalty"
  | "rough"
  | "unspielbar";

const situations: Record<Situation, string> = {
  aus: "Ball im Aus",
  verloren: "Ball verloren",
  rotesPenalty: "Rote Penalty Area",
  gelbesPenalty: "Gelbe Penalty Area",
  rough: "Tiefes Rough",
  unspielbar: "Ball unspielbar",
};

export default function Regelcoach() {
  const [situation, setSituation] =
    useState<Situation>("aus");
  const [strokesBefore, setStrokesBefore] = useState(1);

  const result = useMemo(() => {
    const nextStroke = (penalty: number) =>
      strokesBefore + penalty + 1;

    switch (situation) {
      case "aus":
        return {
          title: "Ball im Aus",
          recommendation:
            "Zurück zum letzten Schlag und erneut spielen. Wenn der Ball vom Abschlag ins Aus ging, ist der nächste Schlag der 3. Schlag.",
          options: [
            `Schlag und Distanzverlust: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            "Falls die lokale Regel E-5 gilt: Erleichterung auf der Fairway-Seite mit 2 Strafschlägen.",
          ],
        };

      case "verloren":
        return {
          title: "Ball verloren",
          recommendation:
            "Wenn kein Ball innerhalb von drei Minuten gefunden wird, gilt er als verloren. Vom letzten Schlag aus weiterspielen.",
          options: [
            `Schlag und Distanzverlust: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            "Provisorischen Ball spielen, wenn der ursprüngliche Ball möglicherweise verloren oder im Aus ist.",
          ],
        };

      case "rotesPenalty":
        return {
          title: "Rote Penalty Area",
          recommendation:
            "Wenn der Ball spielbar liegt, kann er ohne Strafe gespielt werden. Meist ist die seitliche Erleichterung die praktischste Option.",
          options: [
            "Ball spielen, wie er liegt: 0 Strafschläge",
            `Seitliche Erleichterung innerhalb von zwei Schlägerlängen: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            `Auf der Linie zurück: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            `Zurück zum letzten Schlag: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
          ],
        };

      case "gelbesPenalty":
        return {
          title: "Gelbe Penalty Area",
          recommendation:
            "Seitliche Erleichterung gibt es bei einer gelben Penalty Area normalerweise nicht. Prüfe zuerst, ob der Ball spielbar ist.",
          options: [
            "Ball spielen, wie er liegt: 0 Strafschläge",
            `Auf der Linie zurück: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            `Zurück zum letzten Schlag: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
          ],
        };

      case "rough":
        return {
          title: "Ball im tiefen Rough",
          recommendation:
            "Wenn der Ball spielbar ist, ohne Strafschlag weiterspielen. Einen sicheren Schläger wählen und keinen unnötigen Risiko-Schlag versuchen.",
          options: [
            "Ball spielen, wie er liegt: 0 Strafschläge",
            `Ball für unspielbar erklären: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
          ],
        };

      case "unspielbar":
        return {
          title: "Ball unspielbar",
          recommendation:
            "Außerhalb einer Penalty Area darfst du den Ball für unspielbar erklären. Die seitliche Erleichterung ist häufig die praktischste Möglichkeit.",
          options: [
            `Zurück zum letzten Schlag: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            `Auf der Linie zurück: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
            `Seitliche Erleichterung innerhalb von zwei Schlägerlängen: 1 Strafschlag · nächster Schlag: ${nextStroke(1)}`,
          ],
        };
    }
  }, [situation, strokesBefore]);

  return (
    <main className="min-h-screen bg-[#06452f] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-green-100">
          ← Zurück zur Übersicht
        </Link>

        <h1 className="my-6 text-3xl font-bold">
          ⚖️ Regel-Coach
        </h1>

        <section className="rounded-3xl bg-white p-5 text-gray-900 shadow-lg">
          <label className="mb-4 block">
            Was ist passiert?
            <select
              value={situation}
              onChange={(e) =>
                setSituation(e.target.value as Situation)
              }
              className="mt-1 w-full rounded-xl border p-3"
            >
              {Object.entries(situations).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="mb-5 block">
            Bereits gespielte Schläge auf diesem Loch
            <input
              type="number"
              min="1"
              value={strokesBefore}
              onChange={(e) =>
                setStrokesBefore(Number(e.target.value))
              }
              className="mt-1 w-full rounded-xl border p-3"
            />
          </label>

          <div className="rounded-2xl bg-green-50 p-4">
            <h2 className="text-xl font-bold text-[#075b3b]">
              {result.title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-800">
              {result.recommendation}
            </p>
          </div>

          <h3 className="mb-2 mt-5 font-bold">
            Deine Möglichkeiten
          </h3>

          <div className="space-y-2">
            {result.options.map((option) => (
              <div
                key={option}
                className="rounded-xl bg-gray-100 p-3 text-sm text-gray-800"
              >
                {option}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-gray-500">
            Hinweis: Der Regel-Coach dient als praktische
            Orientierung und ersetzt keine offizielle
            Regelentscheidung.
          </p>
        </section>
      </div>
    </main>
  );
}
