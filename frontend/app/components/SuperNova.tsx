const filaments = [
  { angle: -159, length: "33%", opacity: 0.32 },
  { angle: -111, length: "24%", opacity: 0.24 },
  { angle: -63, length: "29%", opacity: 0.36 },
  { angle: -14, length: "38%", opacity: 0.25 },
  { angle: 34, length: "27%", opacity: 0.31 },
  { angle: 81, length: "22%", opacity: 0.22 },
  { angle: 132, length: "31%", opacity: 0.28 },
];

export default function Supernova() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-75 sm:opacity-100">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "clamp(380px, 82vw, 780px)",
          height: "clamp(300px, 55vw, 540px)",
        }}
      >
        {/* Broad light and uneven gas clouds keep the burst from looking like a flat circle. */}
        <div
          className="absolute inset-0 rounded-full blur-[48px]"
          style={{
            background:
              "radial-gradient(ellipse 48% 42% at 40% 55%, rgba(237, 75, 156, 0.27), transparent 78%), radial-gradient(ellipse 53% 46% at 64% 42%, rgba(133, 73, 223, 0.30), transparent 80%)",
          }}
        />
        <div
          className="absolute inset-[6%] -rotate-12 blur-[20px]"
          style={{
            background:
              "radial-gradient(ellipse 29% 22% at 29% 58%, rgba(248, 112, 187, 0.32), transparent 82%), radial-gradient(ellipse 35% 19% at 62% 34%, rgba(181, 88, 228, 0.31), transparent 83%), radial-gradient(ellipse 26% 31% at 72% 65%, rgba(117, 77, 216, 0.25), transparent 80%), radial-gradient(ellipse 28% 16% at 46% 75%, rgba(232, 96, 176, 0.20), transparent 82%)",
          }}
        />

        {/* Broken arcs suggest the expanding shell without drawing a perfect ring. */}
        <div
          className="absolute inset-[11%] rotate-[14deg] rounded-full opacity-60 blur-[18px]"
          style={{
            background:
              "conic-gradient(from 12deg, transparent 0deg, rgba(251, 133, 210, 0.38) 23deg, transparent 48deg, rgba(143, 81, 231, 0.31) 78deg, transparent 109deg, rgba(240, 104, 186, 0.35) 145deg, transparent 177deg, rgba(175, 91, 229, 0.39) 214deg, transparent 242deg, rgba(247, 135, 209, 0.37) 276deg, transparent 306deg, rgba(139, 82, 216, 0.30) 339deg, transparent 360deg)",
            maskImage:
              "radial-gradient(ellipse 49% 44% at center, transparent 43%, #000 57%, transparent 73%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 49% 44% at center, transparent 43%, #000 57%, transparent 73%)",
          }}
        />

        {filaments.map(({ angle, length, opacity }) => (
          <span
            key={angle}
            className="absolute left-1/2 top-1/2 h-[3px] origin-left blur-[4px]"
            style={{
              width: length,
              opacity,
              transform: `rotate(${angle}deg)`,
              background:
                "linear-gradient(90deg, transparent, rgba(255, 171, 225, 0.52) 14%, rgba(239, 111, 199, 0.22) 46%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
