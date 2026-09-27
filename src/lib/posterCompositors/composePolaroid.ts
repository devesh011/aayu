// lib/composePolaroid.ts
//
// Renders the "Polaroid" birthday poster (tilted taped photo, script
// headline, script name, footer rule) as ONE flattened PNG. This is what
// gets emailed — not live HTML/CSS — because rotation, drop-shadows, and
// script fonts don't render consistently across email clients.
//
// Uses @napi-rs/canvas (native, serverless-friendly — no system
// dependencies like node-canvas needs). Install with:
//   npm install @napi-rs/canvas
//
// FONT: place your downloaded Google Font .ttf files in assets/fonts/,
// named to match the `value` entries in lib/posterFonts.ts. The font used
// per call is passed in as a parameter — see composePolaroidPoster below —
// so callers (the API route, ultimately WishModal's dropdown) choose it,
// rather than it being hardcoded here.

import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import path from "path";
import {
  FONT_OPTIONS,
  DEFAULT_POSTER_FONT,
  type PosterFont,
} from "../posterFonts";

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  for (const { value: name } of FONT_OPTIONS) {
    const fontPath = path.join(process.cwd(), "assets/fonts", `${name}.ttf`);
    const ok = GlobalFonts.registerFromPath(fontPath, name);
    console.log(
      ok
        ? `[composePolaroid] registered font "${name}"`
        : `[composePolaroid] FAILED to register "${name}" — check ${fontPath} exists`,
    );
  }
  fontsRegistered = true;
}

const WIDTH = 800;
const HEIGHT = 1200;

export async function composePolaroidPoster(opts: {
  photoBuffer: Buffer;
  recipientName: string;
  fontFamily?: PosterFont;
  // Optional AI-generated background art (no people/faces — see
  // /api/generate-poster-background). The real uploaded photo is always
  // composited on top afterward by this same code, never regenerated.
  backgroundImageBuffer?: Buffer;
}): Promise<Buffer> {
  ensureFonts();
  const { photoBuffer, recipientName, backgroundImageBuffer } = opts;
  const fontFamily = opts.fontFamily ?? DEFAULT_POSTER_FONT;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background — an AI-generated image if one was provided, cover-fit to
  // the full canvas; otherwise the original flat color fill.
  if (backgroundImageBuffer) {
    const bgImg = await loadImage(backgroundImageBuffer);
    const scale = Math.max(WIDTH / bgImg.width, HEIGHT / bgImg.height);
    const drawW = bgImg.width * scale;
    const drawH = bgImg.height * scale;
    const dx = (WIDTH - drawW) / 2;
    const dy = (HEIGHT - drawH) / 2;
    ctx.drawImage(bgImg, dx, dy, drawW, drawH);
  } else {
    ctx.fillStyle = "#faf3e6";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Outer thin border frame
  const inset = 40;
  ctx.strokeStyle = "#6b83a0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);

  // Header script text
  ctx.fillStyle = "#5b7692";
  ctx.textAlign = "center";
  ctx.font = `84px ${fontFamily}`;
  ctx.fillText("Happy Birthday", WIDTH / 2, 190);

  // Load the uploaded photo
  const photoImg = await loadImage(photoBuffer);

  const polaroidW = 520;
  const polaroidH = 640;
  const photoInnerW = polaroidW - 40;
  const photoInnerH = polaroidH - 120; // extra bottom margin = classic polaroid look

  const polaroidX = (WIDTH - polaroidW) / 2;
  const polaroidY = 320;
  const rotation = -4 * (Math.PI / 180);

  ctx.save();
  ctx.translate(polaroidX + polaroidW / 2, polaroidY + polaroidH / 2);
  ctx.rotate(rotation);
  ctx.translate(-polaroidW / 2, -polaroidH / 2);

  // Polaroid card (white, with shadow)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, polaroidW, polaroidH);
  ctx.restore();

  // Photo — cover-fit crop into the inner window
  const innerX = 20;
  const innerY = 20;
  const scale = Math.max(
    photoInnerW / photoImg.width,
    photoInnerH / photoImg.height,
  );
  const drawW = photoImg.width * scale;
  const drawH = photoImg.height * scale;
  const dx = innerX + (photoInnerW - drawW) / 2;
  const dy = innerY + (photoInnerH - drawH) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(innerX, innerY, photoInnerW, photoInnerH);
  ctx.clip();
  ctx.drawImage(photoImg, dx, dy, drawW, drawH);
  ctx.restore();

  // Tape strip, top-left corner
  ctx.save();
  ctx.translate(30, 10);
  ctx.rotate(-28 * (Math.PI / 180));
  ctx.fillStyle = "rgba(220,220,220,0.55)";
  ctx.fillRect(-45, -14, 90, 28);
  ctx.restore();

  ctx.restore(); // end polaroid rotation group

  // Name, script font, lower-right under the polaroid
  ctx.fillStyle = "#5b7692";
  ctx.font = `56px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.fillText(
    recipientName,
    polaroidX + polaroidW,
    polaroidY + polaroidH + 70,
  );

  // Footer rule + brand line
  const footerY = HEIGHT - 110;
  ctx.strokeStyle = "#6b83a0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 140, footerY);
  ctx.lineTo(WIDTH / 2 - 40, footerY);
  ctx.moveTo(WIDTH / 2 + 40, footerY);
  ctx.lineTo(WIDTH / 2 + 140, footerY);
  ctx.stroke();

  ctx.fillStyle = "#8fa2b8";
  ctx.textAlign = "center";
  ctx.font = `20px ${fontFamily}`;
  ctx.fillText("xoxo AAYU", WIDTH / 2, footerY + 8);

  return canvas.toBuffer("image/png");
}
