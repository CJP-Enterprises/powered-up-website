import { ITEMS, type GalleryItem } from "@/lib/gallery";

/**
 * "Recent projects" strip (SEO playbook rows 368/360): the latest real job
 * photos tagged with the page's service (lib/gallery.ts `services`), newest
 * first, never the page's own hero photo. Fewer than 2 = no strip.
 * Town pages get none: no gallery photo is tied to a town.
 */
export const MIN_RECENT = 2;
export const MAX_RECENT = 6;

export function recentPhotos(service: string, exclude: string[] = []): GalleryItem[] {
  const out = ITEMS.filter((p) => p.services?.includes(service) && !exclude.includes(p.src)).slice(0, MAX_RECENT);
  return out.length >= MIN_RECENT ? out : [];
}
