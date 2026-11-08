import { Reveal } from "./ui/Reveal";
import { useLang } from "../i18n/LangContext";

/**
 * TAM AT A GLANCE — profile page 5: 50+ / 5 / 1 / 150+ and the five-stage strip.
 */
export function Glance() {
  const { c, dir } = useLang();
  const glance = c.glance;

  return (
    <section id="glance" className="relative border-t border-white/10 py-16 md:py-24 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-7 bg-lime/80" />
            <span className="kicker text-white/60 font-semibold">{glance.kicker}</span>
          </div>
        </Reveal>

        {/* 4 numbers — exactly the profile's glance page */}
        <div className="mt-10 grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4 border border-white/10">
          {glance.stats.map((st, i) => (
            <Reveal key={st.label} delay={i * 0.05}>
              <div className="h-full bg-ink p-6 md:p-8 transition-colors duration-300 hover:bg-white/[0.03]">
                <span className="font-display text-3xl md:text-5xl font-bold tracking-tight text-lime">
                  {st.num}
                </span>
                <h3 className="h-sub mt-4 text-white text-[15px] md:text-[17px]">{st.label}</h3>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Five stages strip — Design · Fabrication · Installation · Dismantling · Storage */}
        <Reveal delay={0.15}>
          <div className="mt-10 border border-white/12 bg-white/[0.02] p-4 sm:p-5 md:p-7">
            <span className="kicker text-[10px] sm:text-[11px] text-lime font-bold tracking-wider">
              {glance.lifecycleTitle}
            </span>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3" dir={dir}>
              {glance.lifecycle.map((lc) => (
                <div
                  key={lc.n}
                  className="border border-white/10 bg-ink/60 p-3.5 sm:p-4 transition-colors hover:border-lime/40"
                >
                  <span className="font-display text-[11px] text-lime font-bold">{lc.n}</span>
                  <div className="mt-2.5 font-display text-[13px] md:text-[15px] font-bold text-white">
                    {lc.name}
                  </div>
                  <div className="mt-1.5 text-[11px] leading-relaxed text-white/50">{lc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
