import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Only these origins may be crawled — prevents SSRF / internal network probing. */
const ALLOWED_ORIGINS = [
  "https://frasskicks.com",
  "https://www.frasskicks.com",
  "https://luxury-flow-creator.lovable.app",
];

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

/**
 * FRASS-0566 — the checker may never wander into a private network. Any host
 * that resolves to loopback, link-local, private or cloud-metadata space is
 * refused before a request is made.
 */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "instance-data",
]);

function isBlockedIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved
  return false;
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return true;
  if (host.startsWith("[") || host.includes(":")) {
    // IPv6 literal — allow only clearly public addresses.
    const v6 = host.replace(/^\[|\]$/g, "");
    if (v6 === "::1" || v6 === "::" ) return true;
    if (/^f[cd][0-9a-f]{2}:/i.test(v6)) return true; // unique local
    if (/^fe[89ab][0-9a-f]:/i.test(v6)) return true; // link-local
    if (/^::ffff:/i.test(v6)) return isBlockedIpv4(v6.replace(/^::ffff:/i, ""));
    return false;
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return isBlockedIpv4(host);
  if (/^\d+$/.test(host)) return true; // decimal-encoded IP form
  return false;
}


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
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<LinkCheckReport> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuperAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuperAdmin) throw new Error("Admin only");

    const base = new URL(data.baseUrl);
    const origin = base.origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      throw new Error("This site cannot be scanned.");
    }
    const maxPages = data.maxPages ?? 30;


    const queue: string[] = [origin + "/"];
    const visited = new Set<string>();
    const found = new Map<string, Set<string>>();

    const normalize = (href: string, from: string): string | null => {
      try {
        const u = new URL(href, from);
        if (u.protocol !== "http:" && u.protocol !== "https:") return null;
        if (isBlockedHost(u.hostname)) return null;

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
