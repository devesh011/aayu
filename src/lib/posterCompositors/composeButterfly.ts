// lib/posterCompositors/composeButterfly.ts
//
// "Butterfly Typographic" design. The wordmark uses Rubik Wet Paint —
// an actual bubble/liquid display font — instead of faking the melty
// look with manual per-letter rotation (that looked drunk, not stylish).
// Everything still gets flattened to one PNG server-side.
//
// SETUP: download "Rubik Wet Paint" from Google Fonts, unzip, and place
// RubikWetPaint-Regular.ttf in assets/fonts/. Restart the dev server once
// after adding it (font registration runs once per process).

import {
  createCanvas,
  GlobalFonts,
  loadImage,
  type SKRSContext2D,
} from "@napi-rs/canvas";
import path from "path";
import {
  FONT_OPTIONS,
  DEFAULT_POSTER_FONT,
  type PosterFont,
} from "../posterFonts";

const WORDMARK_FONT = "RubikWetPaint-Regular";

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;

  // Name-tag script fonts (shared with the other poster designs)
  for (const { value: name } of FONT_OPTIONS) {
    const fontPath = path.join(process.cwd(), "assets/fonts", `${name}.ttf`);
    GlobalFonts.registerFromPath(fontPath, name);
  }

  // Wordmark font — separate from the name-tag fonts, used only for the
  // "Happy Birthday" headline on this design.
  const wordmarkPath = path.join(
    process.cwd(),
    "assets/fonts",
    `${WORDMARK_FONT}.ttf`,
  );
  const ok = GlobalFonts.registerFromPath(wordmarkPath, WORDMARK_FONT);
  console.log(
    ok
      ? `[composeButterfly] registered wordmark font "${WORDMARK_FONT}"`
      : `[composeButterfly] FAILED to register "${WORDMARK_FONT}" — check ${wordmarkPath} exists`,
  );

  fontsRegistered = true;
}

const WIDTH = 800;
const HEIGHT = 1200;

// Fills text twice — once in the outline color at several tiny offsets
// (faking a thick stroke), then again on top in the fill color.
function drawOutlinedText(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  outlineColor: string,
  outlineWidth: number,
) {
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ctx.fillStyle = outlineColor;
    ctx.fillText(
      text,
      x + Math.cos(angle) * outlineWidth,
      y + Math.sin(angle) * outlineWidth,
    );
  }
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

function drawContourLines(ctx: SKRSContext2D) {
  ctx.save();
  ctx.strokeStyle = "rgba(90, 70, 50, 0.06)";
  ctx.lineWidth = 1.2;
  const lineCount = 9;
  for (let i = 0; i < lineCount; i++) {
    const baseY = (HEIGHT / lineCount) * i + 40;
    const amplitude = 18 + (i % 3) * 10;
    ctx.beginPath();
    ctx.moveTo(-20, baseY);
    for (let x = 0; x <= WIDTH + 20; x += 40) {
      const y = baseY + Math.sin(x / 90 + i) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export async function composeButterflyPoster(opts: {
  photoBuffer: Buffer;
  recipientName: string;
  fontFamily?: PosterFont;
}): Promise<Buffer> {
  ensureFonts();
  const { photoBuffer, recipientName } = opts;
  const nameFont = opts.fontFamily ?? DEFAULT_POSTER_FONT;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f7f2e9";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawContourLines(ctx);

  const purple = "#5b3fa6";
  const orange = "#f2a33c";

  // "Happy" — slight left tilt, like a wing
  ctx.save();
  ctx.translate(WIDTH / 2, 210);
  ctx.rotate(-6 * (Math.PI / 180));
  ctx.textAlign = "center";
  ctx.font = `130px ${WORDMARK_FONT}`;
  drawOutlinedText(ctx, "Happy", 0, 0, purple, orange, 3.5);
  ctx.restore();

  // "Birthday" — slight right tilt, overlapping the word above
  ctx.save();
  ctx.translate(WIDTH / 2, 340);
  ctx.rotate(4 * (Math.PI / 180));
  ctx.textAlign = "center";
  ctx.font = `104px ${WORDMARK_FONT}`;
  drawOutlinedText(ctx, "Birthday", 0, 0, purple, orange, 3);
  ctx.restore();

  // Antennae above "Happy"
  ctx.save();
  ctx.strokeStyle = purple;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 16, 130);
  ctx.quadraticCurveTo(WIDTH / 2 - 38, 90, WIDTH / 2 - 52, 74);
  ctx.moveTo(WIDTH / 2 + 16, 130);
  ctx.quadraticCurveTo(WIDTH / 2 + 38, 90, WIDTH / 2 + 52, 74);
  ctx.stroke();
  ctx.restore();

  // Tagline — exact wording from the reference, two lines
  ctx.fillStyle = orange;
  ctx.textAlign = "center";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("MAY ALL YOUR DELULU", WIDTH / 2, 470);
  ctx.fillText("COME TRULULU", WIDTH / 2, 500);

  // Photo card
  const cardW = 520;
  const cardH = 600;
  const cardX = (WIDTH - cardW) / 2;
  const cardY = 550;
  const radius = 28;

  function roundedRectPath(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  ctx.save();
  ctx.shadowColor = "rgba(91, 63, 166, 0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  roundedRectPath(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  const photoImg = await loadImage(photoBuffer);
  const pad = 14;
  const innerW = cardW - pad * 2;
  const innerH = cardH - pad * 2;
  const scale = Math.max(innerW / photoImg.width, innerH / photoImg.height);
  const drawW = photoImg.width * scale;
  const drawH = photoImg.height * scale;
  const dx = cardX + pad + (innerW - drawW) / 2;
  const dy = cardY + pad + (innerH - drawH) / 2;

  ctx.save();
  roundedRectPath(cardX + pad, cardY + pad, innerW, innerH, radius - 8);
  ctx.clip();
  ctx.drawImage(photoImg, dx, dy, drawW, drawH);
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = purple;
  roundedRectPath(cardX, cardY, cardW, cardH, radius);
  ctx.stroke();
  ctx.restore();

  // Name tag
  ctx.font = `44px ${nameFont}`;
  const nameWidth = ctx.measureText(recipientName).width;
  const tagPaddingX = 26;
  const tagW = nameWidth + tagPaddingX * 2;
  const tagH = 62;
  const tagX = cardX + cardW - tagW - 20;
  const tagY = cardY + cardH - tagH / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 12;
  roundedRectPath(tagX, tagY, tagW, tagH, tagH / 2);
  ctx.fillStyle = purple;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `44px ${nameFont}`;
  ctx.fillText(recipientName, tagX + tagW / 2, tagY + tagH / 2 + 14);

  // Footer
  const footerY = HEIGHT - 90;
  ctx.strokeStyle = purple;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 140, footerY);
  ctx.lineTo(WIDTH / 2 - 40, footerY);
  ctx.moveTo(WIDTH / 2 + 40, footerY);
  ctx.lineTo(WIDTH / 2 + 140, footerY);
  ctx.stroke();

  ctx.fillStyle = orange;
  ctx.textAlign = "center";
  ctx.font = "700 18px sans-serif";
  ctx.fillText("xoxo AAYU", WIDTH / 2, footerY + 7);

  return canvas.toBuffer("image/png");
}
