/* CJP Signal producer (canonical, server-side). Mirrors an accepted lead to Signal
   AFTER the email has been sent: the email is the lead path, Signal is the mirror,
   and Signal failing must never cost the email. Wire format: the cjp-signal SOP
   (type + slug + top-level fields). The slug and URL come from the server
   environment only -- nothing about the client is written here. Never throws. */
import { createHash } from "node:crypto";

export interface SignalLead { name: string; email: string; phone?: string; service?: string; message?: string; page?: string; renderedAt?: number }

export async function notifySignal(lead: SignalLead): Promise<"SENT" | "NOT_CONFIGURED" | "FAILED"> {
  const url = process.env.CJP_SIGNAL_INGEST_URL;
  const slug = process.env.CJP_SIGNAL_CLIENT_SLUG;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url || !slug || !site) return "NOT_CONFIGURED";
  const origin = new URL(site).origin;
  const dedupeKey = createHash("sha256").update([lead.email, lead.phone ?? "", String(lead.renderedAt ?? ""), lead.message ?? ""].join("|")).digest("hex").slice(0, 32);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ type: "lead", slug, name: lead.name, email: lead.email, phone: lead.phone || undefined, service: lead.service || undefined, message: lead.message || undefined, source: "website_form", dedupeKey, form_location: "quote-form", source_path: lead.page || undefined, site_url: origin }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok ? "SENT" : "FAILED";
  } catch {
    return "FAILED";
  }
}
