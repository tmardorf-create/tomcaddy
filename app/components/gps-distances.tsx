"use client";

import { useEffect, useState } from "react";

type Props = {
  hole: number;
};

type Coordinate = {
  lat: number;
  lon: number;
  accuracy: number;
};

const STORAGE_KEY = "tomcaddy-green-coordinates";

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
  const [greenCoordinates, setGreenCoordinates] = useState<
    Record<number, Coordinate>
  >({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setGreenCoordinates(JSON.parse(saved));
      } catch {
        setGreenCoordinates({});
      }
    }
  }, []);

  const savedGreen = greenCoordinates[hole];

  function getPosition(
    callback: (position: GeolocationPosition) => void
  ) {
    if (!navigator.geolocation) {
      setStatus("GPS wird nicht unterstützt");
      return;
    }

    setStatus("Standort wird ermittelt...");

    navigator.geolocation.getCurrentPosition(
      callback,
      () => {
        setStatus("Standortzugriff wurde verweigert");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  function saveGreenCoordinate() {
    getPosition((position) => {
      const coordinate: Coordinate = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
      };

      const updatedCoordinates = {
        ...greenCoordinates,
        [hole]: coordinate,
      };

      setGreenCoordinates(updatedCoordinates);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCoordinates)
      );

      setStatus(
        `Grün für Loch ${hole} gespeichert – Genauigkeit ca. ${coordinate.accuracy} m`
      );
      setDistance(0);
    });
  }

  function measureDistance() {
    if (!savedGreen) {
      setStatus(
        `Bitte zuerst die Grünposition für Loch ${hole} speichern`
      );
      return;
    }

    getPosition((position) => {
      const calculatedDistance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        savedGreen.lat,
        savedGreen.lon
      );

      setDistance(calculatedDistance);
      setStatus(
        `GPS aktiv – Genauigkeit: ${Math.round(
          position.coords.accuracy
        )} m`
      );
    });
  }

  function deleteGreenCoordinate() {
    const updatedCoordinates = { ...greenCoordinates };
    delete updatedCoordinates[hole];

    setGreenCoordinates(updatedCoordinates);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedCoordinates)
    );

    setDistance(null);
    setStatus(`Gespeicherte Position für Loch ${hole} gelöscht`);
  }

  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        GPS und Entfernung – Loch {hole}
      </h2>

      <p className="mt-3 text-gray-600">{status}</p>

      {savedGreen && (
        <p className="mt-2 text-sm text-green-700">
          Grünposition ist gespeichert.
        </p>
      )}

      {distance !== null && (
        <p className="mt-4 text-center text-3xl font-bold text-[#075b3b]">
          {distance} m bis zum Grün
        </p>
      )}

      <button
        type="button"
        onClick={saveGreenCoordinate}
        className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-bold text-white"
      >
        📍 Aktuellen Standort als Grün speichern
      </button>

      <button
        type="button"
        onClick={measureDistance}
        disabled={!savedGreen}
        className="mt-3 w-full rounded-xl bg-[#075b3b] py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        📏 Entfernung zum Grün messen
      </button>

      {savedGreen && (
        <button
          type="button"
          onClick={deleteGreenCoordinate}
          className="mt-3 w-full rounded-xl bg-red-100 py-2 text-sm font-semibold text-red-800"
        >
          Gespeicherte Grünposition löschen
        </button>
      )}
    </section>
  );
}
