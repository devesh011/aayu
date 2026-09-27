export function AayuWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 200"
      className={className}
      role="img"
      aria-label="Aayu"
    >
      <defs>
        <filter id="aayu-rough" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.4"
            numOctaves={3}
            seed={5}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="aayu-grain" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={9}
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
          />
        </filter>
        <clipPath id="aayu-word-clip">
          <text x="65" y="118" fontFamily="Georgia, serif" fontWeight={700} fontSize={82}>
            A
          </text>
          <text x="135" y="118" fontFamily="Georgia, serif" fontWeight={700} fontSize={64}>
            a
          </text>
          <text x="175" y="118" fontFamily="Georgia, serif" fontWeight={700} fontSize={64}>
            yu
          </text>
          <g transform="rotate(-35 153 78)">
            <line x1="153" y1="85" x2="150" y2="66" stroke="black" strokeWidth={6} />
            <path d="M150 72 Q168 62 160 40 Q149 54 150 72 Z" />
          </g>
        </clipPath>
      </defs>

      <g
        style={{ fill: "var(--color-clay)", stroke: "var(--color-border-brand)", strokeWidth: 2 }}
        filter="url(#aayu-rough)"
      >
        <rect x="88" y="55" width="18" height="2.5" rx="1" style={{ stroke: "none" }} />
        <rect x="178" y="77" width="72" height="2.5" rx="1" style={{ stroke: "none" }} />
        <text fontFamily="Georgia, serif" fontWeight={700} x="65" y="118" fontSize={82}>
          A
        </text>
        <text fontFamily="Georgia, serif" fontWeight={700} x="135" y="118" fontSize={64}>
          a
        </text>
        <text fontFamily="Georgia, serif" fontWeight={700} x="175" y="118" fontSize={64}>
          yu
        </text>
      </g>

      <g fill="none" stroke="var(--color-rust)" strokeWidth={1.1} strokeLinecap="round" opacity={0.85}>
        <path d="M92 46 C106 40 120 44 136 48" />
        <path d="M88 58 C104 51 118 56 134 61" />
        <path d="M94 70 C108 65 120 68 132 72" />
        <path d="M96 34 C108 39 118 38 128 43" />
        <path d="M144 28 C149 36 151 42 149 49" />
        <path d="M170 42 C161 47 156 53 151 58" />
        <path d="M172 60 C163 63 158 68 151 72" />
        <path d="M138 84 C146 87 155 86 162 81" />
      </g>

      <g
        style={{ fill: "var(--color-clay)", stroke: "var(--color-border-brand)", strokeWidth: 2 }}
        transform="rotate(-35 153 78)"
        filter="url(#aayu-rough)"
      >
        <line x1="153" y1="85" x2="150" y2="66" />
        <path d="M150 72 Q168 62 160 40 Q149 54 150 72 Z" />
      </g>

      <rect
        x="0"
        y="0"
        width="500"
        height="200"
        fill="black"
        filter="url(#aayu-grain)"
        clipPath="url(#aayu-word-clip)"
        opacity={0.55}
      />
    </svg>
  );
}
