import { describe, it, expect } from "vitest";
import { reservationSchema, isDateAllowed, TIME_SLOTS } from "./reservation";
const base = { full_name: "Sara", phone: "+1 503 555 0101", reservation_date: "2026-12-01", reservation_time: "18:00", party_size: 2 };
describe("reservation rules", () => {
  it("accepts a valid booking", () => expect(reservationSchema.safeParse(base).success).toBe(true));
  it("rejects more than 12 guests", () => expect(reservationSchema.safeParse({ ...base, party_size: 13 }).success).toBe(false));
  it("slots run 07:00 to 20:00", () => { expect(TIME_SLOTS[0]).toBe("07:00"); expect(TIME_SLOTS.at(-1)).toBe("20:00"); });
  it("rejects past dates and dates beyond 60 days", () => {
    const today = new Date("2026-11-27T10:00:00Z");
    expect(isDateAllowed("2026-11-26", today)).toBe(false);
    expect(isDateAllowed("2027-01-26", today)).toBe(true);
    expect(isDateAllowed("2027-01-27", today)).toBe(false);
  });
});
