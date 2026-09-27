import { HeroMockup } from "@/components/HeroMockup";
import { beastOfRage } from "@/lib/fonts";

function WatermarkHourglass() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="pointer-events-none absolute left-1/2 top-[40%] hidden h-[85%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.12] lg:block"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="sandGrain"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="0.8"
            cy="0.8"
            r="0.5"
            fill="var(--color-clay)"
            opacity="0.95"
          />
          <circle
            cx="2.2"
            cy="1.6"
            r="0.4"
            fill="var(--color-clay)"
            opacity="0.75"
          />
          <circle
            cx="1.4"
            cy="2.4"
            r="0.45"
            fill="var(--color-clay)"
            opacity="0.85"
          />
        </pattern>
      </defs>

      <g className="hourglass-rotate">
        <g
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="55" y1="30" x2="165" y2="30" />
          <line x1="55" y1="230" x2="165" y2="230" />
          <path d="M75 30 C58 55 58 85 110 130 C58 175 58 205 75 230" />
          <path d="M145 30 C162 55 162 85 110 130 C162 175 162 205 145 230" />
        </g>

        <path
          className="hourglass-top-sand"
          fill="url(#sandGrain)"
          d="M110 128 C95 110 82 88 79 34 L141 34 C138 88 125 110 110 128 Z"
        />

        <g className="hourglass-stream">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={110 + (i % 2 === 0 ? -0.6 : 0.6)}
              cy="130"
              r="0.9"
              fill="var(--color-clay)"
              className="hourglass-grain"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </g>

        <path
          className="hourglass-bottom-sand"
          fill="url(#sandGrain)"
          d="M110 133 C90 155 78 185 74 224 L146 224 C142 185 130 155 110 133 Z"
        />
      </g>
    </svg>
  );
}

