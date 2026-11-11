import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";

/**
 * 08 WHY TAM — standards & commitments served dynamically from CMS API.
 */
export function Standards() {
  const { siteData, apiStatus } = useLang();
  const standards = siteData?.standards;
  const items = standards?.items ?? [];

  if (apiStatus !== "loading" && !standards) return null;

  const marqueeItems = [
    ...(siteData?.footer?.brandline ? [siteData.footer.brandline] : []),
    ...items.map((s) => s.title).filter(Boolean),
  ];

  return (
    <section id="standards" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!standards ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-56 bg-white/10 rounded" />
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-52 bg-ink" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <SectionHead
              index="08"
              kicker={standards.kicker ?? ""}
              title={standards.title ?? ""}
              lead={standards.subtitle ?? ""}
            />

            {items.length > 0 && (
              <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
                {items.map((s, i) => (
                  <Reveal key={s.id ?? `${s.number}-${i}`} delay={i * 0.05}>
                    <div className="group h-full bg-ink p-7 transition-all duration-300 hover:bg-white/[0.03] md:p-8">
                      <span className="font-display text-[12px] tracking-[0.26em] text-lime font-bold">
                        {s.number}
                      </span>
                      <h3 className="h-sub mt-6 text-[17px] md:text-[19px] text-white group-hover:text-lime transition-colors">
                        {s.title}
                      </h3>
                      <p className="body-copy mt-3.5 text-[13.5px] leading-relaxed text-white/60">
                        {s.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {marqueeItems.length > 0 && (
        <div className="mt-20 border-y border-white/10 bg-white/[0.015] py-5">
          <Marquee
            items={marqueeItems}
            speed={65}
            className="text-white/20 hover:text-white/40 transition-colors"
            itemClassName="font-display text-[clamp(1.3rem,2.8vw,2.2rem)] font-bold tracking-[0.03em]"
          />
        </div>
      )}
    </section>
  );
}
