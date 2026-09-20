import { NextRequest, NextResponse } from "next/server";

type RateState = {
  count: number;
  resetAt: number;
  blockedUntil: number;
  lastSeen: number;
};

const rateStore = new Map<string, RateState>();
let cleanupTick = 0;

const WINDOW_MS = 60_000;
const HUMAN_LIMIT = 120;
const AUTOMATION_LIMIT = 30;
const TRUSTED_BOT_LIMIT = 240;
const BLOCK_MS = 10 * 60_000;

const TRUSTED_BOTS = /(googlebot|bingbot|duckduckbot|applebot|yandexbot)/i;
const AUTOMATION_UA = /(bot|crawl|spider|scrapy|curl|wget|python|httpclient|go-http-client|axios|node-fetch|java|headlesschrome|selenium|puppeteer|playwright|phantomjs|bytespider|claudebot|gptbot|dataforseobot|petalbot|ahrefsbot|semrushbot|mj12bot|seranking|dotbot|rogerbot|exabot)/i;
const STATIC_FILE_EXT = /\.(?:css|js|mjs|map|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|txt|xml)$/i;

const BLOCKED_PATHS = [
  /^\/wp-admin(?:\/|$)/i,
  /^\/wp-login\.php(?:\/|$)/i,
  /^\/xmlrpc\.php(?:\/|$)/i,
  /^\/phpmyadmin(?:\/|$)/i,
  /^\/\.env(?:\/|$)/i,
  /^\/\.git(?:\/|$)/i,
  /^\/server-status(?:\/|$)/i,
  /^\/cgi-bin(?:\/|$)/i,
  /^\/HNAP1(?:\/|$)/i,
  /^\/.*\.php(?:\/|$)/i,
];

function getClientIp(req: NextRequest): string {
  const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

function isMarketplacePath(pathname: string): boolean {
  return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
}

function isBlockedProbe(pathname: string): boolean {
  return BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

function cleanupRateStore(now: number) {
  if (rateStore.size > 2000) {
    rateStore.clear();
    return;
  }
  cleanupTick += 1;
  if (cleanupTick % 500 !== 0) return;

  for (const [key, state] of rateStore.entries()) {
    if (state.lastSeen + 30 * WINDOW_MS < now && state.blockedUntil < now) {
      rateStore.delete(key);
    }
  }
}

function rateLimitMarketplace(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (!isMarketplacePath(pathname)) return null;
  if (req.method !== "GET" && req.method !== "HEAD") return null;

  const ua = req.headers.get("user-agent") || "";
  // Block empty or conspicuously short user-agents on marketplace
  if (!ua || ua.trim().length < 5) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const trustedBot = TRUSTED_BOTS.test(ua);
  const automation = AUTOMATION_UA.test(ua) && !trustedBot;

  // Immediately reject untrusted automation/scrapers on marketplace
  if (automation) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const now = Date.now();
  cleanupRateStore(now);

  const ip = getClientIp(req);
  const key = `mkt:${ip}`;

  const state = rateStore.get(key) ?? {
    count: 0,
    resetAt: now + WINDOW_MS,
    blockedUntil: 0,
    lastSeen: now,
  };

  if (state.resetAt <= now) {
    state.count = 0;
    state.resetAt = now + WINDOW_MS;
  }

  state.lastSeen = now;
  const limit = trustedBot ? TRUSTED_BOT_LIMIT : HUMAN_LIMIT;

  if (state.blockedUntil > now) {
    rateStore.set(key, state);
    const retryAfter = Math.max(1, Math.ceil((state.blockedUntil - now) / 1000));
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfter),
      },
    });
  }

  state.count += 1;
  if (state.count > limit) {
    state.blockedUntil = now + BLOCK_MS;
    rateStore.set(key, state);
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(Math.ceil(BLOCK_MS / 1000)),
      },
    });
  }

  rateStore.set(key, state);
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || STATIC_FILE_EXT.test(pathname)) {
    return NextResponse.next();
  }

  if (isBlockedProbe(pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const limited = rateLimitMarketplace(req);
  if (limited) return limited;

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
