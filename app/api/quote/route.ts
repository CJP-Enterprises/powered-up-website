import { Resend } from "resend";
import { screenLead } from "@/lib/leadGuard";

// Run on the Node.js runtime (Resend SDK + in-memory rate limiting).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimitMap = new Map<string, { windowStart: number; count: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type QuoteFields = {
  name: string;
  phone: string;
  email: string;
  service: string;
  town: string;
  notes: string;
};

function buildHtml({ name, phone, email, service, town, notes }: QuoteFields): string {
  const townDisplay = town || "Not provided";
  const notesDisplay = notes || "None provided";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4efe6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a1a2f;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4efe6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border:2px solid #0a1a2f;">
        <tr>
          <td style="background:#0a1a2f;padding:20px 28px;border-bottom:4px solid #f5c518;">
            <div style="color:#f5c518;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Powered Up LLC</div>
            <div style="color:#f4efe6;font-size:22px;font-weight:800;margin-top:6px;">New Quote Request</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.5;">A homeowner just submitted the quote form on poweredbymicah.com.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:15px;line-height:1.5;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;width:110px;font-weight:700;color:#0a1a2f;">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;">${esc(name)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;font-weight:700;color:#0a1a2f;">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;"><a href="tel:${esc(phone)}" style="color:#0a1a2f;font-weight:600;text-decoration:underline;">${esc(phone)}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;font-weight:700;color:#0a1a2f;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;"><a href="mailto:${esc(email)}" style="color:#0a1a2f;text-decoration:underline;">${esc(email)}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;font-weight:700;color:#0a1a2f;">Service</td>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;">${esc(service)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;font-weight:700;color:#0a1a2f;">Town</td>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd2;">${esc(townDisplay)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-weight:700;color:#0a1a2f;vertical-align:top;">Details</td>
                <td style="padding:10px 0;white-space:pre-line;">${esc(notesDisplay)}</td>
              </tr>
            </table>
            <div style="margin-top:24px;padding:14px 16px;background:#f5c518;color:#0a1a2f;font-weight:700;font-size:14px;">
              Reply to this email to respond directly to the homeowner.
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0a1a2f;padding:14px 28px;color:#f4efe6;font-size:12px;">
            Powered Up LLC &middot; poweredbymicah.com
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText({ name, phone, email, service, town, notes }: QuoteFields): string {
  return [
    "New Quote Request — Powered Up LLC",
    "",
    `Name:    ${name}`,
    `Phone:   ${phone}`,
    `Email:   ${email}`,
    `Service: ${service}`,
    `Town:    ${town || "Not provided"}`,
    `Details: ${notes || "None provided"}`,
    "",
    "Reply to this email to respond directly to the homeowner.",
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const service = String(body.service || "").trim();
    const town = String(body.town || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || !phone || !email || !service) {
      return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Layered spam filtering (honeypot, timing, gibberish name, keyboard mash,
    // SEO/marketing phrases). Returns a normal-looking 200 without sending, so
    // bots stop retrying. See lib/leadGuard.ts. The notes box is optional on
    // this form, so requireMessage stays off: a one-word answer is a real lead.
    const blocked = await screenLead(
      {
        name,
        email,
        phone,
        message: notes,
        honeypot: body.website,
        renderedAt: body.renderedAt,
        extra: { service, town },
      },
      { requireMessage: false },
      { ok: true },
    );
    if (blocked) return blocked;

    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return Response.json(
        { ok: false, error: "Too many requests. Please try again later or call us directly." },
        { status: 429 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.QUOTE_TO_EMAIL;
    const fromEmail = process.env.QUOTE_FROM_EMAIL;
    if (!apiKey || !toEmail || !fromEmail) {
      console.error(
        "Quote form misconfigured: missing RESEND_API_KEY, QUOTE_TO_EMAIL, or QUOTE_FROM_EMAIL"
      );
      return Response.json(
        { ok: false, error: "Server is not configured to send email yet. Please call us directly." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const subject = `New Quote Request — ${service} in ${town || "Unknown town"}`;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: email,
      subject,
      html: buildHtml({ name, phone, email, service, town, notes }),
      text: buildText({ name, phone, email, service, town, notes }),
    } as Parameters<typeof resend.emails.send>[0]);

    if (error) {
      console.error("Resend API error:", error);
      return Response.json(
        { ok: false, error: "We could not send your request. Please call us directly." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Quote handler error:", err);
    return Response.json(
      { ok: false, error: "Something went wrong. Please call us directly." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
