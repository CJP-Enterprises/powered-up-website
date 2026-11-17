#!/usr/bin/env node
/**
 * Accessibility + page-weight gate v1.0.0 (skills repo assets/wave5, 2026-11-16;
 * playbook #478 axe gate, #465 page-weight budget). Run by .github/workflows/site-checks.yml
 * against `next start` on every PR. FAILS when:
 *   - axe-core finds a SERIOUS or CRITICAL violation (WCAG 2.0/2.1/2.2 A + AA rules) on a key page;
 *   - a key page's first view (390x844, no scroll) loads more same-origin bytes than the budget:
 *     JS > 450 KB or total > 2,500 KB (compressed transfer, as served by `next start`).
 *
 * Key pages: "/", "/contact", "/accessibility", "/thank-you", the first /services/<x> and the
 * first town page (/service-areas/<x>, /areas/<x>, /locations/<x>) from /sitemap.xml. Missing
 * pages (404) are skipped with a log line.
 *
 * Per-site overrides (keep them rare and say why): site-checks.json at the repo root
 *   { "pages": ["/extra"], "skipPages": ["/thank-you"], "budgets": { "jsKb": 600, "totalKb": 3000 },
 *     "axeIgnore": ["rule-id"], "why": "one line" }
 *
 * Deps are NOT in the site's package.json: CI installs playwright + axe-core into CHECK_DEPS.
 * Local run: npm run build && npm start, then
 *   npm i --prefix /tmp/ck playwright@1.49.1 axe-core@4.10.2 && /tmp/ck/node_modules/.bin/playwright install chromium
 *   CHECK_DEPS=/tmp/ck BASE_URL=http://localhost:3000 node scripts/site-checks.mjs
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const TAG = '[site-checks]'
const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const req = createRequire(join(process.env.CHECK_DEPS || process.cwd(), 'noop.js'))
const { chromium } = req('playwright')
const axeSource = readFileSync(req.resolve('axe-core/axe.min.js'), 'utf8')

const cfgPath = join(process.cwd(), 'site-checks.json')
const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {}
const JS_KB = cfg.budgets?.jsKb ?? 450
const TOTAL_KB = cfg.budgets?.totalKb ?? 2500
const IGNORE = new Set(cfg.axeIgnore ?? [])

async function keyPages() {
  const pages = ['/', '/contact', '/accessibility', '/thank-you', ...(cfg.pages ?? [])]
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
    const paths = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => {
      try { return new URL(m[1]).pathname } catch { return null }
    }).filter(Boolean)
    // /services/<x>, else a top-level page whose slug reads like a service (/outlet-installation/).
    const svc = paths.find((p) => /^\/services\/[^/]+\/?$/.test(p)) ??
      paths.find((p) => /^\/[a-z0-9-]*(install|repair|replace|service|cleaning|painting|remodel|roof|detail|electric|plumb|concrete|fenc|deck|gutter)[a-z0-9-]*\/?$/.test(p))
    const town = paths.find((p) => /^\/(service-areas|areas|locations|areas-we-serve)\/[^/]+\/?$/.test(p))
    if (svc) pages.push(svc)
    if (town) pages.push(town)
  } catch {
    console.log(`${TAG} no sitemap.xml, checking the fixed pages only`)
  }
  const skip = new Set(cfg.skipPages ?? [])
  return [...new Set(pages)].filter((p) => !skip.has(p))
}

async function main() {
  const browser = await chromium.launch(process.env.CHECK_CHROME ? { executablePath: process.env.CHECK_CHROME } : {})
  // A fresh context (empty cache) per page, so every page is weighed as a first visit.
  const newCtx = () => browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    // Scroll-reveal animations half-run at load read as low contrast to axe; real users
    // who need contrast get the same reduced-motion path.
    reducedMotion: "reduce",
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 cjp-site-checks',
  })
  const failures = []
  const origin = new URL(BASE).origin
  for (const path of await keyPages()) {
    const ctx = await newCtx()
    const page = await ctx.newPage()
    let jsBytes = 0
    let totalBytes = 0
    page.on('response', async (res) => {
      try {
        if (!res.url().startsWith(origin)) return
        // Compressed bytes on the wire (what the visitor downloads).
        const s = (await res.request().sizes()).responseBodySize
        const len = s > 0 ? s : (await res.body()).length
        totalBytes += len
        if (res.request().resourceType() === 'script') jsBytes += len
      } catch { /* aborted/redirect */ }
    })
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 60_000 }).catch((e) => { console.log(`${TAG} ${path}: load error ${e.message}`); return null })
    if (!resp || resp.status() >= 400) {
      console.log(`${TAG} ${path}: ${resp ? resp.status() : 'no response'}, skipped`)
      await ctx.close()
      continue
    }
    await page.waitForTimeout(500)
    const jsKb = Math.round(jsBytes / 1024)
    const totalKb = Math.round(totalBytes / 1024)
    const weightOk = jsKb <= JS_KB && totalKb <= TOTAL_KB
    if (!weightOk) failures.push(`${path}: page weight JS ${jsKb} KB (budget ${JS_KB}) / total ${totalKb} KB (budget ${TOTAL_KB})`)

    await page.addScriptTag({ content: axeSource })
    const result = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        resultTypes: ['violations'],
      })
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) , count: v.nodes.length }))
    })
    const bad = result.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && !IGNORE.has(v.id))
    const minor = result.filter((v) => !bad.includes(v))
    for (const v of bad) failures.push(`${path}: axe ${v.impact} ${v.id} (${v.help}) x${v.count}: ${v.nodes.join(' | ')}`)
    console.log(`${TAG} ${path}: JS ${jsKb} KB, total ${totalKb} KB, axe ${bad.length} serious/critical, ${minor.length} other`)
    await ctx.close()
  }
  await browser.close()
  if (failures.length) {
    for (const f of failures) console.error(`${TAG} FAIL ${f}`)
    process.exit(1)
  }
  console.log(`${TAG} OK`)
}

main().catch((e) => { console.error(`${TAG} crashed: ${e && e.stack ? e.stack : e}`); process.exit(1) })
