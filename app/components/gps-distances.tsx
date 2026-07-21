"use client";

import { useState } from "react";

type Props = {
  hole: number;
};

const greenCoordinates: Record<
  number,
  { lat: number; lon: number }
> = {
  1: { lat: 51.175, lon: 9.414 },
  2: { lat: 51.176, lon: 9.415 },
  // Weitere Löcher später ergänzen
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(
    earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export default function GpsDistances({ hole }: Props) {
  const [status, setStatus] = useState("GPS noch nicht aktiviert");
  const [distance, setDistance] = useState<number | null>(null);

  function activateGps() {
    const green = greenCoordinates[hole];

    if (!navigator.geolocation) {
      setStatus("GPS wird nicht unterstützt");
      return;
    }

    if (!green) {
      setStatus(`Für Loch ${hole} sind noch keine Grün-Koordinaten hinterlegt`);
      return;
    }

    setStatus("Standort wird ermittelt...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const calculatedDistance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          green.lat,
          green.lon
        );

        setDistance(calculatedDistance);

        setStatus(
          `GPS aktiv – Genauigkeit: ${Math.round(
            position.coords.accuracy
          )} m`
        );
      },
      () => {
        setStatus("Standortzugriff wurde verweigert");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        GPS und Entfernung – Loch {hole}
      </h2>

      <p className="mt-3 text-gray-600">{status}</p>

      {distance !== null && (
        <p className="mt-4 text-center text-3xl font-bold text-[#075b3b]">
          {distance} m bis zum Grün
        </p>
      )}

      <button
        onClick={activateGps}
        className="mt-4 w-full rounded-xl bg-[#075b3b] py-3 font-bold text-white"
      >
        GPS aktivieren
      </button>
    </section>
  );
}
