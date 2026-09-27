// src/components/Grain.tsx
"use client";

export function Grain() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 h-screen w-screen"
      style={{ zIndex: 9999, mixBlendMode: "multiply" }}
      aria-hidden="true"
    >
      <filter id="grainFilter" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.6"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter="url(#grainFilter)"
        opacity="0.10"
      />
    </svg>
  );
}
