// Email templates for Aayu. Kept as plain functions returning HTML strings
// (not React) because email clients render raw HTML/inline-CSS, not JSX or
// external stylesheets — every element uses inline `style=""` for that reason.
//
// Each function below is a distinct visual "skin" tied to a vibe, not just
// different copy. getEmailTemplate(vibe) picks the right one so the Wish
// flow and the Templates preview both render consistently. Add a new skin
// by writing a new function here and adding one line to the map at the
// bottom — nothing else needs to change.
//
// The outer wrapper for every template is a full-width <table> with the
// background set via both `style` and the `bgcolor` attribute — not a
// <div> — since Gmail/most clients render table backgrounds far more
// reliably. Note Gmail's own desktop reading pane still caps rendered
// email content to its own fixed-width container (~700px) and centers it,
// which is separate from and unaffected by anything here.
//
// senderName has NO default. When it's missing (or is literally the brand
// name), the sign-off line is dropped or reworded so the reader never sees
// "Aayu" twice in a row — e.g. "— Aayu, via Aayu" or "SENT WITH AAYU · Aayu".
// The "Aayu · blessed by d3v8ll" footer is a brand mark, not a signature,
// so it stays in every template regardless.
//
// photoUrl is optional and must be a PUBLIC https URL (Supabase Storage,
// etc.) — email clients strip blob:/data: images. Every template renders
// a small circular photo above the greeting when photoUrl is present, and
// nothing at all when it's not.

import type { Vibe } from "@/types";

type EmailTemplateFn = (
  recipientName: string,
  message: string,
  senderName?: string,
  photoUrl?: string,
) => string;

// True only when a real sender was passed and it isn't the brand itself.
const hasSender = (s?: string): boolean =>
  !!s && s.trim() !== "" && s.trim().toLowerCase() !== "aayu";

