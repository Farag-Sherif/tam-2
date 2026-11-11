import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";

export function Services() {
  const { c, dir, siteData, apiStatus } = useLang();
  const services = siteData?.services;
  const items = services?.items ?? [];

  if (apiStatus !== "loading" && !services) return null;

  return (
    <section id="services" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!services ? (
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-white/10 rounded" />
            <div className="grid gap-5 md:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-56 border border-white/10 bg-white/[0.02]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <SectionHead
              index="03"
              kicker={services.kicker || ""}
              title={services.title || ""}
              lead={services.subtitle}
            />

            {items.length > 0 && (
              <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => {
                  const numStr = String(i + 1).padStart(2, "0");
                  const totalStr = String(items.length).padStart(2, "0");
                  return (
                    <Reveal key={`${item.title}-${i}`} delay={(i % 3) * 0.05}>
                      <article className="group relative flex h-full flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.02] p-6 md:p-8 transition-colors duration-500 hover:border-lime/45">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-display text-[11px] tracking-[0.24em] font-bold text-lime">
                              {numStr}
                            </span>
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex flex-wrap justify-end gap-1.5">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="border border-lime/25 bg-lime/[0.06] px-2 py-0.5 text-[10px] font-medium text-lime/90"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <h3 className="h-sub mt-6 text-[18px] md:text-[20px] text-white group-hover:text-lime transition-colors duration-300">
                            {item.title}
                          </h3>

                          {item.summary && (
                            <p className="mt-2 text-[12.5px] font-medium text-lime/80">
                              {item.summary}
                            </p>
                          )}

                          <p className="body-copy mt-3 text-[13.5px] leading-relaxed text-white/65">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                          <span className="kicker text-[10px] text-white/40">
                            {numStr} / {totalStr}
                          </span>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}

            <div className="mt-10 text-end">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 border border-white/20 bg-white/[0.02] px-5 py-3 text-[13px] text-white/85 transition-all hover:border-lime hover:text-lime"
              >
                <span>{services.cta || c.nav.cta}</span>
                <span
                  className={`font-display text-[11px] ${
                    dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
                  } transition-transform`}
                >
                  {dir === "rtl" ? "←" : "→"}
                </span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
