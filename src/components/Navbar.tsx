"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/contacts", label: "People" },
  { href: "/photos", label: "Photos" },
  { href: "/generate", label: "AI Messages" }, // <-- add this
  { href: "/templates", label: "Templates" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <g
        stroke="#AD9767"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="transition-transform duration-300"
      >
        <line
          x1="3"
          y1={open ? "11" : "6"}
          x2="19"
          y2={open ? "11" : "6"}
          style={{
            transformOrigin: "11px 11px",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        />
        <line
          x1="3"
          y1="11"
          x2="19"
          y2="11"
          style={{
            opacity: open ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        />
        <line
          x1="3"
          y1={open ? "11" : "16"}
          x2="19"
          y2={open ? "11" : "16"}
          style={{
            transformOrigin: "11px 11px",
            transform: open ? "rotate(-45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        />
      </g>
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 border-b border-border-brand/15 backdrop-blur-sm"
      style={{ background: "var(--color-paper)" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 sm:py-2">
        {/* Brand lockup: hourglass icon + wordmark, treated as one joined mark */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/aayu-icon-very-thick.png"
            alt=""
            width={446}
            height={840}
            priority
            className="h-8 w-auto shrink-0 sm:h-10"
          />
          <Image
            src="/aayu-wordmark-dark-accents.svg"
            alt="Aayu"
            width={215}
            height={152}
            priority
            className="-ml-3 h-10 w-auto sm:-ml-3 sm:h-12"
          />
        </Link>

        <ul className="hidden items-center gap-6 font-display text-sm italic text-ink sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition-colors hover:text-rust"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-var(--color-border)/5 sm:hidden"
        >
          <MenuIcon open={open} />
        </button>
      </nav>

      {/* Mobile dropdown panel — stronger glass effect */}
      <div
        className={`absolute left-0 right-0 top-full overflow-hidden border-b-2 border-rust/20 bg-paper/90 shadow-[0_12px_30px_-12px_rgba(28,23,18,0.25)] backdrop-blur-xl transition-[max-height] duration-300 ease-in-out sm:hidden ${
          open ? "max-h-40" : "max-h-0"
        }`}
      >
        <div className="border-t border-var(--color-border)/15" />
        <ul className="flex flex-col font-display text-sm italic text-ink">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 transition-colors hover:bg-var(--color-border)/10 hover:text-var(--color-rust)"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
