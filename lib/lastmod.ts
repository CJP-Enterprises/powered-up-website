import { execFileSync } from "node:child_process";

/**
 * Real last-modified date for a route: the commit date of the newest commit that touched any of the
 * given source files. Returns undefined when git cannot answer (shallow clone without the commit, no
 * repo), and the sitemap then omits lastmod rather than inventing one. Never falls back to mtime or
 * "now": a sitemap that says every page changed today is ignored by crawlers (Ranked SEO Playbook #266).
 */
export function lastModified(...sources: string[]): Date | undefined {
  let newest: Date | undefined;
  for (const rel of sources) {
    try {
      const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", rel], {
        cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (!out) continue;
      const d = new Date(out);
      if (!Number.isNaN(d.getTime()) && (!newest || d > newest)) newest = d;
    } catch {
      // git missing, not a repo, or the commit is outside a shallow clone: leave it undefined
    }
  }
  return newest;
}
