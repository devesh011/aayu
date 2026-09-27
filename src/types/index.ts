export type Vibe =
  | "warm-family"
  | "funny-close"
  | "sweet"
  | "formal"
  | "minimal"
  | "photo-poster";

export type Channel = "email" | "whatsapp" | "instagram" | "snapchat";

export interface Contact {
  id: string;
  name: string;
  nickname?: string;
  birthDate: string; // ISO date, e.g. "1998-04-12"
  relationship: string; // e.g. "Mom", "College friend", "Cousin"
  vibe: Vibe;
  phone?: string; // used to build wa.me deep links — never expose client-side unencrypted
  email?: string;
  photoUrl?: string;
  introSentAt?: string; // <-- add this line
  preferredChannels: Channel[];
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  vibe: Vibe;
  subject: string; // supports {{name}} placeholder
  body: string; // supports {{name}}, {{relationship}} placeholders
}

export interface NotificationLogEntry {
  id: string;
  contactId: string;
  daysBefore: 7 | 1 | 0;
  sentAt: string;
}

/** Fills {{placeholder}} tokens in a template string with contact data. */
export function renderTemplate(text: string, contact: Contact): string {
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, contact.nickname || contact.name)
    .replace(/\{\{\s*relationship\s*\}\}/gi, contact.relationship);
}
