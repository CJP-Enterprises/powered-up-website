#!/usr/bin/env node
// SEO build guard (vault ops/seo-playbook-automation-plan.md, phase 1 rows 313/355/202/264).
// Runs after `next build` as the npm `postbuild` script, so it runs on every Vercel build
// (preview + production) and every local `npm run build`. Plain Node 18+, no dependencies.
//
// Fails the build (exit 1) when:
//   1. REMOVED PAGE: a URL in the CURRENT PRODUCTION sitemap (fetched from the live site) is
//      missing from the NEW sitemap, is no longer served by this build, and has no redirect
//      (next.config redirects() via .next/routes-manifest.json, or vercel.json redirects).
//      A URL that is still served but left the sitemap is only a warning (e.g. now noindex).
//   2. BROKEN INTERNAL LINK: a prerendered page links to an internal path that this build
//      neither serves, redirects, rewrites, nor has under public/.
//   3. REDIRECT LOOP: a redirect whose static destination leads back to itself. A redirect
//      chain (A -> B -> C) is a warning: point A straight at C.
//
// Never fails on the network: if the live sitemap can't be fetched (new domain, outage,
// DNS not cut over yet) check 1 is skipped with a warning.
//
// Escape hatches (use sparingly, say why in the PR):
//   seo-guard-allow.txt   one path per line (`/old-page`, or `/old-section/*` prefix), `#`
//                         comments: a page deliberately removed with no redirect (410), or
//                         one redirected by middleware (the guard can't read middleware).
//   SEO_GUARD_SKIP=1      skip everything (prints a warning).
//   SEO_GUARD_BASELINE=<url of a sitemap>   compare against this instead of the live one.
//
// Stale branch? A preview of a branch made before a newer page reached production fails
// check 1 for that page: rebase the branch on main.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const NEXT = join(ROOT, '.next')
const tag = '[seo-guard]'
const errors = []
const warnings = []

if (process.env.SEO_GUARD_SKIP === '1') {
  console.log(`${tag} SKIPPED (SEO_GUARD_SKIP=1)`)
  process.exit(0)
}
if (!existsSync(join(NEXT, 'routes-manifest.json'))) {
  console.log(`${tag} no .next/routes-manifest.json (not a Next build output); nothing to check`)
  process.exit(0)
}

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }
const routes = readJson(join(NEXT, 'routes-manifest.json')) || {}
const prerender = readJson(join(NEXT, 'prerender-manifest.json')) || { routes: {}, dynamicRoutes: {} }
const vercelJson = readJson(join(ROOT, 'vercel.json')) || {}

