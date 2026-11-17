#!/usr/bin/env node
/**
 * JSON-LD build check v1.0.0 (skills repo assets/wave5, 2026-11-16; playbook #481/#93/#102).
 *
 * Runs after `next build` (npm postbuild, after seo-guard) over every prerendered
 * page in .next/server/app (and /pages). FAILS the build when:
 *   - a <script type="application/ld+json"> block is not valid JSON;
 *   - a node misses a field Google needs for its type (table REQUIRED below);
 *   - an `@id` reference ({"@id": "..."} with nothing else) resolves to no node
 *     anywhere in the build. Resolved only on another page = warning (Google
 *     reads one page at a time, so define it on the page or inline it).
 * Warnings (never fail): AggregateRating on our own business (decision 1: no
 * self-serving review markup), a LocalBusiness telephone whose digits are not
 * in the page's visible text, the same @id with two different @types.
 *
 * Escape hatch: JSONLD_CHECK_SKIP=1 (log line, pass). Never fails on its own
 * bug: an internal error logs and passes, like seo-guard.
 *
 *   npm pkg set scripts.postbuild="node scripts/seo-guard.mjs && node scripts/check-jsonld.mjs"
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const TAG = '[jsonld]'
const NEXT = join(process.cwd(), '.next')

const BUSINESS = /^(LocalBusiness|HomeAndConstructionBusiness|Plumber|Electrician|RoofingContractor|GeneralContractor|HVACBusiness|HousePainter|Locksmith|MovingCompany|AutoRepair|AutoWash|AutomotiveBusiness|ProfessionalService|LandscapingBusiness|Florist|Store|ElectronicsStore|ComputerStore|HomeGoodsStore|RentalBusiness|EmergencyService|ConstructionBusiness)$/

const has = (v) => v !== undefined && v !== null && !(typeof v === 'string' && !v.trim()) && !(Array.isArray(v) && v.length === 0)
const typesOf = (n) => (Array.isArray(n['@type']) ? n['@type'] : n['@type'] ? [n['@type']] : []).map(String)

/** [type test, fields check -> missing description or null] */
const REQUIRED = [
  [(t) => BUSINESS.test(t), (n) => (!has(n.name) ? 'name' : !has(n.address) && !has(n.areaServed) ? 'address or areaServed' : null)],
  [(t) => t === 'Organization', (n) => (!has(n.name) ? 'name' : null)],
  [(t) => t === 'Person', (n) => (!has(n.name) ? 'name' : null)],
  [(t) => t === 'Service', (n) => (!has(n.name) && !has(n.serviceType) ? 'name or serviceType' : null)],
  [(t) => /^(BlogPosting|Article|NewsArticle)$/.test(t), (n) => (!has(n.headline) ? 'headline' : !has(n.datePublished) ? 'datePublished' : null)],
  [(t) => t === 'BreadcrumbList', (n) => {
    const items = Array.isArray(n.itemListElement) ? n.itemListElement : []
    if (!items.length) return 'itemListElement'
    const bad = items.find((i) => !i || !has(i.position) || (!has(i.name) && !has(i.item)))
    return bad ? 'itemListElement[].position + name/item' : null
  }],
  [(t) => t === 'FAQPage', (n) => {
    const q = Array.isArray(n.mainEntity) ? n.mainEntity : n.mainEntity ? [n.mainEntity] : []
    if (!q.length) return 'mainEntity'
    const bad = q.find((x) => !x || !has(x.name) || !x.acceptedAnswer || !has(x.acceptedAnswer.text))
    return bad ? 'mainEntity[].name + acceptedAnswer.text' : null
  }],
  [(t) => t === 'ImageObject', (n) => (!has(n.url) && !has(n.contentUrl) ? 'url or contentUrl' : null)],
  [(t) => t === 'AggregateRating', (n) => (!has(n.ratingValue) ? 'ratingValue' : !has(n.ratingCount) && !has(n.reviewCount) ? 'ratingCount or reviewCount' : null)],
  [(t) => t === 'WebSite', (n) => (!has(n.url) && !has(n.name) ? 'url or name' : null)],
]

function* htmlFiles(dir) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const f = join(dir, e.name)
    if (e.isDirectory()) yield* htmlFiles(f)
    else if (e.name.endsWith('.html')) yield f
  }
}

function decode(s) {
  return s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/** Every object node, with whether it is a bare reference. */
function walk(v, out, depth = 0) {
  if (depth > 40 || v === null || typeof v !== 'object') return
  if (Array.isArray(v)) { for (const x of v) walk(x, out, depth + 1); return }
  const keys = Object.keys(v)
  if (keys.length === 1 && keys[0] === '@id') out.refs.push(String(v['@id']))
  else { out.nodes.push(v); if (has(v['@id'])) out.defs.push(v) }
  for (const k of keys) if (k !== '@context') walk(v[k], out, depth + 1)
}

function visibleDigits(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\D/g, '')
}

