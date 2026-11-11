import { Reveal } from "./ui/Reveal";
import { useLang } from "../i18n/LangContext";

export function Glance() {
  const { siteData, apiStatus } = useLang();
  const glance = siteData?.glance;
  const items = glance?.items ?? [];

  if (apiStatus !== "loading" && !glance) return null;

  return (
    <section id="glance" className="relative border-t border-white/10 py-16 md:py-24 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!glance ? (
          <div className="animate-pulse space-y-8">
            <div className="h-5 w-36 bg-white/10 rounded" />
            <div className="grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 border border-white/10 bg-white/[0.02]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {glance.kicker && (
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="h-0.5 w-7 bg-lime/80" />
                  <span className="kicker text-white/60 font-semibold">{glance.kicker}</span>
                </div>
              </Reveal>
            )}

            {items.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3 border border-white/10">
                {items.map((item, i) => (
                  <Reveal key={`${item.number}-${i}`} delay={i * 0.05}>
                    <div className="group h-full bg-ink p-7 md:p-9 transition-colors duration-300 hover:bg-white/[0.03]">
                      <span className="font-display text-3xl md:text-4xl font-bold tracking-tight text-lime">
                        {item.number}
                      </span>
                      <h3 className="h-sub mt-5 text-white text-[17px] md:text-[19px] group-hover:text-lime transition-colors">
                        {item.title}
                      </h3>
                      <p className="body-copy mt-3 text-[13.5px] md:text-[14.5px] leading-relaxed text-white/65">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
