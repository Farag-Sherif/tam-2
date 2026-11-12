import type {
  ApiEnvelope,
  BriefResponse,
  BriefSubmission,
  ClientItem,
  GlanceItem,
  HeroCard,
  HeroSlide,
  HeroStat,
  JourneyStage,
  Lang,
  NewsItem,
  ProjectItem,
  ServiceItem,
  SitePayload,
  StandardItem,
  TagItem,
} from "./types";

/**
 * Headless CMS API Base URL.
 * Automatically sanitizes trailing slashes, /api/v1 suffixes, or /login paths.
 * Default production: https://tam.bluebrain-co.com
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://tam.bluebrain-co.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/login\/?$/, "");

/** Custom error thrown when POST /briefs rate limit (429) is hit */
export class RateLimitError extends Error {
  isRateLimited = true;
  constructor(message = "Too many requests. Please wait before submitting again.") {
    super(message);
    this.name = "RateLimitError";
  }
}

interface CacheEntry<T> {
  data: T;
  etag?: string;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
// In-memory deduplication window (10 seconds) to avoid duplicate requests during same render
const CACHE_TTL_MS = 10 * 1000;

// Purge any stale sessionStorage cache from previous builds
try {
  if (typeof sessionStorage !== "undefined") {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("tam_v1_cache_")) {
        sessionStorage.removeItem(k);
      }
    }
  }
} catch {
  // Ignore in environments without sessionStorage
}

/**
 * Fetch full site payload in one call (GET /api/v1/site?locale=en|ar).
 * Validates with origin server via conditional requests (ETag/no-cache)
 * so dashboard changes reflect immediately on page reload.
 */
export async function getSite(
  locale: Lang = "en",
  forceRefresh = false
): Promise<SitePayload> {
  const cacheKey = `site_${locale}`;
  const cached = memoryCache.get(cacheKey) as CacheEntry<SitePayload> | undefined;

  // Return recent in-memory entry during rapid component re-renders (within 10s) unless forced
  if (
    !forceRefresh &&
    cached?.data &&
    Date.now() - cached.timestamp < CACHE_TTL_MS
  ) {
    return cached.data;
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (cached?.etag && !forceRefresh) {
    headers["If-None-Match"] = cached.etag;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/site?locale=${locale}`, {
      method: "GET",
      headers,
      cache: "no-cache",
    });

    // 304 Not Modified — server validated that cached content is still fresh
    if (res.status === 304 && cached?.data) {
      cached.timestamp = Date.now();
      memoryCache.set(cacheKey, cached);
      return cached.data;
    }

    if (!res.ok) {
      if (cached?.data) return cached.data;
      throw new Error(`API returned status ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (cached?.data) return cached.data;
      throw new Error(`Expected JSON response from ${API_BASE_URL}, got "${contentType}"`);
    }

    const data: SitePayload = await res.json();
    const etag = res.headers.get("etag") || res.headers.get("ETag") || undefined;
    const entry: CacheEntry<SitePayload> = {
      data,
      etag,
      timestamp: Date.now(),
    };
    memoryCache.set(cacheKey, entry);
    return data;
  } catch (err) {
    if (cached?.data) {
      return cached.data;
    }
    throw err instanceof Error ? err : new Error("Failed to load site data from API");
  }
}

/**
 * Generic helper to fetch list collections with envelope: { locale, data: [...] }
 */
async function fetchCollection<T>(endpoint: string, locale: Lang): Promise<T[]> {
  const cacheKey = `col_${endpoint}_${locale}`;
  const cached = memoryCache.get(cacheKey) as CacheEntry<T[]> | undefined;

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/${endpoint}?locale=${locale}`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return cached ? cached.data : [];
      }

      const json: ApiEnvelope<T[]> = await res.json();
      const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      memoryCache.set(cacheKey, { data: list, timestamp: Date.now() });
      return list;
    }
  } catch {
    if (cached) return cached.data;
  }

  return [];
}

/**
 * Generic helper to fetch a single record by ID: { locale, data: {...} }
 */
async function fetchRecordById<T>(
  endpoint: string,
  id: string | number,
  locale: Lang
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/${endpoint}/${id}?locale=${locale}`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return null;
      }

      const json: ApiEnvelope<T> = await res.json();
      return json.data || (json as unknown as T) || null;
    }
  } catch (err) {
    console.warn(`[TAM API] Failed to fetch ${endpoint}/${id}:`, err);
  }

  return null;
}

