"use client";

import { useEffect, useState } from "react";
import { greenTargets, Coordinate } from "../data/golfGps";

type Props = {
  hole: number;
};

type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function distanceInMeters(
  from: Coordinate,
  to: Coordinate
): number {
  const earthRadius = 6371000;

  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  return Math.round(
    2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export default function GpsDistances({ hole }: Props) {
  const [position, setPosition] = useState<Position | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;

    if (!("geolocation" in navigator)) {
      setError("GPS wird von diesem Gerät nicht unterstützt.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (currentPosition) => {
        setPosition({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
          accuracy: currentPosition.coords.accuracy,
        });
        setError("");
      },
      () => {
        setError(
          "Standort konnte nicht ermittelt werden. Bitte GPS-Freigabe prüfen."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [active]);

  const targets = greenTargets[hole];

  function calculate(target: Coordinate) {
    if (!position) return null;

    return distanceInMeters(
      {
        lat: position.latitude,
        lng: position.longitude,
      },
      target
    );
  }

  return (
    <section className="mt-6 rounded-3xl bg-[#eaf4ef] p-5 text-[#075b3b]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">📍 GPS-Entfernungen</h2>
          <p className="text-sm">
            Aktuelles Loch: {hole}
          </p>
        </div>

        <button
          onClick={() => {
            setActive((value) => !value);
            setError("");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            active
              ? "bg-red-100 text-red-700"
              : "bg-[#075b3b] text-white"
          }`}
        >
          {active ? "GPS stoppen" : "GPS aktivieren"}
        </button>
      </div>

      {!active && (
        <p className="mt-4 text-sm text-gray-700">
          GPS wird erst nach deiner Freigabe aktiviert.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {active && position && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white p-3 text-center">
              <div className="text-xs text-gray-500">Grünanfang</div>
              <div className="text-xl font-bold">
                {calculate(targets.front)} m
              </div>
            </div>

            <div className="rounded-2xl bg-white p-3 text-center">
              <div className="text-xs text-gray-500">Grünmitte</div>
              <div className="text-xl font-bold">
                {calculate(targets.center)} m
              </div>
            </div>

            <div className="rounded-2xl bg-white p-3 text-center">
              <div className="text-xs text-gray-500">Grünende</div>
              <div className="text-xl font-bold">
                {calculate(targets.back)} m
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-600">
            GPS-Genauigkeit: ungefähr{" "}
            {Math.round(position.accuracy)} m
          </p>

          {position.accuracy > 25 && (
            <p className="mt-2 text-xs text-orange-700">
              Hinweis: Die GPS-Genauigkeit ist momentan eingeschränkt.
            </p>
          )}
        </>
      )}
    </section>
  );
}
