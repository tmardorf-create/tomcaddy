"use client";

import { useState } from "react";
 
type Props = {
  hole: number;
};

export default function GpsDistances({ hole }: Props) {
  const [status, setStatus] = useState("GPS noch nicht aktiviert");

  function activateGps() {
    if (!navigator.geolocation) {
      setStatus("GPS wird nicht unterstützt");
      return;
    }

    setStatus("Standort wird ermittelt...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus(
          `GPS aktiv – Genauigkeit: ${Math.round(
            position.coords.accuracy
          )} m`
        );
      },
      () => {
        setStatus("Standortzugriff wurde verweigert");
      }
    );
  }

  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        GPS und Entfernung – Loch {hole}
      </h2>

      <p className="mt-3 text-gray-600">{status}</p>

      <button
        onClick={activateGps}
        className="mt-4 w-full rounded-xl bg-[#075b3b] py-3 font-bold text-white"
      >
        GPS aktivieren
      </button>
    </section>
  );
}
