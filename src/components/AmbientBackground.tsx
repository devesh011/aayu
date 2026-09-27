"use client";

import TechText from "@/components/TechText";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "var(--color-paper)" }}
      />

      {/* Morphing color fields — soft shapes that stretch, merge, and
          separate into each other via border-radius + blur animation.
          No dots, no repeating pattern — just slow, continuous shape
          change, like light moving through water. */}
      <div
        className="morph-a absolute"
        style={{
          width: "clamp(320px, 55vmax, 760px)",
          height: "clamp(320px, 55vmax, 760px)",
          top: "clamp(-100px, -10vh, -20px)",
          left: "clamp(-140px, -14vw, -40px)",
          background: "var(--color-rust)",
          opacity: 0.09,
          filter: "blur(60px)",
        }}
      />
      <div
        className="morph-b absolute"
        style={{
          width: "clamp(280px, 48vmax, 660px)",
          height: "clamp(280px, 48vmax, 660px)",
          bottom: "clamp(-90px, -10vh, -20px)",
          right: "clamp(-120px, -12vw, -30px)",
          background: "var(--color-clay)",
          opacity: 0.08,
          filter: "blur(70px)",
        }}
      />
      <div
        className="morph-c absolute"
        style={{
          width: "clamp(220px, 36vmax, 520px)",
          height: "clamp(220px, 36vmax, 520px)",
          top: "clamp(80px, 30vh, 260px)",
          right: "clamp(-80px, -8vw, 0px)",
          background: "var(--color-rust)",
          opacity: 0.06,
          filter: "blur(50px)",
        }}
      />

      {/* Contour lines — thin flowing strokes, like a topographic map or
          slow currents, drawn once with SVG paths and gently undulating.
          Reads as motion without any repeated dot/grain unit. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="contour-flow-1"
          d="M -100 200 Q 250 100, 500 220 T 1100 180"
          fill="none"
          stroke="var(--color-rust)"
          strokeWidth="1"
          opacity="0.12"
        />
        <path
          className="contour-flow-2"
          d="M -100 500 Q 300 420, 550 520 T 1100 480"
          fill="none"
          stroke="var(--color-clay)"
          strokeWidth="1"
          opacity="0.1"
        />
        <path
          className="contour-flow-3"
          d="M -100 780 Q 280 700, 520 800 T 1100 760"
          fill="none"
          stroke="var(--color-rust)"
          strokeWidth="1"
          opacity="0.08"
        />
      </svg>

      {/* Watermark — TechText's animated dashed-reveal wordmark, tucked
          in the corner, fully non-interactive (pointer-events-none on
          this parent already blocks its internal drag/hover handlers)
          and set low-opacity so it reads as ambient texture, not a UI
          element competing with real content. sweep=true keeps its own
          gentle idle motion going without needing pointer input. */}
      <div
        className="absolute"
        style={{
          right: "clamp(0.5rem, 2vw, 1.5rem)",
          bottom: "clamp(0.5rem, 2vw, 1.5rem)",
          width: "clamp(180px, 26vw, 360px)",
          height: "clamp(70px, 9vw, 130px)",
          opacity: 0.32,
        }}
      >
        <TechText
          text="Aayu"
          fontWeight={600}
          fontSize={90}
          letterSpacing={0.05}
          color="#1c1712"
          accentColor="#a15c34"
          reach={50}
          softness={0.75}
          dashLength={4}
          dashGap={2}
          strokeWidth={1}
          lineStyle="dashed"
          reveal="letter"
          specks={4}
          selection
          labels={true}
          draggable={true}
          sweep
          speed={0.35}
        />
      </div>
    </div>
  );
}
