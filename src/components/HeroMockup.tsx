function DotCluster({ className = "" }: { className?: string }) {
  const dots = [
    [10, 10, 2.2],
    [22, 6, 1.6],
    [34, 14, 2.4],
    [46, 8, 1.4],
    [16, 24, 1.8],
    [30, 28, 2.6],
    [44, 22, 1.6],
    [56, 18, 2],
    [8, 38, 1.4],
    [24, 42, 2.2],
    [38, 40, 1.6],
    [52, 36, 2.4],
    [62, 30, 1.4],
    [14, 54, 2],
    [28, 56, 1.6],
    [42, 54, 2.2],
    [56, 50, 1.4],
    [20, 68, 1.6],
    [34, 68, 1.8],
    [48, 66, 1.4],
  ];
  return (
    <svg viewBox="0 0 70 80" className={className} aria-hidden="true">
      <g fill="var(--color-rust)">
        {dots.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            opacity={0.3 + (i % 4) * 0.12}
            className="animate-dot-pulse"
            style={{ animationDelay: `${(i % 6) * 0.4}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

function ReminderRow({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-(--color-border)/25 bg-paper px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/10 font-display text-xs text-muted sm:h-9 sm:w-9 sm:text-sm">
          ?
        </div>
        <div className="min-w-0">
          <p className="font-sans text-xs text-muted sm:text-sm">
            {placeholder}
          </p>
        </div>
      </div>
      <span className="shrink-0 whitespace-nowrap rounded-full border border-(--color-border)/15 px-2.5 py-1 font-sans text-[11px] text-muted sm:px-3 sm:text-xs">
        Wish now
      </span>
    </div>
  );
}

export function HeroMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm sm:max-w-md"
      style={{ perspective: "1400px" }}
    >
      <DotCluster className="absolute -top-6 -right-4 w-16 sm:-top-10 sm:-right-8 sm:w-28" />
      <DotCluster className="absolute -bottom-6 -left-6 w-12 opacity-70 sm:-bottom-10 sm:-left-10 sm:w-20" />

      <div
        className="relative rounded-2xl border border-(--color-border)/15 bg-paper p-1.5 shadow-[0_35px_60px_-25px_rgba(28,23,18,0.35)] transition-transform duration-500 hover:transform-[rotateX(0deg)_rotateY(0deg)] sm:p-2"
        style={{
          transform: "rotateX(8deg) rotateY(-14deg) rotateZ(1deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="flex items-center gap-1.5 border-b border-(--color-border)/10 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rust/50 sm:h-2 sm:w-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-rust/30 sm:h-2 sm:w-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-rust/20 sm:h-2 sm:w-2" />
        </div>
        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          <p className="font-sans text-[11px] tracking-[0.12em] text-muted sm:text-xs sm:tracking-[0.15em]">
            UPCOMING
          </p>
          <ReminderRow placeholder="Add someone to see them here" />
          <ReminderRow placeholder="Their birthday shows up automatically" />
          <div className="rounded-xl bg-clay/8 p-3 sm:p-4">
            <p className="font-display text-xs italic text-clay sm:text-sm">
              &ldquo;Every year, held well.&rdquo;
            </p>
            <p className="mt-1 font-sans text-[11px] text-muted sm:text-xs">
              Pick a template that fits them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
