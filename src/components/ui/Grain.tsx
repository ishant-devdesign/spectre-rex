/** Cinematic film grain — fixed SVG-noise overlay, ~5% opacity. */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="animate-grain pointer-events-none fixed -inset-[60px] z-[95] opacity-[0.05]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