function StippleFlowerTransition() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="mx-auto h-auto w-full max-w-sm lg:max-w-md"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="dotsSparse"
          width="2"
          height="2"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="0.5" cy="0.5" r="0.28" fill="var(--color-ink)" />
        </pattern>
        <pattern
          id="dotsDense"
          width="1.3"
          height="1.3"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="0.42" cy="0.42" r="0.26" fill="var(--color-ink)" />
        </pattern>
      </defs>

      <g>
        <circle
          className="flower-ring"
          style={{ animationDelay: "0s" }}
          cx="108"
          cy="130"
          r="26"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.7"
          strokeDasharray="0.6 2"
          opacity="0.5"
        />
        <circle
          className="flower-ring"
          style={{ animationDelay: "0.6s" }}
          cx="108"
          cy="130"
          r="44"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.65"
          strokeDasharray="0.6 2.2"
          opacity="0.4"
        />
        <circle
          className="flower-ring"
          style={{ animationDelay: "1.2s" }}
          cx="108"
          cy="130"
          r="62"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.6"
          strokeDasharray="0.6 2.4"
          opacity="0.3"
        />
        <circle
          className="flower-ring"
          style={{ animationDelay: "1.8s" }}
          cx="108"
          cy="130"
          r="80"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.55"
          strokeDasharray="0.5 2.6"
          opacity="0.2"
        />
        <circle
          className="flower-ring"
          style={{ animationDelay: "2.4s" }}
          cx="108"
          cy="130"
          r="98"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.5"
          strokeDasharray="0.5 2.8"
          opacity="0.12"
        />
      </g>

      <path
        d="M110 248 C105 210 106 165 108 130"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      <g transform="rotate(-25 86 178)">
        <g
          className="leaf-sway"
          style={{ animationDelay: "0s", transformOrigin: "86px 178px" }}
        >
          <ellipse
            cx="86"
            cy="178"
            rx="13"
            ry="4.5"
            fill="url(#dotsSparse)"
            opacity="0.7"
          />
        </g>
      </g>
      <g transform="rotate(20 130 163)">
        <g
          className="leaf-sway"
          style={{ animationDelay: "0.8s", transformOrigin: "130px 163px" }}
        >
          <ellipse
            cx="130"
            cy="163"
            rx="14"
            ry="5"
            fill="url(#dotsDense)"
            opacity="0.8"
          />
        </g>
      </g>

      <g transform="translate(108,130)">
        <g transform="rotate(150)">
          <g
            className="petal-wilt"
            style={{ animationDelay: "0s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-13"
              rx="3"
              ry="12"
              fill="url(#dotsSparse)"
              opacity="0.55"
            />
          </g>
        </g>
        <g transform="rotate(172)">
          <g
            className="petal-wilt"
            style={{ animationDelay: "0.4s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-15"
              rx="2.7"
              ry="13.5"
              fill="url(#dotsSparse)"
              opacity="0.5"
            />
          </g>
        </g>
        <g transform="rotate(196)">
          <g
            className="petal-wilt"
            style={{ animationDelay: "0.8s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-12.5"
              rx="3"
              ry="11.5"
              fill="url(#dotsSparse)"
              opacity="0.5"
            />
          </g>
        </g>
        <g transform="rotate(128)">
          <g
            className="petal-wilt"
            style={{ animationDelay: "1.2s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-10"
              rx="2.5"
              ry="9"
              fill="url(#dotsSparse)"
              opacity="0.45"
            />
          </g>
        </g>

        <g transform="rotate(-70)">
          <g
            className="petal-bloom"
            style={{ animationDelay: "0s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-16"
              rx="6"
              ry="15"
              fill="url(#dotsDense)"
              opacity="0.85"
            />
          </g>
        </g>
        <g transform="rotate(-35)">
          <g
            className="petal-bloom"
            style={{ animationDelay: "0.3s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-17"
              rx="6.5"
              ry="16"
              fill="url(#dotsDense)"
              opacity="0.9"
            />
          </g>
        </g>
        <g transform="rotate(0)">
          <g
            className="petal-bloom"
            style={{ animationDelay: "0.6s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-17.5"
              rx="6.5"
              ry="16.5"
              fill="url(#dotsDense)"
              opacity="0.95"
            />
          </g>
        </g>
        <g transform="rotate(35)">
          <g
            className="petal-bloom"
            style={{ animationDelay: "0.9s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-17"
              rx="6.5"
              ry="16"
              fill="url(#dotsDense)"
              opacity="0.9"
            />
          </g>
        </g>
        <g transform="rotate(68)">
          <g
            className="petal-bloom"
            style={{ animationDelay: "1.2s", transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy="-15"
              rx="5.5"
              ry="14"
              fill="url(#dotsDense)"
              opacity="0.8"
            />
          </g>
        </g>

        <circle cx="0" cy="0" r="5.5" fill="url(#dotsDense)" opacity="0.95" />
        <circle
          cx="0"
          cy="0"
          r="5.5"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="0.4"
          opacity="0.3"
        />
      </g>

      <g fill="var(--color-ink)">
        {[
          [61, 40, 0.8, 0.5, 0],
          [51, 52, 0.6, 0.4, 0.3],
          [64, 68, 0.9, 0.45, 0.6],
          [44, 30, 0.5, 0.3, 0.9],
          [55, 20, 0.7, 0.35, 1.2],
          [38, 65, 0.45, 0.25, 1.5],
          [69, 15, 0.55, 0.4, 1.8],
          [47, 80, 0.65, 0.3, 2.1],
          [32, 45, 0.4, 0.2, 2.4],
          [59, 90, 0.5, 0.25, 2.7],
          [73, 95, 0.75, 0.35, 3.0],
          [27, 20, 0.35, 0.15, 3.3],
          [54, 105, 0.45, 0.2, 3.6],
          [40, 100, 0.4, 0.15, 3.9],
          [78, 70, 0.65, 0.4, 4.2],
        ].map(([cx, cy, r, op, delay], i) => (
          <circle
            key={i}
            className="dust-particle"
            cx={cx}
            cy={cy}
            r={r}
            style={
              {
                animationDelay: `${delay}s`,
                ["--dx"]: `${(cx - 108) * 0.35}px`,
                ["--dy"]: `${(cy - 130) * 0.35}px`,
                opacity: op,
              } as React.CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  );
}

function TruthSection() {
  return (
    <section
      className="border-y border-(--color-border)/10 px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
      style={{ background: "#ebe3d5" }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        <StippleFlowerTransition />

        <div className="flex flex-col justify-center text-center lg:text-left">
          <p className="font-display text-5xl text-gold sm:text-6xl lg:text-7xl">
            समय
          </p>
          <p className="mt-3 font-sans text-[10px] tracking-[0.2em] text-muted sm:mt-4 sm:text-xs sm:tracking-[0.25em]">
            SAMAY — TIME
          </p>
          <blockquote className="mx-auto mt-6 max-w-md font-display text-2xl italic leading-[1.35] text-ink sm:mt-8 sm:text-3xl lg:mx-0 lg:max-w-none lg:text-4xl">
            &ldquo;You didn&apos;t get older.
            <br />
            <span className="text-rust">You got fewer.</span>
            &rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function Sprout({ scale, opacity }: { scale: number; opacity: number }) {
  const w = 20 * scale;
  const h = 28 * scale;
  return (
    <svg width={w} height={h} viewBox="0 0 20 28" style={{ opacity }}>
      <line
        x1="10"
        y1="26"
        x2="10"
        y2={28 - 6 - scale * 14}
        stroke="var(--color-rust)"
        strokeWidth="1.6"
      />
      <path
        d="M10 15 C16 10 19 9 18 4 C13 8 10 12 10 15 Z"
        fill="var(--color-clay)"
      />
      {scale > 0.5 && (
        <path
          d="M10 20 C4 16 1 13 3 8 C7 12 10 16 10 20 Z"
          fill="var(--color-clay)"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

function GrowthSequence({ className = "" }: { className?: string }) {
  const steps = [
    { scale: 0.35, opacity: 0.15 },
    { scale: 0.5, opacity: 0.25 },
    { scale: 0.65, opacity: 0.4 },
    { scale: 0.8, opacity: 0.55 },
    { scale: 0.95, opacity: 0.7 },
    { scale: 1.1, opacity: 0.85 },
  ];
  return (
    <div
      className={`pointer-events-none absolute top-0 hidden h-full flex-col-reverse items-center justify-evenly py-10 xl:flex ${className}`}
    >
      {steps.map((s, i) => (
        <Sprout key={i} scale={s.scale} opacity={s.opacity} />
      ))}
    </div>
  );
}

function DotDivider() {
  const dots = Array.from({ length: 7 });
  return (
    <div className="mx-auto flex max-w-xl items-center gap-3 py-10 opacity-70">
      {dots.map((_, i) => (
        <span key={i} className="flex flex-1 items-center gap-3">
          <span className="h-px flex-1 bg-rust/40" />
          <span className="h-1.5 w-1.5 rotate-45 bg-rust/60" />
        </span>
      ))}
      <span className="h-px w-6 bg-rust/40" />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      glyph: "१",
      title: "You add",
      body: "Add their birthday once. Takes ten seconds, no forms to dread.",
    },
    {
      num: "02",
      glyph: "२",
      title: "Aayu remembers",
      body: "It sits quietly with your other dates, untouched until it matters.",
    },
    {
      num: "03",
      glyph: "३",
      title: "You get nudged",
      body: "A reminder lands a few days before, then again on the day itself.",
    },
    {
      num: "04",
      glyph: "४",
      title: "You send something real",
      body: "Pick a template that fits them, tweak a line, and send it your way.",
    },
  ];
  return (
    <section
      id="how"
      className="border-y border-(--color-border)/10 px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-sans text-[10px] tracking-[0.18em] text-rust sm:gap-3 sm:text-xs sm:tracking-[0.25em]">
          <span className="h-px w-6 bg-rust/40 sm:w-10" />
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="sm:h-8 sm:w-8"
          >
            <path
              d="M10 2 C8 6 8 10 10 14 C12 10 12 6 10 2 Z"
              fill="var(--color-rust)"
              opacity="0.75"
            />
          </svg>
          HOW IT WORKS
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="sm:h-8 sm:w-8"
          >
            <path
              d="M10 2 C8 6 8 10 10 14 C12 10 12 6 10 2 Z"
              fill="var(--color-rust)"
              opacity="0.75"
            />
          </svg>
          <span className="h-px w-6 bg-rust/40 sm:w-10" />
        </div>
        <p className="mb-3 font-display text-base text-gold sm:mb-4 sm:text-lg">
          कार्यविधि
        </p>
        <h2 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
          From forgotten to remembered.
        </h2>

        <div className="mt-10 grid gap-8 text-left sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num}>
              <div className="flex items-center gap-2">
                <span className="font-sans text-4xl font-medium tracking-wider text-gold sm:text-5xl">
                  {step.glyph}
                </span>
                <span className="font-sans text-xs tracking-[0.15em] text-rust">
                  {step.num}
                </span>
              </div>
              <h3 className="font-display text-lg text-ink sm:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 font-sans text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <main className="relative flex-1 overflow-hidden px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:min-h-180">
        <WatermarkHourglass />
        <GrowthSequence className="left-6" />
        <GrowthSequence className="right-6 scale-x-[-1]" />

        <section className="relative mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="mb-3 font-sans text-[10px] tracking-[0.15em] text-rust sm:mb-4 sm:text-xs sm:tracking-[0.2em]">
              आयु &middot; FOR THE PEOPLE YOU DON&apos;T WANT TO FORGET
            </p>
            <h1 className="font-display text-[clamp(1.375rem,7.5vw,1.875rem)] leading-[1.1] text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
              Every year,
              <br className="hidden sm:block" />{" "}
              <span className="italic text-rust">held well.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md font-sans text-sm text-muted sm:mt-6 sm:text-base md:mx-0">
              Add the people you don&apos;t want to forget. Aayu remembers their
              birthday, nudges you ahead of time, and helps you send something
              that actually feels like you.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <a
                href="/contacts"
                className="w-full rounded-full bg-gold px-6 py-3 text-center font-sans text-sm text-paper transition-opacity hover:opacity-90 sm:w-auto"
              >
                Add your first birthday
              </a>
              <a
                href="#how"
                className="w-full rounded-full border border-(--color-border)/30 px-6 py-3 text-center font-sans text-sm text-ink transition-colors hover:bg-(--color-border)/5 sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <p className="mt-5 flex items-center justify-center text-[11px] text-muted sm:mt-6 sm:text-sm md:justify-start">
              <span>Built for one person:</span>
              <svg
                viewBox="10 -8 70 32"
                className="-ml-2.5 h-auto w-16.5 overflow-visible sm:w-17.5"
                aria-label="D3v8ll"
              >
                <path id="curve" d="M 5,22 Q 45,12 85,22" fill="transparent" />
                <text>
                  <textPath
                    href="#curve"
                    startOffset="50%"
                    textAnchor="middle"
                    className={beastOfRage.className}
                    fontSize="20"
                    fill="currentColor"
                  >
                    D3v8ll
                  </textPath>
                </text>
              </svg>
            </p>
          </div>

          <HeroMockup />
        </section>

        <DotDivider />
      </main>
      <TruthSection />
      <HowItWorks />
    </>
  );
}
