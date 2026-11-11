import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";
import type { JourneyStage } from "../api/types";

function StageWithMedia({
  stage,
  total,
  mirrored,
}: {
  stage: JourneyStage;
  total: number;
  mirrored: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const stepStr = String(stage.step).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <div ref={ref} className="relative border-t border-white/10 py-10 first:border-t-0 md:py-14">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-4 ${mirrored ? "lg:order-2 lg:col-start-9" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="font-display text-[34px] font-bold leading-none text-lime">
              {stepStr}
            </span>
            <span className="kicker text-white/50">{stage.title}</span>
          </div>
          {stage.heading && <h3 className="h-title mt-5 text-white">{stage.heading}</h3>}
          <p className="body-copy mt-4 max-w-[44ch] text-white/65">{stage.description}</p>
          {stage.tags && stage.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stage.tags.map((t, idx) => {
                const name = typeof t === "string" ? t : t.name;
                return (
                  <span
                    key={`${name}-${idx}`}
                    className="border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/75"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className={`lg:col-span-8 ${mirrored ? "lg:order-1 lg:col-start-1" : ""}`}>
          <div className="relative overflow-hidden bg-indigo/20 border border-white/10">
            <motion.div style={reduce ? undefined : { y }} className="relative">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <motion.img
                  src={stage.image_url!}
                  alt={stage.heading || stage.title}
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
                {stepStr} / {totalStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Journey() {
  const { dir, siteData, apiStatus } = useLang();
  const journey = siteData?.journey;
  const stages = journey?.stages ?? [];

  if (apiStatus !== "loading" && !journey) return null;

  const hasAnyImages = stages.some((s) => Boolean(s.image_url));

  return (
    <section id="journey" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!journey ? (
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-72 bg-white/10 rounded" />
            <div className="grid gap-5 md:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-64 border border-white/10 bg-white/[0.02]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <SectionHead
              index="04"
              kicker={journey.kicker || ""}
              title={journey.title || ""}
              lead={journey.subtitle}
            />

            {stages.length > 0 && hasAnyImages ? (
              <div className="mt-12">
                {stages.map((s, i) => (
                  <StageWithMedia
                    key={`${s.step}-${i}`}
                    stage={s}
                    total={stages.length}
                    mirrored={i % 2 === 1}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {stages.map((stage, i) => {
                  const stepStr = String(stage.step).padStart(2, "0");
                  const totalStr = String(stages.length).padStart(2, "0");
                  return (
                    <Reveal key={`${stage.step}-${i}`} delay={(i % 3) * 0.05}>
                      <article className="group flex h-full flex-col justify-between border border-white/12 bg-white/[0.02] p-6 md:p-8 transition-colors duration-300 hover:border-lime/45">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-display text-[32px] font-bold leading-none text-lime">
                              {stepStr}
                            </span>
                            <span className="border border-lime/30 bg-lime/[0.06] px-2.5 py-1 text-[10.5px] font-bold text-lime">
                              {stage.title}
                            </span>
                          </div>

                          {stage.heading && (
                            <h3 className="h-sub mt-6 text-[18px] md:text-[20px] text-white group-hover:text-lime transition-colors">
                              {stage.heading}
                            </h3>
                          )}

                          <p className="body-copy mt-3 text-[13.5px] md:text-[14px] leading-relaxed text-white/65">
                            {stage.description}
                          </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                          {stage.tags && stage.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {stage.tags.map((t, idx) => {
                                const name = typeof t === "string" ? t : t.name;
                                return (
                                  <span
                                    key={`${name}-${idx}`}
                                    className="border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10.5px] text-white/70"
                                  >
                                    {name}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="kicker text-[10px] text-white/40">
                              {stepStr} / {totalStr}
                            </span>
                          )}
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}

            {(journey.cta_title || journey.cta_button) && (
              <Reveal delay={0.15}>
                <div className="mt-12 flex flex-col gap-5 border border-lime/30 bg-lime/[0.04] p-7 md:flex-row md:items-center md:justify-between md:p-9">
                  <div>
                    {journey.cta_title && (
                      <h3 className="h-title text-[20px] md:text-[24px] text-white">
                        {journey.cta_title}
                      </h3>
                    )}
                    {journey.cta_body && (
                      <p className="mt-2 text-[14px] text-white/65">{journey.cta_body}</p>
                    )}
                  </div>
                  {journey.cta_button && (
                    <a
                      href="#contact"
                      className="inline-flex shrink-0 items-center gap-2 bg-lime px-6 py-3.5 text-[13px] font-bold text-ink transition-all hover:bg-lime/90 hover:-translate-y-0.5"
                    >
                      <span>{journey.cta_button}</span>
                      <span aria-hidden="true">{dir === "rtl" ? "←" : "→"}</span>
                    </a>
                  )}
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </section>
  );
}
