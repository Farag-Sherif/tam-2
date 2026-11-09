import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useLang } from "../i18n/LangContext";

export function Nav() {
  const { c, lang, dir, toggle } = useLang();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const items = [
    ["#about", c.nav.about],
    ["#services", c.nav.services],
    ["#journey", c.nav.journey],
    ["#workshop", c.nav.workshop],
    ["#work", c.nav.work],
    ["#clients", c.nav.clients],
    ["#standards", c.nav.standards],
    ["#contact", c.nav.contact],
  ] as const;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-white/10">
        <motion.div
          className={`h-full bg-lime ${dir === "rtl" ? "origin-right" : "origin-left"}`}
          style={{ scaleX: bar }}
        />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? "border-b border-white/10 bg-ink/90 backdrop-blur-xl" : "border-b border-transparent bg-ink/30 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 md:px-8">
          <a href="#top" className="flex shrink-0 items-center" aria-label="TAM — Booths & more">
            <img src="/brand/logo-alt.png" alt="TAM Booths & more" className="h-[22px] w-auto md:h-[26px]" />
          </a>

          <nav className="hidden items-center gap-8 xl:flex">
            {items.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="group relative text-[13px] text-white/70 transition-colors hover:text-white"
              >
                {label}
                <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="flex items-center gap-2 border border-white/20 bg-white/[0.02] px-3.5 py-2 text-[12px] text-white/80 transition-all hover:border-lime hover:text-lime hover:bg-white/[0.05]"
              aria-label={`Switch to ${c.meta.langNext}`}
            >
              <span className={lang === "ar" ? "font-display text-[9.5px] tracking-[0.18em]" : "font-ar text-[13px] font-bold"}>
                {c.meta.langLabel}
              </span>
              <span className="hidden text-[11px] opacity-60 sm:inline">{c.meta.langNext}</span>
            </button>

            <a
              href="#contact"
              className="hidden items-center gap-2 bg-lime px-5 py-2.5 text-[12.5px] font-bold text-ink shadow-[0_0_15px_-4px_rgba(223,255,0,0.4)] transition-all hover:shadow-[0_0_25px_rgba(223,255,0,0.6)] hover:-translate-y-0.5 md:flex"
            >
              <span>{c.nav.cta}</span>
              <span className="font-display text-[10px]">{dir === "rtl" ? "←" : "→"}</span>
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-white/20 bg-white/[0.02] xl:hidden"
              aria-label={c.nav.menu}
              aria-expanded={open}
            >
              <span className={`h-0.5 w-4 bg-white transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 bg-white transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-ink/[0.98] px-5 py-5 backdrop-blur-2xl xl:hidden">
            <div className="grid gap-1">
              {items.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-white/10 py-3.5 text-[15px] text-white/85 transition-colors hover:text-lime"
                >
                  <span className="font-medium">{label}</span>
                  <span className="font-display text-[9.5px] tracking-[0.2em] text-white/35">
                    {href.replace("#", "").toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-5 flex justify-center items-center gap-2 bg-lime py-3.5 text-[14px] font-bold text-ink shadow-lg"
            >
              <span>{c.nav.cta}</span>
              <span>{dir === "rtl" ? "←" : "→"}</span>
            </a>
          </div>
        )}
      </header>
    </>
  );
}
