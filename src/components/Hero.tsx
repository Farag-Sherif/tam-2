import { useState, useEffect, useMemo } from "react";
import { useLang } from "../i18n/LangContext";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";

export function Hero() {
  const { c, lang, dir, siteData, apiStatus, refreshSite } = useLang();
  const hero = siteData?.hero;
  const cards = useMemo(() => hero?.cards ?? [], [hero?.cards]);
  const slides = useMemo(() => hero?.slides ?? [], [hero?.slides]);
  const stats = useMemo(() => hero?.stats ?? [], [hero?.stats]);
  const checks = useMemo(() => hero?.checks ?? [], [hero?.checks]);

  const [activeCard, setActiveCard] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Reset active card index whenever card list changes (e.g., locale switch)
  useEffect(() => {
    setActiveCard(0);
  }, [cards.length, lang]);

  // Auto-advance preview slides every 4.2 seconds unless hovered
  useEffect(() => {
    if (isPaused || cards.length <= 1) return;
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

  const safeIndex = cards.length > 0 ? activeCard % cards.length : 0;
  const currentCard = cards[safeIndex];
  const activeSlide = slides[0];

  const titleLines = useMemo(() => {
    if (!hero?.title) return [];
    return hero.title
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }, [hero?.title]);

  const tickerItems = useMemo(() => {
    const items: string[] = [];
    if (siteData?.news?.length) {
      siteData.news.forEach((n) => {
        if (n.title) items.push(n.title);
      });
    }
    if (siteData?.footer?.brandline) {
      items.push(siteData.footer.brandline);
    }
    if (checks.length) {
      checks.forEach((ch) => items.push(ch));
    }
    return items;
  }, [siteData?.news, siteData?.footer?.brandline, checks]);

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink pt-20">
      {/* Background media slide from API (subtle atmospheric layer) + blueprint grid */}
      <div className="absolute inset-0 bg-[#0A0720]">
        {activeSlide && (
          activeSlide.type === "image" ? (
            <img
              src={activeSlide.media_url}
              alt={activeSlide.caption || ""}
              className="h-full w-full object-cover opacity-20"
            />
          ) : (
            <video
              src={activeSlide.media_url}
              poster={activeSlide.poster_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-20"
            />
          )
        )}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="pointer-events-none absolute -top-40 start-1/4 h-[550px] w-[550px] rounded-full opacity-40 blur-[140px]"
          style={{ background: "#0F0566" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 end-0 h-[480px] w-[480px] rounded-full opacity-[0.14] blur-[150px]"
          style={{ background: "#DFFF00" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/80" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-5 py-12 md:px-8 md:py-16">
        {apiStatus === "error" && !hero ? (
          <div className="mx-auto max-w-lg border border-white/15 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-white/75">{c.apiUi.errorTitle}</p>
            <button
              type="button"
              onClick={() => void refreshSite()}
              className="mt-4 inline-flex items-center gap-2 bg-lime px-5 py-2.5 text-xs font-bold text-ink hover:bg-lime/90 transition-colors"
            >
              {c.apiUi.retry}
            </button>
          </div>
        ) : !hero ? (
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 animate-pulse">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-20 w-36 bg-white/10 rounded" />
              <div className="h-7 w-64 bg-white/10 rounded-full" />
              <div className="h-24 w-full max-w-xl bg-white/10 rounded" />
              <div className="h-16 w-full max-w-lg bg-white/5 rounded" />
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] w-full rounded-2xl bg-white/5 border border-white/10" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Brand, Headline, Lead, CTAs & Verification Checks */}
              <div className="lg:col-span-7 xl:col-span-7">
                <Reveal>
                  <img
                    src="/brand/logo-stacked.png"
                    alt="TAM — Booths & More"
                    className="h-20 w-auto md:h-24 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                  />
                </Reveal>

                {hero.eyebrow && (
                  <Reveal delay={0.08}>
                    <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-lime/30 bg-lime/[0.06] px-4 py-1.5 backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                      </span>
                      <span className="font-display text-[11px] font-bold tracking-[0.14em] text-lime">
                        {hero.eyebrow}
                      </span>
                    </div>
                  </Reveal>
                )}

                {hero.kicker && (
                  <Reveal delay={0.12}>
                    <div className="mt-4 text-xs font-medium tracking-wider text-white/60">
                      {hero.kicker}
                    </div>
                  </Reveal>
                )}

                {titleLines.length > 0 && (
                  <Reveal delay={0.16}>
                    <h1 className="mt-4">
                      {titleLines.map((line, i) => {
                        const isAccent = titleLines.length > 1 ? i === titleLines.length - 1 : false;
                        return (
                          <span
                            key={i}
                            className={`block ${
                              lang === "ar"
                                ? "font-ar text-[clamp(2rem,4.6vw,3.8rem)] font-bold leading-[1.2]"
                                : "font-display text-[clamp(1.9rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-[0.02em]"
                            } ${
                              isAccent
                                ? "text-lime drop-shadow-[0_0_35px_rgba(223,255,0,0.35)]"
                                : "text-white"
                            }`}
                          >
                            {line}
                          </span>
                        );
                      })}
                    </h1>
                  </Reveal>
                )}

                {hero.body && (
                  <Reveal delay={0.24}>
                    <p className="body-copy mt-5 max-w-[56ch] text-[15px] md:text-[17px] leading-relaxed text-white/75">
                      {hero.body}
                    </p>
                  </Reveal>
                )}

                {/* CTA Buttons */}
                <Reveal delay={0.32}>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {hero.cta_primary && (
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-3 bg-lime px-7 py-3.5 text-[13.5px] font-bold text-ink shadow-[0_0_25px_-5px_rgba(223,255,0,0.45)] transition-all duration-300 hover:bg-lime/90 hover:-translate-y-0.5"
                      >
                        <span>{hero.cta_primary}</span>
                        <span className="font-display text-[12px]">{dir === "rtl" ? "←" : "→"}</span>
                      </a>
                    )}
                    {hero.cta_secondary && (
                      <a
                        href="#journey"
                        className="inline-flex items-center gap-2.5 border border-white/25 bg-white/[0.03] px-6 py-3.5 text-[13.5px] font-medium text-white/90 backdrop-blur-md transition-all duration-300 hover:border-lime/60 hover:text-lime hover:-translate-y-0.5"
                      >
                        <span>{hero.cta_secondary}</span>
                        <span className="text-[11px] opacity-70">↓</span>
                      </a>
                    )}
                  </div>
                </Reveal>

                {checks.length > 0 && (
                  <Reveal delay={0.38}>
                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                      {checks.map((check) => (
                        <div key={check} className="inline-flex items-center gap-2 text-[12px] text-white/70">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime/15 text-[10px] font-bold text-lime">
                            ✓
                          </span>
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>

              {/* Right Column: Featured Work Showcase Cards from API */}
              {cards.length > 0 && currentCard && (
                <div className="lg:col-span-5 xl:col-span-5">
                  <Reveal delay={0.2}>
                    <div
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-lime/40"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
                        {cards.map((card, idx) => (
                          <img
                            key={`${card.image_url}-${idx}`}
                            src={card.image_url}
                            alt={card.title}
                            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                              safeIndex === idx
                                ? "opacity-100 scale-[1.03]"
                                : "opacity-0 scale-100 pointer-events-none"
                            }`}
                          />
                        ))}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A071E] via-[#0A071E]/60 to-transparent" />

                        {currentCard.badge && (
                          <div className="absolute top-3.5 start-3.5 z-20">
                            <span className="rounded-full border border-lime/50 bg-[#0A071E]/85 px-3.5 py-1 text-[11px] font-bold text-lime backdrop-blur-md shadow-md">
                              {currentCard.badge}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-5 z-20 text-start" dir={dir}>
                          {hero.card_label && (
                            <div className="font-display text-[10.5px] md:text-[11px] font-bold tracking-[0.2em] text-lime">
                              {hero.card_label}
                            </div>
                          )}
                          <h3 className="mt-1 text-[16px] md:text-[18px] font-bold text-white leading-snug drop-shadow-md">
                            {currentCard.title}
                          </h3>
                          {currentCard.subtitle && (
                            <p className="mt-1.5 text-[11.5px] md:text-[12.5px] text-white/75 leading-relaxed">
                              {currentCard.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {cards.length > 1 && (
                        <div
                          className="mt-3 grid gap-1.5"
                          style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
                          dir="ltr"
                        >
                          {cards.map((card, idx) => {
                            const isActive = safeIndex === idx;
                            const numStr = String(idx + 1).padStart(2, "0");
                            return (
                              <button
                                key={`${card.title}-${idx}`}
                                type="button"
                                onClick={() => setActiveCard(idx)}
                                title={card.title}
                                className={`relative flex items-center justify-center py-2.5 text-center font-display text-[11px] transition-all duration-300 rounded ${
                                  isActive
                                    ? "border-2 border-lime bg-lime/20 text-lime font-bold shadow-[0_0_15px_-3px_rgba(223,255,0,0.35)]"
                                    : "border border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                {numStr}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Reveal>
                </div>
              )}
            </div>

            {/* Bottom API Stats Row */}
            {stats.length > 0 && (
              <Reveal delay={0.35}>
                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-7 lg:grid-cols-4">
                  {stats.map((st, idx) => (
                    <div key={`${st.number}-${idx}`} className="border-s border-lime/40 ps-4">
                      <div className="font-display text-2xl md:text-3xl font-bold tracking-tight text-lime">
                        {st.number}
                      </div>
                      <div className="mt-1 text-[12px] text-white/65">{st.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>

      {/* Infinite Marquee Ticker at the bottom of Hero */}
      {tickerItems.length > 0 && (
        <div className="relative z-10 border-t border-white/10 bg-ink/90 py-3.5 backdrop-blur-md">
          <Marquee
            items={tickerItems}
            speed={75}
            className="text-white/40 font-display text-[10.5px] tracking-[0.22em]"
            itemClassName="hover:text-lime transition-colors"
          />
        </div>
      )}
    </section>
  );
}
