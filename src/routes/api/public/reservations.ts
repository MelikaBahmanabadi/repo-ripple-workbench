import { createFileRoute } from "@tanstack/react-router";
import { reservationSchema, isDateAllowed } from "@/lib/reservation";

export const Route = createFileRoute("/api/public/reservations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
        const parsed = reservationSchema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
        const r = parsed.data;
        if (!isDateAllowed(r.reservation_date)) return Response.json({ error: "Please pick a date within the next 60 days." }, { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("reservations").insert({
          ...r, email: r.email || null, area: r.area ?? null, occasion: r.occasion ?? null, notes: r.notes || null,
        }).select("id").single();
        if (error) { console.error(error); return Response.json({ error: "Could not save your reservation. Please try again." }, { status: 500 }); }
        return Response.json({ ok: true, id: data.id });
      },
    },
  },
});
