import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";

/**
 * 01 ABOUT TAM + 02 VISION & MISSION — verbatim from the company profile.
 */
export function About() {
  const { c, lang, dir, siteData } = useLang();
  const about = c.about;
  const ctaLabel = siteData?.hero?.cta_primary || c.nav.cta;

  return (
    <section id="about" className="relative border-t border-white/10 py-20 md:py-28 bg-ink overflow-hidden">
      <div
        className="pointer-events-none absolute -end-24 top-1/3 h-[400px] w-[400px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "#DFFF00" }}
      />
      <div
        className="pointer-events-none absolute -start-24 bottom-10 h-[450px] w-[450px] rounded-full opacity-25 blur-[140px]"
        style={{ background: "#0F0566" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead
          index="01"
          kicker={about.kicker}
          title={about.title}
          lead={about.tag}
        />

        {/* Story + profile visual */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Reveal>
              <p className="body-copy text-[16px] md:text-[18px] leading-relaxed text-white/85">
                {about.storyP1}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="body-copy text-[15px] md:text-[16px] leading-relaxed text-white/65">
                {about.storyP2}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden border border-white/15 bg-white/[0.02] p-2">
                <img
                  src="/media/profile/hero_crew.jpg"
                  alt={lang === "ar" ? "طاقم عمل تام أثناء تجهيز الجناح" : "TAM crew assembling an exhibition booth"}
                  loading="lazy"
                  className="w-full object-cover aspect-[4/3]"
                />
                <div className="p-4 bg-ink/90 border-t border-white/10">
                  <div className="font-display text-[11px] text-lime font-bold tracking-wider">
                    {lang === "ar" ? "فريق تام — في الورشة وفي موقع المعرض" : "THE TAM CREW — WORKSHOP & SHOW FLOOR"}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 02 Vision & Mission */}
        <div id="vision" className="mt-16 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="group h-full border border-white/12 bg-white/[0.02] p-7 md:p-9 transition-colors duration-300 hover:border-lime/40">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] tracking-[0.2em] font-bold text-lime">
                  {lang === "ar" ? "02 · الرؤية" : "02 · VISION"}
                </span>
                <span className="h-2 w-2 rounded-full bg-lime/60 group-hover:bg-lime transition-colors" />
              </div>
              <h3 className="h-title mt-5 text-[22px] md:text-[24px] text-white group-hover:text-lime transition-colors">
                {about.visionTitle}
              </h3>
              <p className="body-copy mt-4 text-[14.5px] md:text-[15.5px] leading-relaxed text-white/70">
                {about.visionText}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="group h-full border border-white/12 bg-white/[0.02] p-7 md:p-9 transition-colors duration-300 hover:border-lime/40">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] tracking-[0.2em] font-bold text-lime">
                  {lang === "ar" ? "02 · الرسالة" : "02 · MISSION"}
                </span>
                <span className="h-2 w-2 rounded-full bg-lime/60 group-hover:bg-lime transition-colors" />
              </div>
              <h3 className="h-title mt-5 text-[22px] md:text-[24px] text-white group-hover:text-lime transition-colors">
                {about.missionTitle}
              </h3>
              <p className="body-copy mt-4 text-[14.5px] md:text-[15.5px] leading-relaxed text-white/70">
                {about.missionText}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Profile page 6: Built to Stand Out statement */}
        <Reveal delay={0.15}>
          <div className="mt-14 relative overflow-hidden border border-lime/30 bg-gradient-to-r from-lime/[0.06] via-indigo/20 to-lime/[0.03] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                {lang === "ar" ? (
                  <>
                    <div className="font-ar text-[24px] md:text-[32px] font-bold text-white">
                      صُمّم <span className="text-lime">ليبرز.</span>
                    </div>
                    <div className="mt-1.5 text-[13.5px] text-white/60">
                      تام لتصنيع الأجنحة وخدمات المعارض — حضور يُبنى ليترك أثراً دائماً.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-[22px] md:text-[30px] font-bold tracking-[0.08em] text-white">
                      BUILT TO <span className="text-lime">STAND OUT.</span>
                    </div>
                    <div className="mt-1.5 text-[13.5px] text-white/60">
                      Exhibition Booths & Display Solutions — Engineered to make your brand unmistakable.
                    </div>
                  </>
                )}
              </div>
              <a
                href="#contact"
                className="inline-flex shrink-0 items-center gap-2 border border-lime bg-lime px-6 py-3.5 text-[13px] font-bold text-ink hover:bg-lime/90 transition-all hover:shadow-[0_0_20px_rgba(223,255,0,0.4)]"
              >
                <span>{ctaLabel}</span>
                <span>{dir === "rtl" ? "←" : "→"}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
