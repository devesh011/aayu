"use client";

import TechText from "./TechText";
import { beastOfRage } from "@/lib/fonts";

export function Footer() {
  return (
    <footer
      className="w-full border-t border-(--color-border)/10"
      style={{ background: "#EAE3D3" }}
    >
      <div className="w-full px-4 sm:px-6">
        <div
          className="relative mx-auto h-22.5 w-full max-w-[1800px] sm:h-35 md:h-45 lg:h-55 xl:h-65"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 15%, rgba(0,0,0,0.6) 55%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 15%, rgba(0,0,0,0.6) 55%, transparent 100%)",
          }}
        >
          <TechText
            text="d3v8ll"
            className={beastOfRage.className}
            fontWeight={600}
            fontSize={280}
            letterSpacing={0.9}
            curve={16}
            color="#A68E5A"
            accentColor="#a15c34"
            reach={70}
            softness={0.75}
            dashLength={4}
            dashGap={2}
            strokeWidth={1.2}
            lineStyle="dashed"
            reveal="letter"
            specks={6}
            selection
            labels={true}
            draggable={true}
            sweep
            speed={0.5}
          />
        </div>
      </div>
    </footer>
  );
}
