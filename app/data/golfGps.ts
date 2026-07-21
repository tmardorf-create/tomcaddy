export type Coordinate = {
  lat: number;
  lng: number;
};

export type GreenTargets = {
  front: Coordinate;
  center: Coordinate;
  back: Coordinate;
};

// Vorläufige Koordinaten aus offizieller Platzkarte und Satellitenbild.
// Nach einem Test vor Ort können sie leicht korrigiert werden.
export const greenTargets: Record<number, GreenTargets> = {
  1: {
    front: { lat: 51.169965, lng: 9.346320 },
    center: { lat: 51.170280, lng: 9.346380 },
    back: { lat: 51.170550, lng: 9.346440 },
  },
  2: {
    front: { lat: 51.171585, lng: 9.348960 },
    center: { lat: 51.171720, lng: 9.348960 },
    back: { lat: 51.171900, lng: 9.348960 },
  },
  3: {
    front: { lat: 51.171090, lng: 9.345900 },
    center: { lat: 51.171270, lng: 9.345900 },
    back: { lat: 51.171450, lng: 9.345900 },
  },
  4: {
    front: { lat: 51.174065, lng: 9.353000 },
    center: { lat: 51.174200, lng: 9.353000 },
    back: { lat: 51.174335, lng: 9.353000 },
  },
  5: {
    front: { lat: 51.172805, lng: 9.345000 },
    center: { lat: 51.172940, lng: 9.345000 },
    back: { lat: 51.173075, lng: 9.345000 },
  },
  6: {
    front: { lat: 51.168480, lng: 9.345040 },
    center: { lat: 51.168660, lng: 9.345040 },
    back: { lat: 51.168840, lng: 9.345040 },
  },
  7: {
    front: { lat: 51.166680, lng: 9.348960 },
    center: { lat: 51.166860, lng: 9.348960 },
    back: { lat: 51.167040, lng: 9.348960 },
  },
  8: {
    front: { lat: 51.168975, lng: 9.345960 },
    center: { lat: 51.169155, lng: 9.345960 },
    back: { lat: 51.169335, lng: 9.345960 },
  },
  9: {
    front: { lat: 51.168255, lng: 9.348660 },
    center: { lat: 51.168390, lng: 9.348660 },
    back: { lat: 51.168525, lng: 9.348660 },
  },
};