/* ================= Specific Content Model Methods ================= */

export const getHeroSlides = (locale: Lang) => fetchCollection<HeroSlide>("hero-slides", locale);
export const getHeroSlideById = (id: string | number, locale: Lang) =>
  fetchRecordById<HeroSlide>("hero-slides", id, locale);

export const getHeroCards = (locale: Lang) => fetchCollection<HeroCard>("hero-cards", locale);
export const getHeroCardById = (id: string | number, locale: Lang) =>
  fetchRecordById<HeroCard>("hero-cards", id, locale);

export const getHeroStats = (locale: Lang) => fetchCollection<HeroStat>("hero-stats", locale);
export const getHeroStatById = (id: string | number, locale: Lang) =>
  fetchRecordById<HeroStat>("hero-stats", id, locale);

export const getNews = (locale: Lang) => fetchCollection<NewsItem>("news", locale);
export const getNewsById = (id: string | number, locale: Lang) =>
  fetchRecordById<NewsItem>("news", id, locale);

export const getJourney = (locale: Lang) => fetchCollection<JourneyStage>("journey", locale);
export const getJourneyById = (id: string | number, locale: Lang) =>
  fetchRecordById<JourneyStage>("journey", id, locale);

export const getTags = (locale: Lang) => fetchCollection<TagItem>("tags", locale);
export const getTagById = (id: string | number, locale: Lang) =>
  fetchRecordById<TagItem>("tags", id, locale);

export const getGlance = (locale: Lang) => fetchCollection<GlanceItem>("glance", locale);
export const getGlanceById = (id: string | number, locale: Lang) =>
  fetchRecordById<GlanceItem>("glance", id, locale);

export const getStandards = (locale: Lang) => fetchCollection<StandardItem>("standards", locale);
export const getStandardById = (id: string | number, locale: Lang) =>
  fetchRecordById<StandardItem>("standards", id, locale);

export const getProjects = (locale: Lang) => fetchCollection<ProjectItem>("projects", locale);
export const getProjectById = (id: string | number, locale: Lang) =>
  fetchRecordById<ProjectItem>("projects", id, locale);

export const getServices = (locale: Lang) => fetchCollection<ServiceItem>("services", locale);
export const getServiceById = (id: string | number, locale: Lang) =>
  fetchRecordById<ServiceItem>("services", id, locale);

export const getClients = (locale: Lang) => fetchCollection<ClientItem>("clients", locale);
export const getClientById = (id: string | number, locale: Lang) =>
  fetchRecordById<ClientItem>("clients", id, locale);

/* ================= Brief Submission (POST /api/v1/briefs) ================= */

/**
 * Submit project brief or booth planner specification to POST /api/v1/briefs.
 * Required: name, contact, details.
 * Honeypot: website field (silently swallows bots).
 * Throttled: returns 429 when rate limit is exceeded.
 */
export async function submitBrief(payload: BriefSubmission): Promise<BriefResponse> {
  const url = `${API_BASE_URL}/api/v1/briefs`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      contact: payload.contact,
      details: payload.details,
      locale: payload.locale || "en",
      website: payload.website || "", // honeypot
      ...(payload.specification ? { specification: payload.specification } : {}),
    }),
  });

  if (res.status === 429) {
    throw new RateLimitError(
      payload.locale === "ar"
        ? "تم إرسال عدة طلبات مؤخراً. يرجى الانتظار دقيقة قبل المحاولة مجدداً."
        : "Too many requests. Please wait a moment before trying again."
    );
  }

  if (!res.ok) {
    let message =
      payload.locale === "ar"
        ? "تعذر إرسال الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى."
        : "Submission failed. Please check your details and try again.";
    try {
      const errJson = await res.json();
      message = errJson.message || errJson.error || message;
    } catch {
      // use default
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      ok: true,
      id: Date.now(),
      message:
        payload.locale === "ar"
          ? "تم استلام طلبك بنجاح ✓"
          : "Project brief received successfully ✓",
    };
  }

  const data: BriefResponse = await res.json();
  return data;
}
