import { useLang } from "../i18n/LangContext";
import { Reveal } from "./ui/Reveal";

/**
 * Latest TAM News & Announcements served dynamically from GET /api/v1/site (`news`).
 */
export function News() {
  const { c, dir, siteData, apiStatus } = useLang();
  const news = siteData?.news ?? [];

  if (apiStatus !== "loading" && news.length === 0) return null;

  const gridCols =
    news.length === 1
      ? "grid-cols-1"
      : news.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="news" className="relative border-t border-white/10 bg-ink py-14 md:py-20">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!siteData ? (
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="grid gap-px bg-white/10 md:grid-cols-2 border border-white/10">
              {[0, 1].map((i) => (
                <div key={i} className="h-44 bg-ink" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-0.5 w-7 bg-lime/80" />
                    <span className="kicker text-lime font-semibold">{c.newsUi.kicker}</span>
                  </div>
                  <h2 className="h-title mt-3 text-[clamp(1.4rem,2.6vw,2rem)] text-white">
                    {c.newsUi.title}
                  </h2>
                </div>
              </div>
            </Reveal>

            <div className={`mt-8 grid gap-px bg-white/10 border border-white/10 ${gridCols}`}>
              {news.map((item, i) => (
                <Reveal key={item.id ?? `${item.title}-${i}`} delay={i * 0.05}>
                  <article className="group flex h-full flex-col justify-between bg-ink p-6 md:p-8 transition-colors duration-300 hover:bg-white/[0.03]">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <time
                          dateTime={item.date}
                          dir="ltr"
                          className="font-mono text-[11px] tracking-[0.16em] text-lime/90 font-semibold"
                        >
                          {item.date}
                        </time>
                        <span className="h-1.5 w-1.5 bg-lime/40 transition-colors group-hover:bg-lime" aria-hidden="true" />
                      </div>
                      <h3 className="h-sub mt-4 text-[17px] md:text-[19px] text-white group-hover:text-lime transition-colors">
                        {item.title}
                      </h3>
                      <p className="body-copy mt-3 text-[13.5px] leading-relaxed text-white/65">
                        {item.excerpt}
                      </p>
                    </div>

                    {item.link && (
                      <div className="mt-5 border-t border-white/10 pt-3.5">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-lime/85 transition-colors hover:text-lime"
                        >
                          <span>{c.newsUi.readMore}</span>
                          <span aria-hidden="true" className="font-display text-[10px]">
                            {dir === "rtl" ? "←" : "↗"}
                          </span>
                        </a>
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
