"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
      Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

export default function Home() {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [position, setPosition] = useState<Position | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [status, setStatus] = useState("GPS noch nicht aktiviert");

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

  const distanceToGreen =
    position && selectedHole.green
      ? distanceInMeters(position, selectedHole.green)
      : null;

  useEffect(() => {
    const savedScores = localStorage.getItem("tomcaddy-scores");
    const savedHole = localStorage.getItem(
      "tomcaddy-current-hole"
    );
    const savedPosition = localStorage.getItem(
      "tomcaddy-position"
    );

    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }

    if (savedHole) {
      setCurrentHole(Number(savedHole));
    }

    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
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

  useEffect(() => {
    if (position) {
      localStorage.setItem(
        "tomcaddy-position",
        JSON.stringify(position)
      );
    }
  }, [position]);

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

  function activateGps() {
    if (!navigator.geolocation) {
