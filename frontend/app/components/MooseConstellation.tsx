import type { CSSProperties } from "react";

type Point = readonly [number, number];

// The antlers meet near the middle and fan toward the screen edges.
const leftAntler: Point[][] = [
  [[210, 306], [190, 268], [170, 229], [151, 190], [132, 154], [111, 121], [86, 98], [57, 78], [32, 59]],
  [[86, 98], [75, 66], [69, 32]],
  [[111, 121], [108, 86], [106, 49]],
  [[132, 154], [141, 114], [143, 76]],
  [[151, 190], [123, 177], [94, 176], [68, 164]],
  [[170, 229], [143, 212], [119, 207]],
  [[32, 59], [38, 85], [54, 112], [72, 130], [93, 141], [113, 149], [132, 154]],
  [[57, 78], [48, 55], [45, 39]],
];

const rightAntler = leftAntler.map((path) =>
  path.map(([x, y]) => [420 - x, y] as Point),
);

// Let the right stem wander slightly so the join feels less precise.
rightAntler[0] = [
  [210, 306], [231, 283], [244, 257], [250, 229],
  ...rightAntler[0].slice(3),
];

const antlerBranches = [
  ...leftAntler,
  ...rightAntler,
];

const stars = (() => {
  const points = new Map<string, { x: number; y: number; anchor: boolean; main: boolean }>();

  for (const [branchIndex, branch] of antlerBranches.entries()) {
    for (let index = 0; index < branch.length - 1; index++) {
      const [fromX, fromY] = branch[index];
      const [toX, toY] = branch[index + 1];
      const steps = Math.max(
        1,
        Math.ceil(Math.abs(toX - fromX) / 9),
        Math.ceil(Math.abs(toY - fromY) / 18),
      );

      for (let step = 0; step <= steps; step++) {
        const x = fromX + ((toX - fromX) * step) / steps;
        const y = fromY + ((toY - fromY) * step) / steps;
        const key = `${x.toFixed(3)}-${y.toFixed(3)}`;
        const anchor = step === 0 || step === steps;
        const main = branchIndex === 0 || branchIndex === leftAntler.length;
        const existing = points.get(key);

        points.set(key, {
          x,
          y,
          anchor: anchor || existing?.anchor || false,
          main: main || existing?.main || false,
        });
      }
    }
  }

  points.set("205-310", { x: 205, y: 310, anchor: false, main: false });
  points.set("217-300", { x: 217, y: 300, anchor: false, main: false });

  return Array.from(points.values());
})();

const brightStars = new Set([
  "57-78", "363-78", "69-32", "351-32", "143-76", "277-76", "45-39", "375-39",
]);

export default function MooseConstellation() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[34%] w-full max-w-[1600px] opacity-[0.62] sm:top-[44%] sm:w-[94vw] sm:opacity-[0.83]"
      style={{
        height: "min(clamp(190px, 38vw, 480px), 44vh)",
        transform: "translate(-50%, -92.7273%)",
      }}
    >
      {stars.map(({ x, y, anchor, main }) => {
        const bright = brightStars.has(`${Math.round(x)}-${Math.round(y)}`);
        const root = x === 210 && y === 306;
        const centerFade = Math.min(1, 0.24 + (Math.abs(x - 210) / 85) * 0.76);
        const opacity = (bright ? 1 : anchor ? 0.95 : main ? 0.82 : 0.7) * centerFade;
        const revealDelay = 500 + (Math.min(y, 306) / 306) * 1800 +
          ((Math.round(x * 13 + y * 7) % 7) - 3) * 45;

        return (
          <span
            key={`${x.toFixed(3)}-${y.toFixed(3)}`}
            className={`moose-constellation-star absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eef4ff] ${bright ? "moose-constellation-highlight" : ""}`}
            style={{
              "--moose-star-opacity": opacity,
              "--moose-reveal-delay": `${revealDelay}ms`,
              "--moose-glimmer-delay": `${5000 + (Math.round(x + y) % 5) * 650}ms`,
              left: `${2 + ((x - 32) / 356) * 96}%`,
              top: `${(y / 330) * 100}%`,
              width: root ? 2.8 : bright ? 3.8 : anchor ? 2.6 : main ? 2 : 1.7,
              height: root ? 2.8 : bright ? 3.8 : anchor ? 2.6 : main ? 2 : 1.7,
              boxShadow: bright
                ? "0 0 7px 2px rgba(160,190,255,0.48), 0 0 21px 7px rgba(114,149,235,0.22)"
                : anchor
                  ? "0 0 7px 1px rgba(160,190,255,0.28)"
                  : "none",
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
