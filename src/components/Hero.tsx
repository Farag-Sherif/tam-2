import { useState, useEffect } from "react";
import { useLang } from "../i18n/LangContext";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";

/**
 * 5 real featured projects from the TAM Company Profile:
 * 01 New Star Seven (Black & White Star Stand)
 * 02 Star Pack (Open-Front Screen Stand)
 * 03 Dots Pack (Arched Niches & Logo Totem)
 * 04 El-Omda Cafe Stand (Architectural Arches & Warm Glow) -> Matches user screenshot!
 * 05 Aman by Raya (Outdoor Summer Stand)
 */
const FEATURED_PROJECTS = [
  {
    id: "new_star_seven",
    tagAr: "هيكل تراس وإضاءة LED",
    tagEn: "Tech & Truss",
    titleAr: "جناح نيو ستار سيفن — تناغم الأبيض والأسود",
    titleEn: "New Star Seven — Black & White Star Stand",
    specsAr: "لوحة مضيئة معلقة · فتحات نجمية بإضاءة LED · هيكل تراس",
    specsEn: "Overhead Lightbox · Star LED Cutouts · Modular Truss",
    img: "/media/profile/project_new_star_seven.jpg",
  },
  {
    id: "star_pack",
    tagAr: "صناعات التعبئة والتغليف",
    tagEn: "Industrial Packaging",
    titleAr: "جناح ستار باك — شاشة عرض مفتوحة",
    titleEn: "Star Pack — Open-Front Screen Stand",
    specsAr: "شاشة مدمجة بإطار أجنحة EAS · منصة استقبال · مسار حركة مفتوح",
    specsEn: "Integrated EAS Wing Screen · Reception Island · Dynamic Flow",
    img: "/media/profile/project_star_pack.jpg",
  },
  {
    id: "dots_pack",
    tagAr: "فاترينات عرض مقوسة",
    tagEn: "Display Engineering",
    titleAr: "جناح دوتس باك — فاترينات مقوسة وتوتم الشعار",
    titleEn: "Dots Pack — Arched Niches & Logo Totem",
    specsAr: "فاترينات مقوسة للمنتجات · توتم الشعار المرتفع · منطقة اجتماعات",
    specsEn: "Arched Niches for Bottles & Jars · Logo Totem · Meeting Area",
    img: "/media/profile/project_dots_pack.jpg",
  },
  {
    id: "el_omda",
    tagAr: "تراث عصري",
    tagEn: "Modern Heritage",
    titleAr: "جناح كافيه العمدة — أقواس معمارية وإضاءة دافئة",
    titleEn: "El-Omda Cafe Stand — Architectural Arches & Warm Glow",
    specsAr: "أقواس خشبية منحنية · نيشات عرض مدمجة · ضيافة",
    specsEn: "Curved Wooden Arches · Recessed Display Niches · Hospitality",
    img: "/media/profile/project_el_omda.jpg",
  },
  {
    id: "aman_raya",
    tagAr: "أجنحة صيفية خارجية",
    tagEn: "Outdoor Summer Stand",
    titleAr: "جناح أمان راية — ستاند صيفي خارجي جريء",
    titleEn: "Aman by Raya — Bold Outdoor Summer Stand",
    specsAr: "حروف ثلاثية الأبعاد بارزة · دهانات مقاومة للعوامل الجوية · لوحة حملة بارزة",
    specsEn: "Layered 3D Lettering · Weather-Resistant Build · High-Visibility Totem",
    img: "/media/profile/project_aman_finished.jpg",
  },
];

