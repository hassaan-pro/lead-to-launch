import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

/**
 * Fetches a prospect's homepage from our server. Because the URL comes from scraped data,
 * treat it as hostile: never let it reach private networks or cloud metadata endpoints.
 * Addresses are validated at connect time (not just before), which also blocks DNS rebinding.
 */

const MAX_BYTES = 1_500_000;
const TOTAL_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;

export type FetchedPage = {
  ok: boolean;
  finalUrl: string;
  status: number;
  https: boolean;
  /** Time until the first byte arrived. A rough, honest speed signal. */
  ttfbMs: number;
  totalMs: number;
  bytes: number;
  html: string;
  error?: string;
};

function isPrivateV4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

/** Parse an IPv6 literal into 16 bytes. Handles :: compression and a dotted IPv4 tail. */
function ipv6Bytes(ip: string): number[] | null {
  let v = ip.toLowerCase().split("%")[0];
  const tail = v.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const o = tail[1].split(".").map(Number);
    if (o.some((x) => x > 255)) return null;
    v = v.slice(0, -tail[1].length) + ((o[0] << 8) | o[1]).toString(16) + ":" + ((o[2] << 8) | o[3]).toString(16);
  }
  const halves = v.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - rest.length : 0;
  if (fill < 0 || (halves.length === 1 && head.length !== 8)) return null;
  const groups = [...head, ...Array(fill).fill("0"), ...rest];
  if (groups.length !== 8) return null;
  const bytes: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    const n = parseInt(g, 16);
    bytes.push(n >> 8, n & 255);
  }
  return bytes;
}

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  if (net.isIPv6(ip)) {
    const b = ipv6Bytes(ip);
    if (!b) return true; // cannot parse, so do not trust it
    const allZero = b.every((x) => x === 0);
    if (allZero || (b.slice(0, 15).every((x) => x === 0) && b[15] === 1)) return true; // :: and ::1
    if ((b[0] & 0xfe) === 0xfc) return true; // fc00::/7 unique local
    if (b[0] === 0xfe && (b[1] & 0xc0) === 0x80) return true; // fe80::/10 link local
    if (b[0] === 0xff) return true; // multicast
    const v4 = (o: number) => `${b[o]}.${b[o + 1]}.${b[o + 2]}.${b[o + 3]}`;
    if (b.slice(0, 10).every((x) => x === 0) && b[10] === 0xff && b[11] === 0xff) return isPrivateV4(v4(12)); // ::ffff:a.b.c.d
    if (b.slice(0, 12).every((x, i) => x === [0, 0x64, 0xff, 0x9b, 0, 0, 0, 0, 0, 0, 0, 0][i])) return isPrivateV4(v4(12)); // 64:ff9b::/96 NAT64
    if (b[0] === 0x20 && b[1] === 0x02) return isPrivateV4(v4(2)); // 2002::/16 6to4
    if (b[0] === 0x20 && b[1] === 0x01 && b[2] === 0x0d && b[3] === 0xb8) return true; // documentation range
    return false;
  }
  return true;
}

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

function safeLookup(hostname: string, options: dns.LookupOptions, callback: LookupCb) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    const list = (addresses as dns.LookupAddress[]).filter((a) => !isPrivateIp(a.address));
    if (list.length === 0) {
      return callback(Object.assign(new Error("Blocked address"), { code: "EBLOCKED" }) as NodeJS.ErrnoException, "", 0);
    }
    if (options.all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
}

function validateTarget(u: URL): string | null {
  if (u.protocol !== "http:" && u.protocol !== "https:") return "Only http and https are allowed";
  if (u.username || u.password) return "Credentials in URL are not allowed";
  const port = u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 80;
  if (port !== 80 && port !== 443) return "Non-standard port";
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return "Blocked host";
  if (net.isIP(host) && isPrivateIp(host)) return "Blocked address";
  return null;
}

function requestOnce(u: URL, deadline: number): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string; bytes: number; ttfbMs: number }> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const lib = u.protocol === "https:" ? https : http;
    const remaining = Math.max(1000, deadline - started);
    const req = lib.request(
      u,
      {
        method: "GET",
        lookup: safeLookup as unknown as net.LookupFunction,
        timeout: remaining,
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; LeadToLaunchAudit/1.0)",
          accept: "text/html,application/xhtml+xml",
          "accept-encoding": "identity",
        },
      },
      (res) => {
        const ttfbMs = Date.now() - started;
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          return resolve({ status, headers: res.headers, body: "", bytes: 0, ttfbMs });
        }
        const type = String(res.headers["content-type"] ?? "");
        if (type && !/text\/html|application\/xhtml/i.test(type)) {
          res.resume();
          return reject(new Error(`Not an HTML page (${type.split(";")[0]})`));
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on("data", (c: Buffer) => {
          bytes += c.length;
          if (bytes > MAX_BYTES) {
            res.destroy();
            return;
          }
          chunks.push(c);
        });
        const finish = () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks).toString("utf8"), bytes, ttfbMs });
        res.on("end", finish);
        res.on("close", finish);
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("Timed out")));
    req.on("error", reject);
    req.end();
  });
}

export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  const started = Date.now();
  const deadline = started + TOTAL_TIMEOUT_MS;
  let url: URL;
  try {
    // Another scheme (ftp:, file:, gopher:) is rejected, not silently turned into https.
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) && !/^https?:\/\//i.test(rawUrl)) throw new Error("scheme");
    url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    return { ok: false, finalUrl: rawUrl, status: 0, https: false, ttfbMs: 0, totalMs: 0, bytes: 0, html: "", error: "Invalid or unsupported URL" };
  }

  let firstTtfb = 0;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const blocked = validateTarget(url);
      if (blocked) throw new Error(blocked);
      const r = await requestOnce(url, deadline);
      if (hop === 0) firstTtfb = r.ttfbMs;
      if (r.status >= 300 && r.status < 400 && r.headers.location) {
        url = new URL(String(r.headers.location), url);
        continue;
      }
      return {
        ok: r.status >= 200 && r.status < 300,
        finalUrl: url.toString(),
        status: r.status,
        https: url.protocol === "https:",
        ttfbMs: firstTtfb,
        totalMs: Date.now() - started,
        bytes: r.bytes,
        html: r.body,
        error: r.status >= 400 ? `HTTP ${r.status}` : undefined,
      };
    }
    throw new Error("Too many redirects");
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    const msg = code === "ENOTFOUND" ? "Domain does not resolve" : e instanceof Error ? e.message : "Fetch failed";
    return { ok: false, finalUrl: url.toString(), status: 0, https: url.protocol === "https:", ttfbMs: firstTtfb, totalMs: Date.now() - started, bytes: 0, html: "", error: msg };
  }
}
