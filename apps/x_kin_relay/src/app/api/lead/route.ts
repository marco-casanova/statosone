import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const Lead = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  locale: z.string().min(2).max(5),
});

export async function POST(req: Request) {
  const form = await req.formData(); // handles <form action=... method=POST>
  const parsed = Lead.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    locale: req.headers.get("x-kin-locale") ?? "de",
  });
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) {
    // Dev fallback: don’t fail hard if env not configured
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("leads").insert(parsed.data);
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );

  return NextResponse.redirect(new URL("/thanks", req.url));
}
