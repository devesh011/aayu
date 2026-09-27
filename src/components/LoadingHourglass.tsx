"use client";

import "../components/loading-hourglass.css";

/**
 * Mini loading hourglass. Uses its OWN animation classes
 * (loader-hourglass-*), defined in loading-hourglass.css — not the
 * .hourglass-* classes in globals.css that the homepage watermark uses.
 * That way this can run on a livelier, held-pause cycle without
 * changing anything about the homepage animation.
 */
export function LoadingHourglass({ size = 72 }: { size?: number }) {
  const height = Math.round(size * (260 / 220));

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <svg
        viewBox="0 0 220 260"
        width={size}
        height={height}
        role="status"
        aria-label="Loading"
      >
        <defs>
          <pattern
            id="miniSandGrain"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="0.8"
              cy="0.8"
              r="0.35"
              fill="var(--color-clay)"
              opacity="0.9"
            />
            <circle
              cx="2.8"
              cy="1.6"
              r="0.3"
              fill="var(--color-clay)"
              opacity="0.7"
            />
            <circle
              cx="1.6"
              cy="3.0"
              r="0.3"
              fill="var(--color-clay)"
              opacity="0.8"
            />
          </pattern>
        </defs>

        <g className="loader-hourglass-rotate">
          <g
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="55" y1="30" x2="165" y2="30" />
            <line x1="55" y1="230" x2="165" y2="230" />
            <path d="M75 30 C58 55 58 85 110 130 C58 175 58 205 75 230" />
            <path d="M145 30 C162 55 162 85 110 130 C162 175 162 205 145 230" />
          </g>

          <path
            className="loader-hourglass-top-sand"
            fill="url(#miniSandGrain)"
            d="M110 128 C95 110 82 88 79 34 L141 34 C138 88 125 110 110 128 Z"
          />

          <g className="loader-hourglass-stream">
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={110 + (i % 2 === 0 ? -0.6 : 0.6)}
                cy="130"
                r="0.9"
                fill="var(--color-clay)"
                className="loader-hourglass-grain"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </g>

          <path
            className="loader-hourglass-bottom-sand"
            fill="url(#miniSandGrain)"
            d="M110 132 C95 150 82 172 79 226 L141 226 C138 172 125 150 110 132 Z"
          />
        </g>
      </svg>
      <div className="flex items-center gap-2">
        <span
          className="loader-dot-pulse h-2 w-2 rounded-full bg-[#A68E5A]"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="loader-dot-pulse h-2 w-2 rounded-full bg-[#A68E5A]"
          style={{ animationDelay: "0.3s" }}
        />
        <span
          className="loader-dot-pulse h-2 w-2 rounded-full bg-[#A68E5A]"
          style={{ animationDelay: "0.7s" }}
        />
      </div>
    </div>
  );
}