export function Hero() {
  const { c, lang, dir } = useLang();
  // Start on 3 (Slide 04 - El-Omda Cafe Stand) to match user reference exactly
  const [activeCard, setActiveCard] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance preview slides every 4.2 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % FEATURED_PROJECTS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentProject = FEATURED_PROJECTS[activeCard];

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink pt-20">
      {/* Blueprint grid + atmospheric brand glows */}
      <div className="absolute inset-0 bg-[#0A0720]">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-5 py-12 md:px-8 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Brand, Headline, Lead, CTAs & Quick Metrics */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Logo */}
            <Reveal>
              <img
                src="/brand/logo-stacked.png"
                alt="TAM — Booths & More"
                className="h-20 w-auto md:h-24 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              />
            </Reveal>

            {/* Kicker badge */}
            <Reveal delay={0.08}>
              <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-lime/30 bg-lime/[0.06] px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                </span>
                <span className="font-display text-[11px] font-bold tracking-[0.2em] text-lime">
                  {c.hero.badge}
                </span>
              </div>
            </Reveal>

            {/* Slogan Headline */}
            <Reveal delay={0.16}>
              <h1 className="mt-6">
                {lang === "ar" ? (
                  <span className="block font-ar text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.15] text-white">
                    صُمّم{" "}
                    <span className="text-lime drop-shadow-[0_0_35px_rgba(223,255,0,0.35)]">
                      ليبرز.
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="block font-display text-[clamp(2.4rem,5.8vw,4.6rem)] font-bold leading-[1.05] tracking-[0.02em] text-white">
                      {c.hero.titleA}
                    </span>
                    <span className="block font-display text-[clamp(2.4rem,5.8vw,4.6rem)] font-bold leading-[1.05] tracking-[0.02em] text-lime drop-shadow-[0_0_35px_rgba(223,255,0,0.35)]">
                      {c.hero.titleB}
                    </span>
                  </>
                )}
              </h1>
            </Reveal>

            {/* Lead text */}
            <Reveal delay={0.24}>
              <p className="body-copy mt-5 max-w-[54ch] text-[15px] md:text-[17px] leading-relaxed text-white/75">
                {c.hero.lead}
              </p>
            </Reveal>

            {/* CTA Buttons */}
            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 bg-lime px-7 py-3.5 text-[13.5px] font-bold text-ink shadow-[0_0_25px_-5px_rgba(223,255,0,0.45)] transition-all duration-300 hover:bg-lime/90 hover:-translate-y-0.5"
                >
                  <span>{c.hero.ctaPrimary}</span>
                  <span className="font-display text-[12px]">{dir === "rtl" ? "←" : "→"}</span>
                </a>
                <a
                  href="#work"
                  className="inline-flex items-center gap-2.5 border border-white/25 bg-white/[0.03] px-6 py-3.5 text-[13.5px] font-medium text-white/90 backdrop-blur-md transition-all duration-300 hover:border-lime/60 hover:text-lime hover:-translate-y-0.5"
                >
                  <span>{c.hero.ctaSecondary}</span>
                  <span className="text-[11px] opacity-70">↓</span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Featured Project Showcase Card (Exact match to uploaded image) */}
          <div className="lg:col-span-5 xl:col-span-5">
            <Reveal delay={0.2}>
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-lime/40"
              >
                {/* Media Container with Image Crossfade */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
                  {FEATURED_PROJECTS.map((proj, idx) => (
                    <img
                      key={proj.id}
                      src={proj.img}
                      alt={lang === "ar" ? proj.titleAr : proj.titleEn}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                        activeCard === idx
                          ? "opacity-100 scale-[1.03]"
                          : "opacity-0 scale-100 pointer-events-none"
                      }`}
                    />
                  ))}

                  {/* Gradient overlay for readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A071E] via-[#0A071E]/60 to-transparent" />

                  {/* Pill Badge at top-start */}
                  <div className="absolute top-3.5 start-3.5 z-20">
                    <span className="rounded-full border border-lime/50 bg-[#0A071E]/85 px-3.5 py-1 text-[11px] font-bold text-lime backdrop-blur-md shadow-md">
                      {lang === "ar" ? currentProject.tagAr : currentProject.tagEn}
                    </span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 z-20 text-start" dir={dir}>
                    <div className="font-display text-[10.5px] md:text-[11px] font-bold tracking-[0.2em] text-lime">
                      {c.hero.cardBadge}
                    </div>
                    <h3 className="mt-1 text-[16px] md:text-[18px] font-bold text-white leading-snug drop-shadow-md">
                      {lang === "ar" ? currentProject.titleAr : currentProject.titleEn}
                    </h3>
                    <p className="mt-1.5 text-[11.5px] md:text-[12.5px] text-white/75 leading-relaxed">
                      {lang === "ar" ? currentProject.specsAr : currentProject.specsEn}
                    </p>
                  </div>
                </div>

                {/* 5-Tab Selector Bar: 01, 02, 03, 04, 05 (04 active in reference image) */}
                <div className="mt-3 grid grid-cols-5 gap-1.5" dir="ltr">
                  {FEATURED_PROJECTS.map((proj, idx) => {
                    const isActive = activeCard === idx;
                    const numStr = String(idx + 1).padStart(2, "0");
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setActiveCard(idx)}
                        title={lang === "ar" ? proj.titleAr : proj.titleEn}
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
              </div>
            </Reveal>
          </div>

        </div>
      </div>

      {/* Infinite Marquee Ticker at the bottom of Hero */}
      <div className="relative z-10 border-t border-white/10 bg-ink/90 py-3.5 backdrop-blur-md">
        <Marquee
          items={c.hero.ticker}
          speed={75}
          className="text-white/40 font-display text-[10.5px] tracking-[0.22em]"
          itemClassName="hover:text-lime transition-colors"
        />
      </div>
    </section>
  );
}