function main() {
  if (process.env.JSONLD_CHECK_SKIP) { console.log(`${TAG} skipped (JSONLD_CHECK_SKIP)`); return 0 }
  if (!existsSync(NEXT)) { console.log(`${TAG} no .next build found, skipped`); return 0 }
  const pages = []
  for (const base of [join(NEXT, 'server', 'app'), join(NEXT, 'server', 'pages')]) {
    for (const file of htmlFiles(base)) {
      const page = '/' + file.slice(base.length + 1).replace(/\\/g, '/').replace(/\.html$/, '').replace(/(^|\/)index$/, '')
      if (/(^|\/)_not-found$|(^|\/)(404|500|_error)$/.test(page)) continue
      pages.push({ page: page || '/', html: readFileSync(file, 'utf8') })
    }
  }
  const errors = []
  const warnings = []
  const siteIds = new Map() // @id -> Set(types)
  const perPage = []
  let blocks = 0
  for (const { page, html } of pages) {
    const out = { nodes: [], refs: [], defs: [] }
    for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      blocks++
      let raw = m[1].trim()
      if (!raw) continue
      let data
      try { data = JSON.parse(raw) } catch {
        try { data = JSON.parse(decode(raw)) } catch (e) { errors.push(`${page}: JSON-LD block is not valid JSON (${String(e.message).slice(0, 80)})`); continue }
      }
      walk(data, out)
    }
    for (const n of out.defs) {
      const id = String(n['@id'])
      if (!siteIds.has(id)) siteIds.set(id, new Set())
      for (const t of typesOf(n)) siteIds.get(id).add(t)
    }
    perPage.push({ page, refs: out.refs, local: new Set(out.defs.map((d) => String(d['@id']))), nodes: out.nodes, digits: visibleDigits(html) })
  }
  // A node that carries an @id is judged on everything said about that @id
  // across the build (a partial {"@type","@id","name"} pointer is fine when the
  // full node exists elsewhere).
  const merged = new Map()
  for (const { nodes } of perPage) for (const n of nodes) {
    if (!has(n['@id'])) continue
    const id = String(n['@id'])
    merged.set(id, { ...(merged.get(id) || {}), ...n })
  }
  for (const { page, nodes, digits } of perPage) {
    for (const raw of nodes) {
      const n = has(raw['@id']) ? { ...merged.get(String(raw['@id'])), ...raw, ...merged.get(String(raw['@id'])) } : raw
      for (const t of typesOf(n)) {
        for (const [test, check] of REQUIRED) {
          if (!test(t)) continue
          const miss = check(n)
          if (miss) errors.push(`${page}: ${t}${n['@id'] ? ` ${n['@id']}` : ''} is missing ${miss}`)
        }
        if (BUSINESS.test(t) && n.aggregateRating) warnings.push(`${page}: AggregateRating on our own ${t} (decision 1: remove self-serving review markup)`)
        if (BUSINESS.test(t) && typeof n.telephone === 'string') {
          const d = n.telephone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
          if (d.length >= 10 && !digits.includes(d) && !digits.includes(d.slice(-7))) warnings.push(`${page}: ${t} telephone ${n.telephone} is not in the visible text`)
        }
      }
    }
  }
  for (const { page, refs, local } of perPage) {
    for (const r of new Set(refs)) {
      if (local.has(r)) continue
      if (siteIds.has(r)) warnings.push(`${page}: @id ${r} is defined on another page only`)
      else errors.push(`${page}: @id reference ${r} resolves to no node in the build`)
    }
  }
  for (const [id, types] of siteIds) if (types.size > 1) warnings.push(`@id ${id} has several @types: ${[...types].join(', ')}`)

  const uniq = (a) => [...new Set(a)]
  for (const w of uniq(warnings).slice(0, 40)) console.log(`${TAG} warning: ${w}`)
  if (errors.length) {
    for (const e of uniq(errors).slice(0, 80)) console.error(`${TAG} FAIL: ${e}`)
    console.error(`${TAG} ${uniq(errors).length} error(s) in ${blocks} blocks on ${pages.length} pages. Fix the schema (lib/site.ts / StructuredData) or set JSONLD_CHECK_SKIP=1 for an emergency deploy.`)
    return 1
  }
  console.log(`${TAG} OK: ${blocks} JSON-LD blocks on ${pages.length} pages, ${siteIds.size} @ids, ${uniq(warnings).length} warning(s)`)
  return 0
}

let code = 0
try { code = main() } catch (e) { console.log(`${TAG} internal error, not failing the build: ${e && e.stack ? e.stack.split('\n')[0] : e}`) }
process.exit(code)
