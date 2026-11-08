import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";

/**
 * 05 WORKSHOP & CREW — verbatim from profile pages 9–11:
 * OUR WORKSHOP, THE TAM CREW, PRECISION IN EVERY DETAIL.
 */
export function WorkshopCrew() {
  const { c, lang, dir } = useLang();
  const ws = c.workshop;

  return (
    <section id="workshop" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead
          index="05"
          kicker={ws.kicker}
          title={ws.title}
          lead={ws.lead}
        />

        {/* OUR WORKSHOP — big image + text, profile page 9 */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="body-copy text-[16px] md:text-[17px] leading-relaxed text-white/80">
                {ws.workshopText}
              </p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <span className="font-display text-[11.5px] tracking-[0.24em] text-lime font-bold">
                  {ws.stripTitle}
                </span>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden border border-white/12 bg-white/[0.02]">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={ws.workshopImg}
                    alt={lang === "ar" ? "أعمال النجارة في ورشة تام" : "Carpentry in TAM workshop"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-ink/90 border-t border-white/10">
                  <span className="font-display text-[10.5px] text-lime font-bold tracking-wider">
                    {lang === "ar" ? "داخل ورشتنا الخاصة" : "OUR IN-HOUSE WORKSHOP"}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* THE TAM CREW — profile page 10 */}
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 lg:order-2">
            <Reveal>
              <h3 className="h-title text-white text-[22px] md:text-[26px]">{ws.crewTitle}</h3>
              <p className="body-copy mt-4 text-[15px] leading-relaxed text-white/70 max-w-[52ch]">
                {ws.crewText}
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:order-1">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden border border-white/12 bg-white/[0.02]">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={ws.crewImg}
                    alt={lang === "ar" ? "فريق تام أثناء تركيب الجناح" : "TAM crew installing exhibition booth"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-ink/90 border-t border-white/10">
                  <span className="font-display text-[10.5px] text-lime font-bold tracking-wider">
                    {ws.crewTitle}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* PRECISION IN EVERY DETAIL — profile page 11 */}
        <Reveal delay={0.15}>
          <div className="mt-14 border border-lime/40 bg-lime/[0.04] p-8 md:p-12 text-center">
            {lang === "ar" ? (
              <>
                <div className="font-ar text-[26px] md:text-[38px] font-bold text-lime">
                  {ws.precisionClaim}
                </div>
                <div className="mt-2 text-sm text-white/65">
                  {ws.precisionSub}
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-[18px] md:text-[24px] font-bold tracking-[0.14em] text-white">
                  PRECISION IN
                </div>
                <div className="font-display text-[26px] md:text-[38px] font-bold tracking-[0.14em] text-lime">
                  EVERY DETAIL
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {ws.precisionSub}
                </div>
              </>
            )}
          </div>
        </Reveal>

        <div className="mt-10 text-end">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 border border-white/20 bg-white/[0.02] px-5 py-3 text-[13px] text-white/85 transition-all hover:border-lime hover:text-lime"
          >
            <span>{c.nav.cta}</span>
            <span className={`font-display text-[11px] ${dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`}>
              {dir === "rtl" ? "←" : "→"}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