// ---------- path helpers ----------
const norm = (p) => {
  let s = String(p || '/').split(/[?#]/)[0]
  try { s = decodeURI(s) } catch { /* keep raw */ }
  s = s.replace(/\/{2,}/g, '/')
  if (s.length > 1) s = s.replace(/\/$/, '')
  return s || '/'
}
const pathOf = (u) => { try { return norm(new URL(u).pathname) } catch { return null } }

// ---------- what this build serves ----------
const servedExact = new Set()
for (const r of Object.keys(prerender.routes || {})) servedExact.add(norm(r))
for (const r of routes.staticRoutes || []) servedExact.add(norm(r.page))
// Pages router (Next 14 sites): .next/server/pages-manifest.json
const pagesManifest = readJson(join(NEXT, 'server', 'pages-manifest.json')) || {}
for (const p of Object.keys(pagesManifest)) if (!/\[/.test(p) && !/^\/_/.test(p)) servedExact.add(norm(p))

// Dynamic routes: served unless the build prerendered a closed set (fallback: false).
const dynamic = (routes.dynamicRoutes || []).map((d) => {
  const pr = prerender.dynamicRoutes?.[d.page]
  return { page: d.page, re: new RegExp(d.regex), closed: pr ? pr.fallback === false : false }
})
const publicDir = join(ROOT, 'public')
const isPublicFile = (p) => {
  if (p === '/') return false
  const f = join(publicDir, p)
  try { return statSync(f).isFile() } catch { return false }
}
function served(p) {
  const n = norm(p)
  if (servedExact.has(n)) return true
  if (isPublicFile(n)) return true
  for (const d of dynamic) {
    if (d.re.test(n) || d.re.test(n + '/')) return !d.closed // closed set: only the prerendered paths exist
  }
  return false
}

// ---------- redirects / rewrites ----------
// vercel.json `source` (path-to-regexp) -> RegExp, enough for the shapes our sites use.
function vercelSourceRe(src) {
  let s = src.replace(/[.+?^${}|[\]\\]/g, (c) => (c === '?' ? c : '\\' + c))
  s = s.replace(/\/:[A-Za-z0-9_]+\*/g, '(?:/.*)?').replace(/\/:[A-Za-z0-9_]+\+/g, '/.+')
    .replace(/:[A-Za-z0-9_]+\??/g, '[^/]+').replace(/\\\(\.\*\\\)/g, '.*').replace(/\(\.\*\)/g, '.*')
  return new RegExp(`^${s}/?$`)
}
const redirects = []
for (const r of routes.redirects || []) {
  if (r.internal) continue // Next's own trailing-slash normaliser matches everything
  try { redirects.push({ source: r.source, destination: r.destination, re: new RegExp(r.regex), from: 'next.config' }) } catch { /* skip */ }
}
for (const r of vercelJson.redirects || []) {
  try { redirects.push({ source: r.source, destination: r.destination, re: vercelSourceRe(r.source), from: 'vercel.json' }) } catch { /* skip */ }
}
const rewrites = []
const rw = routes.rewrites || {}
for (const r of [].concat(Array.isArray(rw) ? rw : [...(rw.beforeFiles || []), ...(rw.afterFiles || []), ...(rw.fallback || [])])) {
  try { rewrites.push(new RegExp(r.regex)) } catch { /* skip */ }
}
for (const r of vercelJson.rewrites || []) { try { rewrites.push(vercelSourceRe(r.source)) } catch { /* skip */ } }

const redirectFor = (p) => { const n = norm(p); return redirects.find((r) => r.re.test(n) || r.re.test(n + '/')) }
const rewritten = (p) => { const n = norm(p); return rewrites.some((re) => re.test(n) || re.test(n + '/')) }

// ---------- allowlist ----------
const allow = existsSync(join(ROOT, 'seo-guard-allow.txt'))
  ? readFileSync(join(ROOT, 'seo-guard-allow.txt'), 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
  : []
const allowed = (p) => allow.some((a) => (a.endsWith('*') ? norm(p).startsWith(norm(a.slice(0, -1)) === '/' ? '/' : norm(a.slice(0, -1))) : norm(a) === norm(p)))

// ---------- sitemaps ----------
const locs = (xml) => [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'))
const isIndex = (xml) => /<sitemapindex[\s>]/i.test(String(xml))

function localBody(pathname) {
  const p = norm(pathname).replace(/^\//, '')
  for (const f of [join(NEXT, 'server', 'app', `${p}.body`), join(NEXT, 'server', 'app', p, 'route.body'), join(ROOT, 'public', p)]) {
    if (existsSync(f)) try { return readFileSync(f, 'utf8') } catch { /* next */ }
  }
  return null
}
function localSitemap() {
  const root = localBody('/sitemap.xml')
  if (!root) return null
  if (!isIndex(root)) return locs(root)
  const out = []
  for (const child of locs(root)) {
    const body = localBody(pathOf(child) || '')
    if (body === null) return null // a dynamic child sitemap: can't read it at build time
    out.push(...locs(body))
  }
  return out
}
async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'cjp-seo-guard/1 (+build check)' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}
async function liveUrls(url) {
  const xml = await fetchText(url)
  if (!/<(urlset|sitemapindex)[\s>]/i.test(xml)) throw new Error('not a sitemap')
  if (!isIndex(xml)) return locs(xml)
  const origin = new URL(url).hostname.replace(/^www\./, '')
  const out = []
  for (const child of locs(xml).slice(0, 25)) {
    if (new URL(child).hostname.replace(/^www\./, '') !== origin) continue
    out.push(...(await liveUrls(child)))
  }
  return out
}

// ---------- check 1: removed pages ----------
async function checkRemoved() {
  const fresh = localSitemap()
  if (!fresh) { warnings.push('no static sitemap.xml in this build output; removed-page check skipped'); return }
  if (!fresh.length) { warnings.push('the new sitemap is empty; removed-page check skipped'); return }
  const origin = new URL(fresh[0]).origin
  const baseline = process.env.SEO_GUARD_BASELINE || `${origin}/sitemap.xml`
  let live
  try { live = await liveUrls(baseline) } catch (e) {
    warnings.push(`could not read the live sitemap ${baseline} (${e.message}); removed-page check skipped`)
    return
  }
  const host = new URL(origin).hostname.replace(/^www\./, '')
  const freshPaths = new Set(fresh.map(pathOf).filter(Boolean))
  let compared = 0
  for (const u of live) {
    let h
    try { h = new URL(u).hostname.replace(/^www\./, '') } catch { continue }
    if (h !== host) continue
    const p = pathOf(u)
    if (!p) continue
    compared++
    if (freshPaths.has(p)) continue
    if (allowed(p)) { warnings.push(`removed from the sitemap, allowed by seo-guard-allow.txt: ${p}`); continue }
    const r = redirectFor(p)
    if (r) { if (r.destination && served(r.destination.split('?')[0]) === false && !/[:(*]/.test(r.destination) && !/^https?:/.test(r.destination)) errors.push(`REMOVED PAGE ${p} redirects (${r.from}) to ${r.destination}, which this build does not serve`); continue }
    if (served(p)) { warnings.push(`left the sitemap but is still served (fine if it is noindex now): ${p}`); continue }
    errors.push(`REMOVED PAGE ${p} was in the live sitemap (${baseline}) and this build neither serves nor redirects it. Add a 301 in next.config.ts redirects() to the closest live page, or list it in seo-guard-allow.txt if it must 404/410.`)
  }
  console.log(`${tag} removed-page check: ${compared} live sitemap URLs vs ${freshPaths.size} in the new sitemap`)
}

// ---------- check 2: internal links ----------
function* htmlFiles(dir) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const f = join(dir, e.name)
    if (e.isDirectory()) yield* htmlFiles(f)
    else if (e.name.endsWith('.html')) yield f
  }
}
function checkLinks() {
  const fresh = localSitemap() || []
  const hosts = new Set()
  for (const u of fresh) { try { const h = new URL(u).hostname.replace(/^www\./, ''); hosts.add(h) } catch { /* skip */ } }
  const broken = new Map() // path -> Set(pages)
  let pages = 0, links = 0
  for (const base of [join(NEXT, 'server', 'app'), join(NEXT, 'server', 'pages')]) {
    for (const file of htmlFiles(base)) {
      const page = '/' + file.slice(base.length + 1).replace(/\\/g, '/').replace(/\.html$/, '').replace(/(^|\/)index$/, '')
      if (/(^|\/)_not-found$|(^|\/)(404|500|_error)$/.test(page)) continue
      pages++
      const html = readFileSync(file, 'utf8')
      for (const m of html.matchAll(/<a\b[^>]*?\shref\s*=\s*["']([^"']+)["']/gi)) {
        let href = m[1].replace(/&amp;/g, '&').trim()
        if (/^https?:\/\//i.test(href)) {
          try { const u = new URL(href); if (!hosts.has(u.hostname.replace(/^www\./, ''))) continue; href = u.pathname } catch { continue }
        } else if (!href.startsWith('/') || href.startsWith('//')) continue
        const p = norm(href)
        if (/^\/(_next|api|cdn-cgi)(\/|$)/.test(p)) continue
        links++
        if (served(p) || redirectFor(p) || rewritten(p) || allowed(p)) continue
        if (!broken.has(p)) broken.set(p, new Set())
        broken.get(p).add(page || '/')
      }
    }
  }
  for (const [p, on] of broken) errors.push(`BROKEN INTERNAL LINK ${p} (linked from ${[...on].slice(0, 5).join(', ')}${on.size > 5 ? ` +${on.size - 5} more` : ''}): this build does not serve it. Fix the link or add a redirect.`)
  console.log(`${tag} internal-link check: ${links} internal links on ${pages} prerendered pages`)
}

// ---------- check 3: redirect chains / loops ----------
function checkRedirects() {
  for (const r of redirects) {
    if (!r.destination || /^https?:/.test(r.destination) || /[:(*]/.test(r.destination)) continue
    const seen = [norm(r.source)]
    let dest = norm(r.destination.split('?')[0])
    let hop = 0
    while (hop++ < 10) {
      if (seen.includes(dest)) { errors.push(`REDIRECT LOOP ${[...seen, dest].join(' -> ')}`); break }
      const next = redirectFor(dest)
      if (!next || !next.destination || /^https?:/.test(next.destination) || /[:(*]/.test(next.destination)) {
        if (hop > 1) warnings.push(`redirect chain ${[...seen, dest].join(' -> ')}: point ${seen[0]} straight at ${dest}`)
        break
      }
      seen.push(dest)
      dest = norm(next.destination.split('?')[0])
    }
  }
}

try {
  await checkRemoved()
  checkLinks()
  checkRedirects()
} catch (e) {
  // A bug in the guard must never take a site down: report and pass.
  console.log(`${tag} internal error, checks not completed (build allowed): ${e.stack || e.message}`)
  process.exit(0)
}
for (const w of warnings) console.log(`${tag} warn: ${w}`)
if (errors.length) {
  for (const e of errors) console.log(`${tag} FAIL: ${e}`)
  console.log(`${tag} ${errors.length} problem(s). See the comment at the top of scripts/seo-guard.mjs for the escape hatches.`)
  process.exit(1)
}
console.log(`${tag} OK (${warnings.length} warning${warnings.length === 1 ? '' : 's'})`)
