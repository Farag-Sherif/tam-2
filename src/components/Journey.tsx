import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";

/**
 * 04 HOW WE WORK — "FIVE STAGES. ONE TEAM." — verbatim from the profile (page 8).
 */
function Stage({
  stage,
  mirrored,
}: {
  stage: { n: string; tag: string; title: string; body: string; img: string };
  mirrored: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className="relative border-t border-white/10 py-10 first:border-t-0 md:py-14">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-4 ${mirrored ? "lg:order-2 lg:col-start-9" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="font-display text-[34px] font-bold leading-none text-lime">
              {stage.n}
            </span>
            <span className="kicker text-white/50">{stage.tag}</span>
          </div>
          <h3 className="h-title mt-5 text-white">{stage.title}</h3>
          <p className="body-copy mt-4 max-w-[44ch] text-white/65">{stage.body}</p>
        </div>

        <div className={`lg:col-span-8 ${mirrored ? "lg:order-1 lg:col-start-1" : ""}`}>
          <div className="relative overflow-hidden bg-indigo/20 border border-white/10">
            <motion.div style={reduce ? undefined : { y }} className="relative">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <motion.img
                  src={stage.img}
                  alt={stage.title}
                  loading="lazy"
                  className="h-full w-full scale-[1.06] object-cover"
                  initial={reduce ? false : { opacity: 0.3, scale: 1.12 }}
                  whileInView={{ opacity: 1, scale: 1.06 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 start-4 border border-white/10 bg-ink/70 px-2.5 py-1 backdrop-blur-md">
              <span className="font-display text-[9.5px] tracking-[0.2em] text-white/70">
                {stage.n} / 05
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Journey() {
  const { c } = useLang();
  const stages = c.journey.stages;

  return (
    <section id="journey" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead
          index="04"
          kicker={c.journey.kicker}
          title={c.journey.title}
          lead={c.journey.lead}
        />

        <div className="mt-12">
          {stages.map((s, i) => (
            <Stage key={s.n} stage={s} mirrored={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
