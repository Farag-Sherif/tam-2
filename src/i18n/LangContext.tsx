import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { copy, type Lang } from "./copy";
import { getSite } from "../api/client";
import type { SitePayload } from "../api/types";

type CopyShape = (typeof copy)["ar"];

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  c: CopyShape;
  setLang: (l: Lang) => void;
  toggle: () => void;
  siteData: SitePayload | null;
  apiStatus: "loading" | "live" | "error";
  apiError: string | null;
  refreshSite: () => Promise<void>;
}

const LangCtx = createContext<LangContextValue | null>(null);

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem("tam_lang");
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    /* storage unavailable */
  }
  return "ar";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [siteData, setSiteData] = useState<SitePayload | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "live" | "error">("loading");
  const [apiError, setApiError] = useState<string | null>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("tam_lang", l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "ar" ? "en" : "ar"),
    [lang, setLang]
  );

  const fetchSiteData = useCallback(async (targetLang: Lang, force = false) => {
    setApiStatus("loading");
    setApiError(null);
    try {
      const payload = await getSite(targetLang, force);
      setSiteData(payload);
      setApiStatus("live");
    } catch (err) {
      setApiStatus("error");
      setApiError(err instanceof Error ? err.message : "Failed to load content");
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    setApiStatus("loading");
    setApiError(null);

    getSite(lang)
      .then((payload) => {
        if (!ignore) {
          setSiteData(payload);
          setApiStatus("live");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setApiStatus("error");
          setApiError(err instanceof Error ? err.message : "Failed to load content");
        }
      });

    return () => {
      ignore = true;
    };
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = copy[lang].meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy[lang].meta.desc);
  }, [lang, dir]);

  const c = useMemo(() => copy[lang], [lang]);

  const refreshSite = useCallback(() => fetchSiteData(lang, true), [fetchSiteData, lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      dir,
      c,
      setLang,
      toggle,
      siteData,
      apiStatus,
      apiError,
      refreshSite,
    }),
    [lang, dir, c, setLang, toggle, siteData, apiStatus, apiError, refreshSite]
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

/** Bold display + body font classes follow the active language. */
export function langFonts(lang: Lang) {
  return lang === "ar"
    ? { head: "font-ar", body: "font-ar" }
    : { head: "font-display", body: "font-sans" };
}
