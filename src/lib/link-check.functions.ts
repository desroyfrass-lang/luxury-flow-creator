import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  baseUrl: z.string().url(),
  maxPages: z.number().int().min(1).max(60).optional(),
});

export type LinkCheckResult = {
  url: string;
  status: number | null;
  ok: boolean;
  redirectedTo: string | null;
  external: boolean;
  error: string | null;
  foundOn: string[];
};

export type LinkCheckReport = {
  baseUrl: string;
  scannedPages: string[];
  totalLinks: number;
  brokenCount: number;
  redirectCount: number;
  results: LinkCheckResult[];
  ranAt: string;
};

const SKIP_PREFIXES = ["mailto:", "tel:", "javascript:", "#", "data:", "blob:"];

function extractLinks(html: string): string[] {
  const out: string[] = [];
  const re = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    if (SKIP_PREFIXES.some((p) => raw.toLowerCase().startsWith(p))) continue;
    out.push(raw);
  }
  return out;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}

export const runLinkCheck = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<LinkCheckReport> => {
    const base = new URL(data.baseUrl);
    const origin = base.origin;
    const maxPages = data.maxPages ?? 30;

    const queue: string[] = [origin + "/"];
    const visited = new Set<string>();
    const found = new Map<string, Set<string>>();

    const normalize = (href: string, from: string): string | null => {
      try {
        const u = new URL(href, from);
        if (u.protocol !== "http:" && u.protocol !== "https:") return null;
        u.hash = "";
        return u.toString();
      } catch {
        return null;
      }
    };

    // Crawl internal pages (breadth-first) and collect every link found.
    while (queue.length > 0 && visited.size < maxPages) {
      const pageUrl = queue.shift()!;
      if (visited.has(pageUrl)) continue;
      visited.add(pageUrl);

      let html = "";
      try {
        const res = await fetch(pageUrl, {
          headers: { "user-agent": "FrassyLinkChecker/1.0", accept: "text/html" },
        });
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html")) continue;
        html = await res.text();
      } catch {
        continue;
      }

      for (const href of extractLinks(html)) {
        const abs = normalize(href, pageUrl);
        if (!abs) continue;
        if (!found.has(abs)) found.set(abs, new Set());
        found.get(abs)!.add(pageUrl);
        const isInternal = abs.startsWith(origin);
        if (isInternal && !visited.has(abs) && !queue.includes(abs) && visited.size + queue.length < maxPages) {
          queue.push(abs);
        }
      }
    }

    const links = [...found.keys()];

    const results = await mapLimit(links, 6, async (url): Promise<LinkCheckResult> => {
      const external = !url.startsWith(origin);
      const foundOn = [...(found.get(url) ?? [])].slice(0, 5);
      try {
        const res = await fetch(url, {
          method: external ? "HEAD" : "GET",
          redirect: "manual",
          headers: { "user-agent": "FrassyLinkChecker/1.0" },
        });
        const status = res.status;
        const location = res.headers.get("location");
        const isRedirect = status >= 300 && status < 400;
        return {
          url,
          status,
          ok: status < 400,
          redirectedTo: isRedirect && location ? new URL(location, url).toString() : null,
          external,
          error: null,
          foundOn,
        };
      } catch (e) {
        return {
          url,
          status: null,
          ok: false,
          redirectedTo: null,
          external,
          error: e instanceof Error ? e.message : "Request failed",
          foundOn,
        };
      }
    });

    results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.url.localeCompare(b.url));

    return {
      baseUrl: origin,
      scannedPages: [...visited],
      totalLinks: results.length,
      brokenCount: results.filter((r) => !r.ok).length,
      redirectCount: results.filter((r) => r.redirectedTo).length,
      results,
      ranAt: new Date().toISOString(),
    };
  });
