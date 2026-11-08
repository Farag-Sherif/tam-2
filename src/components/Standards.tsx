import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";

/**
 * 08 WHY TAM — profile page 21: four reasons, verbatim.
 */
export function Standards() {
  const { c } = useLang();

  return (
    <section id="standards" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead index="08" kicker={c.standards.kicker} title={c.standards.title} lead={c.standards.lead} />

        <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
          {c.standards.items.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="group h-full bg-ink p-7 transition-all duration-300 hover:bg-white/[0.03] md:p-8">
                <span className="font-display text-[12px] tracking-[0.26em] text-lime font-bold">
                  {s.n}
                </span>
                <h3 className="h-sub mt-6 text-[17px] md:text-[19px] text-white group-hover:text-lime transition-colors">
                  {s.t}
                </h3>
                <p className="body-copy mt-3.5 text-[13.5px] leading-relaxed text-white/60">
                  {s.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 border-y border-white/10 bg-white/[0.015] py-5">
        <Marquee
          items={c.standards.claim}
          speed={65}
          className="text-white/20 hover:text-white/40 transition-colors"
          itemClassName="font-display text-[clamp(1.3rem,2.8vw,2.2rem)] font-bold tracking-[0.03em]"
        />
      </div>
    </section>
  );
}
