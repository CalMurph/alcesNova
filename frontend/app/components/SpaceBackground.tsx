import Supernova from "./SuperNova";

function random(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

// Fixed positions keep the sky identical during server rendering and hydration.
const distantStars = Array.from({ length: 220 }, (_, index) => {
  const x = random(index * 3 + 2001) * 100;
  const y = random(index * 3 + 2002) * 100;
  const distanceFromCopy =
    ((x - 50) / 29) ** 2 + ((y - 48) / 23) ** 2;

  return {
    x,
    y,
    size: 0.7 + random(index * 3 + 2003) * 0.8,
    opacity: (0.1 + random(index + 2500) * 0.18) *
      (distanceFromCopy < 1 ? 0.45 : 1),
  };
});

const stars = Array.from({ length: 150 }, (_, index) => {
  const x = random(index * 3 + 1) * 100;
  const y = random(index * 3 + 2) * 100;
  const distanceFromCopy =
    ((x - 50) / 32) ** 2 + ((y - 50) / 27) ** 2;
  return {
    x,
    y,
    size: 0.7 + random(index * 3 + 3) * 1.25,
    opacity: (0.22 + random(index + 500) * 0.42) *
      (distanceFromCopy < 1 ? 0.28 : 1),
  };
});

const brighterStars = [
  { x: 12, y: 18, size: 2.5 },
  { x: 22, y: 79, size: 2.1 },
  { x: 87, y: 17, size: 2.3 },
  { x: 94, y: 69, size: 2.2 },
  { x: 75, y: 87, size: 1.9 },
];

export default function SpaceBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#060816]"
    >
      {distantStars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-[#b8cbed]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}

      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-[#d8e5ff]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}

      {brighterStars.map((star, index) => (
        <span
          key={index}
          className="space-star-twinkle absolute rounded-full bg-[#f5f8ff]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow: "0 0 0 2px rgba(155,184,255,0.10), 0 0 12px 3px rgba(155,184,255,0.13)",
            animationDelay: `${index * -1.9}s`,
          }}
        />
      ))}

      {/* A light veil keeps the heading and controls clear over the sky. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 42% 43% at 50% 48%, rgba(4, 7, 19, 0.65), transparent 100%)",
        }}
      />

      <Supernova />
    </div>
  );
}
