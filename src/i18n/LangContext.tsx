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

type CopyShape = (typeof copy)["ar"];

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  c: CopyShape;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangCtx = createContext<LangContextValue | null>(null);

function getInitialLang(): Lang {
  // index.html already applied the saved language before mount;
  // read the same source of truth here.
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

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = copy[lang].meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy[lang].meta.desc);
  }, [lang, dir]);

  const c = useMemo(() => copy[lang], [lang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, dir, c, setLang, toggle }),
    [lang, dir, c, setLang, toggle]
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
