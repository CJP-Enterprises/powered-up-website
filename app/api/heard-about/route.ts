import { NextResponse } from "next/server";
import { cleanDetail, crmTarget, isHeardAbout, openLeadToken } from "@/lib/heardAbout";

/**
 * POST /api/heard-about  {answer, detail?, token}  (CJP wave 5 kit, 2026-11-16)
 *
 * The thank-you page's optional "How did you hear about us?" answer. Opens the
 * sealed token the lead route issued (lib/heardAbout.ts), then forwards
 * {lead_id, answer, detail} to the CRM server to server with the lead forward's
 * key. The CRM keeps one answer per lead. Always answers small and generic:
 * the browser learns nothing about the lead.
 */

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => t > now - WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const raw = await req.text().catch(() => "");
  if (raw.length > 2000) return NextResponse.json({ ok: false }, { status: 413 });
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b || typeof b !== "object" || !isHeardAbout(b.answer)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const leadId = openLeadToken(b.token);
  if (!leadId) return NextResponse.json({ ok: false }, { status: 400 });
  const target = crmTarget();
  if (!target) return NextResponse.json({ ok: false }, { status: 503 });

  try {
    const res = await fetch(target.url, {
      method: "POST",
      headers: target.headers,
      body: JSON.stringify({
        lead_id: leadId,
        answer: b.answer,
        detail: b.answer === "other" ? cleanDetail(b.detail) : null,
      }),
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[heard-about] CRM refused", res.status);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[heard-about] CRM unreachable", e);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
