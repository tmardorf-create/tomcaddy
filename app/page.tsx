"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Hole = {
  number: number;
  par: number;
};

const holes: Hole[] = [
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

export default function Home() {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [gpsActive, setGpsActive] = useState(false);
  const [status, setStatus] = useState("GPS noch nicht aktiviert");
  const [position, setPosition] = useState("");

  const selectedHole =
    holes.find((hole) => hole.number === currentHole) ?? holes[0];

  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  const difference = totalScore > 0 ? totalScore - totalPar : 0;

  useEffect(() => {
    const savedScores = localStorage.getItem("tomcaddy-scores");
    const savedHole = localStorage.getItem("tomcaddy-current-hole");
    const savedGps = localStorage.getItem("tomcaddy-gps-status");
    const savedPosition = localStorage.getItem("tomcaddy-position");

    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch {
        setScores({});
      }
    }

    if (savedHole) {
      const holeNumber = Number(savedHole);

      if (holes.some((hole) => hole.number === holeNumber)) {
        setCurrentHole(holeNumber);
      }
    }

    if (savedGps === "true") {
      setGpsActive(true);
      setStatus("GPS aktiviert");
    }

    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  function saveScore(score: number) {
    const updatedScores = {
      ...scores,
      [currentHole]: score,
    };

    setScores(updatedScores);
    localStorage.setItem(
      "tomcaddy-scores",
      JSON.stringify(updatedScores)
    );
  }

  function activateGps() {
    if (!navigator.geolocation) {
      setStatus("GPS wird von diesem Gerät nicht unterstützt.");
      return;
    }

    setStatus("GPS wird ermittelt …");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const latitude = location.coords.latitude.toFixed(5);
        const longitude = location.coords.longitude.toFixed(5);
        const newPosition = `${latitude}, ${longitude}`;

        setGpsActive(true);
        setStatus("GPS erfolgreich aktiviert");
        setPosition(newPosition);

        localStorage.setItem("tomcaddy-gps-status", "true");
        localStorage.setItem("tomcaddy-position", newPosition);
      },
      () => {
        setGpsActive(false);
        setStatus(
          "GPS konnte nicht aktiviert werden. Bitte Standortzugriff erlauben."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function resetEverything() {
    setScores({});
    setCurrentHole(1);
    setGpsActive(false);
    setStatus("GPS noch nicht aktiviert");
    setPosition("");

    localStorage.removeItem("tomcaddy-scores");
    localStorage.removeItem("tomcaddy-current-hole");
    localStorage
