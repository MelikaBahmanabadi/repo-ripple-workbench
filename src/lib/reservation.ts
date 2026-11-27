import { z } from "zod";

export const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 === 0 ? "00" : "30"}`;
});

export const reservationSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,19}$/),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.enum(TIME_SLOTS as [string, ...string[]]),
  party_size: z.coerce.number().int().min(1).max(12),
  area: z.enum(["Main hall", "Lounge", "Terrace", "Private room"]).optional(),
  occasion: z.enum(["None", "Birthday", "Anniversary", "Business", "Date night", "Other"]).optional(),
  notes: z.string().trim().max(500).optional(),
});

export function isDateAllowed(date: string, today = new Date()) {
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const diff = (d.getTime() - t) / 86400000;
  return diff >= 0 && diff <= 60;
}
