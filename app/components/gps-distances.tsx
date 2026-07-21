"use client";

import { useEffect, useState } from "react";

type Props = {
  hole: number;
};

type GreenPoint = {
  lat: number;
  lon: number;
  accuracy: number;
};

type HoleCoordinates = {
  front?: GreenPoint;
  middle?: GreenPoint;
  back?: GreenPoint;
};

type AllCoordinates = Record<number, HoleCoordinates>;

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

function formatDistance(distance: number | null) {
  return distance === null ? "–" : `${distance} m`;
}

export default function GpsDistances({ hole }: Props) {
  const [coordinates, setCoordinates] = useState<AllCoordinates>({});
  const [distances, setDistances] = useState({
    front: null as number | null,
    middle: null as number | null,
    back: null as number | null,
  });
  const [status, setStatus] = useState("GPS noch nicht aktiviert");
  const [isLoading, setIsLoading] = useState(false);

  const holeCoordinates = coordinates[hole] || {};

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      setCoordinates(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function getCurrentPosition(
    callback: (position: GeolocationPosition) => void
  ) {
    if (!navigator.geolocation) {
      setStatus("GPS wird von diesem Gerät nicht unterstützt.");
      return;
    }

    setIsLoading(true);
    setStatus("Standort wird ermittelt...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        callback(position);
      },
      (error) => {
        setIsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Standortzugriff wurde verweigert.");
        } else if (error.code === error.TIMEOUT) {
          setStatus("GPS-Zeitüberschreitung. Bitte erneut versuchen.");
        } else {
          setStatus("Standort konnte nicht ermittelt werden.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  function saveGreenPoint(pointType: "front" | "middle" | "back") {
    getCurrentPosition((position) => {
      const newPoint: GreenPoint = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
      };

      const updatedHoleCoordinates: HoleCoordinates = {
        ...holeCoordinates,
        [pointType]: newPoint,
      };

      const updatedCoordinates: AllCoordinates = {
        ...coordinates,
        [hole]: updatedHoleCoordinates,
      };

      setCoordinates(updatedCoordinates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCoordinates));

      const names = {
        front: "Grünanfang",
        middle: "Grünmitte",
        back: "Grünende",
      };

      setStatus(
        `${names[pointType]} für Loch ${hole} gespeichert. GPS-Genauigkeit ca. ${newPoint.accuracy} m.`
      );
    });
  }

  function measureDistances() {
    if (!Object.keys(holeCoordinates).length) {
      setStatus("Für dieses Loch wurden noch keine Grünpunkte gespeichert.");
      return;
    }

    getCurrentPosition((position) => {
      const currentLat = position.coords.latitude;
      const currentLon = position.coords.longitude;

      setDistances({
        front: holeCoordinates.front
          ? calculateDistance(
              currentLat,
              currentLon,
              holeCoordinates.front.lat,
              holeCoordinates.front.lon
            )
          : null,

        middle: holeCoordinates.middle
          ? calculateDistance(
              currentLat,
              currentLon,
              holeCoordinates.middle.lat,
              holeCoordinates.middle.lon
            )
          : null,

        back: holeCoordinates.back
          ? calculateDistance(
              currentLat,
              currentLon,
              holeCoordinates.back.lat,
              holeCoordinates.back.lon
            )
          : null,
      });

      setStatus(
        `Entfernungen aktualisiert. Eigene GPS-Genauigkeit ca. ${Math.round(
          position.coords.accuracy
        )} m.`
      );
    });
  }

  function deleteHoleCoordinates() {
    const updatedCoordinates = { ...coordinates };
    delete updatedCoordinates[hole];

    setCoordinates(updatedCoordinates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCoordinates));

    setDistances({
      front: null,
      middle: null,
      back: null,
    });

    setStatus(`Alle Grünpunkte für Loch ${hole} wurden gelöscht.`);
  }

  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-5 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        GPS-Entfernungen – Loch {hole}
      </h2>

      <p className="mt-3 text-sm text-gray-600">{status}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-gray-500">Grünanfang</div>
          <div className="mt-1 text-xl font-bold text-[#075b3b]">
            {formatDistance(distances.front)}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-gray-500">Grünmitte</div>
          <div className="mt-1 text-xl font-bold text-[#075b3b]">
            {formatDistance(distances.middle)}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-gray-500">Grünende</div>
          <div className="mt-1 text-xl font-bold text-[#075b3b]">
            {formatDistance(distances.back)}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => saveGreenPoint("front")}
          disabled={isLoading}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-50"
        >
          📍 Aktuellen Standort als Grünanfang speichern
        </button>

        <button
          type="button"
          onClick={() => saveGreenPoint("middle")}
          disabled={isLoading}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-50"
        >
          📍 Aktuellen Standort als Grünmitte speichern
        </button>

        <button
          type="button"
          onClick={() => saveGreenPoint("back")}
          disabled={isLoading}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:opacity-50"
        >
          📍 Aktuellen Standort als Grünende speichern
        </button>

        <button
          type="button"
          onClick={measureDistances}
          disabled={isLoading}
          className="w-full rounded-xl bg-[#075b3b] py-3 font-bold text-white disabled:opacity-50"
        >
          📏 Entfernungen vom aktuellen Standort messen
        </button>

        <button
          type="button"
          onClick={deleteHoleCoordinates}
          className="w-full rounded-xl bg-red-100 py-2 text-sm font-semibold text-red-800"
        >
          Gespeicherte Grünpunkte löschen
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
        <strong>Vermessung:</strong> Zum jeweiligen Punkt auf dem Grün gehen
        und dort die passende Schaltfläche drücken.
      </div>
    </section>
  );
}
