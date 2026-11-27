import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(255) });

export const Route = createFileRoute("/api/public/newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert({ email: parsed.data.email }, { onConflict: "email", ignoreDuplicates: true });
        if (error) { console.error(error); return Response.json({ error: "Could not subscribe. Please try again." }, { status: 500 }); }
        return Response.json({ ok: true });
      },
    },
  },
});