// Shared photo block. `size` and `borderColor` let each template match its
// own palette while keeping markup identical.
const photoBlock = (
  photoUrl: string | undefined,
  recipientName: string,
  size: number,
  borderColor: string,
): string =>
  photoUrl
    ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
         <tr><td align="center">
           <img src="${photoUrl}" alt="${recipientName}" width="${size}" height="${size}"
                style="display:block; width:${size}px; height:${size}px; object-fit:cover; border-radius:50%; border:4px solid ${borderColor}; outline:none; text-decoration:none;" />
         </td></tr>
       </table>`
    : "";

export const warmFamilyTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#efeae0" style="background-color: #efeae0; font-family: Georgia, 'Times New Roman', serif;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #f4efe4; border-radius: 16px; box-shadow: 0 8px 30px rgba(28,23,18,0.12); overflow: hidden; border-collapse: collapse;">
          <tr style="background-color: #6b4a2f;">
            <td style="padding: 36px 32px 30px;" bgcolor="#6b4a2f">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: Georgia, serif; font-style: italic; font-size: 30px; color: #f4efe4; letter-spacing: 0.02em;">Aayu</span>
                    <div style="margin-top: 6px; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.18em; color: #d8c9ae; text-transform: uppercase;">Birthday Wishes</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              ${photoBlock(photoUrl, recipientName, 120, "#f4efe4")}
              <h2 style="color: #1c1712; font-family: Georgia, serif; font-weight: normal; font-size: 24px; margin: 0 0 18px;">For ${recipientName}</h2>
              <p style="font-size: 16px; color: #1c1712; line-height: 1.7; margin: 0 0 28px; white-space: pre-wrap;">${message}</p>
              <div style="height: 1px; background-color: #3c2a1a22; margin: 28px 0;"></div>
              <p style="font-size: 13px; color: #8a8378; letter-spacing: 0.05em; margin: 0;">SENT WITH AAYU${
                hasSender(senderName) ? ` &middot; ${senderName}` : ""
              }</p>
            </td>
          </tr>
          <tr style="background-color: #ebe3d5;">
            <td style="padding: 18px 32px; text-align: center;" bgcolor="#ebe3d5">
              <p style="font-size: 12px; color: #8a8378; margin: 0 0 4px;">Every year, held well.</p>
              <p style="font-size: 10px; color: #a69a86; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const funnyCloseTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fdf3e0" style="background-color: #fdf3e0; font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; box-shadow: 0 8px 30px rgba(200,100,0,0.15); overflow: hidden; border-collapse: collapse; border: 3px dashed #e08a2e;">
          <tr style="background-color: #f2a33c;">
            <td style="padding: 30px 32px;" bgcolor="#f2a33c">
              <span style="font-size: 30px; color: #ffffff; font-weight: bold;">🎉 Aayu</span>
              <div style="margin-top: 4px; font-size: 12px; color: #fff3df; letter-spacing: 0.05em;">it's someone's big day!</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${photoBlock(photoUrl, recipientName, 120, "#ffffff")}
              <h2 style="color: #d9541f; font-size: 24px; margin: 0 0 16px;">Yo ${recipientName}! 🥳</h2>
              <p style="font-size: 16px; color: #3a2c1a; line-height: 1.7; margin: 0 0 24px; white-space: pre-wrap;">${message}</p>
              <p style="font-size: 13px; color: #b5813e; margin: 0;">${
                hasSender(senderName)
                  ? `&mdash; ${senderName}, via Aayu 🎂`
                  : `&mdash; via Aayu 🎂`
              }</p>
            </td>
          </tr>
          <tr style="background-color: #fff3df;">
            <td style="padding: 14px 32px; text-align: center;" bgcolor="#fff3df">
              <p style="font-size: 10px; color: #c99a5c; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll 🎈</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const sweetTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fbeef0" style="background-color: #fbeef0; font-family: Georgia, serif;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #fff7f8; border-radius: 24px; overflow: hidden; border-collapse: collapse; box-shadow: 0 8px 30px rgba(200,120,140,0.15);">
          <tr>
            <td style="padding: 36px 36px 4px; text-align: center;">
              <span style="font-family: Georgia, serif; font-style: italic; font-size: 22px; color: #d98ca0; letter-spacing: 0.03em;">Aayu 🌸</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 36px 40px; text-align: center;">
              ${photoBlock(photoUrl, recipientName, 120, "#fff7f8")}
              <p style="font-size: 22px; font-style: italic; color: #b85c72; margin: 0 0 20px;">for ${recipientName}</p>
              <p style="font-size: 16px; color: #5c3a42; line-height: 1.8; margin: 0 0 28px; white-space: pre-wrap;">${message}</p>
              ${
                hasSender(senderName)
                  ? `<p style="font-size: 12px; color: #c99aa5; letter-spacing: 0.08em; margin: 0 0 16px;">WITH LOVE, ${senderName!.toUpperCase()}</p>`
                  : `<p style="font-size: 12px; color: #c99aa5; letter-spacing: 0.08em; margin: 0 0 16px;">WITH LOVE</p>`
              }
              <div style="height: 1px; background-color: #b85c7222; margin: 20px auto; max-width: 120px;"></div>
              <p style="font-size: 10px; color: #d9b6bf; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

// Add this to emailTemplates.ts, alongside the vibe templates. It's a
// separate, fixed template — not part of templatesByVibe — since it's a
// one-time system message, not a vibe the person picks per-send.

const introEmailTemplate = (recipientName: string, senderName?: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#efeae0" style="background-color: #efeae0; font-family: Georgia, 'Times New Roman', serif;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #f4efe4; border-radius: 16px; box-shadow: 0 8px 30px rgba(28,23,18,0.12); overflow: hidden; border-collapse: collapse;">
          <tr style="background-color: #6b4a2f;">
            <td style="padding: 36px 32px 30px;" bgcolor="#6b4a2f">
              <span style="font-family: Georgia, serif; font-style: italic; font-size: 30px; color: #f4efe4; letter-spacing: 0.02em;">Aayu</span>
              <div style="margin-top: 6px; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.18em; color: #d8c9ae; text-transform: uppercase;">A heads-up, not a birthday wish</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="color: #1c1712; font-family: Georgia, serif; font-weight: normal; font-size: 22px; margin: 0 0 18px;">Hi ${recipientName},</h2>
              <p style="font-size: 15px; color: #1c1712; line-height: 1.7; margin: 0 0 16px;">
                ${hasSenderIntro(senderName) ? senderName : "A friend"} is using a little app called Aayu to send birthday wishes &mdash; so you'll get a short note from this address whenever your birthday comes around.
              </p>
              <p style="font-size: 15px; color: #1c1712; line-height: 1.7; margin: 0 0 16px;">
                This is just a heads-up. If this message landed in Spam or Promotions, marking it &ldquo;Not spam&rdquo; (or moving it to your inbox) means future birthday notes will land properly too.
              </p>
              <p style="font-size: 15px; color: #1c1712; line-height: 1.7; margin: 0;">
                That's it &mdash; nothing to click, nothing to sign up for. See you on your birthday. 🎂
              </p>
            </td>
          </tr>
          <tr style="background-color: #ebe3d5;">
            <td style="padding: 18px 32px; text-align: center;" bgcolor="#ebe3d5">
              <p style="font-size: 10px; color: #a69a86; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

function hasSenderIntro(s?: string): boolean {
  return !!s && s.trim() !== "" && s.trim().toLowerCase() !== "aayu";
}

// Export it so the API route can use it:
export { introEmailTemplate };

export const formalTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border: 1px solid #d9d9d9; border-collapse: collapse;">
          <tr>
            <td style="padding: 28px 32px; border-bottom: 2px solid #2b3648;" bgcolor="#ffffff">
              <span style="font-size: 20px; color: #2b3648; font-weight: bold; letter-spacing: 0.02em;">Aayu</span>
              <span style="font-size: 11px; color: #8a94a3; letter-spacing: 0.1em; margin-left: 10px; text-transform: uppercase;">Correspondence</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${photoBlock(photoUrl, recipientName, 96, "#ffffff")}
              <p style="font-size: 15px; color: #1c1c1c; margin: 0 0 8px;">Dear ${recipientName},</p>
              <p style="font-size: 15px; color: #1c1c1c; line-height: 1.6; margin: 0 0 24px; white-space: pre-wrap;">${message}</p>
              <p style="font-size: 13px; color: #555555; margin: 0;">Regards,<br/>${
                hasSender(senderName) ? senderName : "Aayu"
              }</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px; border-top: 1px solid #e5e5e5; text-align: right;" bgcolor="#fafafa">
              <p style="font-size: 10px; color: #9aa3b1; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const minimalTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color: #ffffff; font-family: Georgia, serif;">
    <tr>
      <td align="center" style="padding: 48px 24px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px;">
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 13px; letter-spacing: 0.14em; color: #a68e5a; text-transform: uppercase;">Aayu</span>
            </td>
          </tr>
          <tr>
            <td style="text-align: left;">
              ${photoBlock(photoUrl, recipientName, 96, "#ffffff")}
              <p style="font-size: 16px; color: #1c1712; line-height: 1.6; margin: 0 0 20px; white-space: pre-wrap;">${recipientName} &mdash; ${message}</p>
              ${
                hasSender(senderName)
                  ? `<p style="font-size: 12px; color: #8a8378; margin: 0 0 24px;">&mdash; ${senderName}</p>`
                  : ""
              }
              <p style="font-size: 10px; color: #c4bcaa; letter-spacing: 0.05em; margin: 0;">Aayu &middot; blessed by d3v8ll</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

// Add this to emailTemplates.ts, alongside the other five template
// functions, and register it in templatesByVibe as "photo-poster".
//
// Unlike the other templates, `photoUrl` here IS the finished poster —
// text, photo, tape and rotation are already baked in by
// composePolaroidPoster(). This template just displays it inside an
// email-safe wrapper.

export const photoPosterTemplate: EmailTemplateFn = (
  recipientName,
  message,
  senderName,
  photoUrl, // the composited poster PNG's public URL
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf3e6" style="background-color:#faf3e6; font-family: Georgia, serif;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px;">
          <tr>
            <td align="center">
              ${
                photoUrl
                  ? `<img src="${photoUrl}" width="480" alt="Happy Birthday ${recipientName}" style="display:block; width:100%; max-width:480px; height:auto; border-radius:8px;" />`
                  : `<p style="font-size: 15px; color: #a04040;">Photo poster not generated yet.</p>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 8px 0;">
              <p style="font-size: 15px; color: #3a2c1a; line-height: 1.7; margin: 0; white-space: pre-wrap; text-align:center;">${message}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

// --- also update these two things in the same file ---
//
// 1. templatesByVibe:
//      "photo-poster": photoPosterTemplate,
//
// 2. Vibe union in types.ts:
//      export type Vibe = "warm-family" | "funny-close" | "sweet"
//                       | "formal" | "minimal" | "photo-poster";

const templatesByVibe: Record<Vibe, EmailTemplateFn> = {
  "warm-family": warmFamilyTemplate,
  "funny-close": funnyCloseTemplate,
  sweet: sweetTemplate,
  formal: formalTemplate,
  minimal: minimalTemplate,
  "photo-poster": photoPosterTemplate, // <-- add this line
};

const SCROLLBAR_STYLE = `
  <style>
    html { scrollbar-width: thin; scrollbar-color: #a68e5a transparent; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #a68e5a; border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: #8f7749; }
  </style>
`;

export function getEmailTemplate(vibe: Vibe): EmailTemplateFn {
  const base = templatesByVibe[vibe] ?? warmFamilyTemplate;
  return (recipientName, message, senderName, photoUrl) =>
    SCROLLBAR_STYLE + base(recipientName, message, senderName, photoUrl);
}

// Kept for backward compatibility with any existing calls.
export const birthdayWishTemplate = warmFamilyTemplate;
