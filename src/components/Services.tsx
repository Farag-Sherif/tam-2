import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";

/**
 * 03 SERVICES — the profile's 5 services + & MORE, verbatim.
 */
export function Services() {
  const { c, dir, lang } = useLang();
  const stages = c.services.stages;
  const andMore = c.services.andMoreItems;

  return (
    <section id="services" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead
          index="03"
          kicker={c.services.kicker}
          title={c.services.title}
          lead={c.services.lead}
        />

        {/* 5 services — exactly as the profile page 7 */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stages.map((s, i) => {
            const featured = "big" in s && Boolean(s.big);
            const img = "img" in s ? (s.img as string | undefined) : undefined;
            return (
              <article
                key={s.n}
                className={`group relative overflow-hidden border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-lime/40 ${
                  featured ? "md:col-span-2" : ""
                }`}
              >
                {img ? (
                  <div className="absolute inset-0">
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-35 transition-all duration-[1100ms] group-hover:scale-105 group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
                  </div>
                ) : null}

                <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
                  <span className="font-display text-[11px] tracking-[0.24em] font-bold text-lime">
                    {s.n}
                  </span>
                  <h3
                    className={`mt-auto pt-10 text-white group-hover:text-lime transition-colors duration-300 ${
                      featured ? "h-title text-[22px] md:text-[26px]" : "h-sub text-[18px]"
                    }`}
                  >
                    {s.t}
                  </h3>
                  <p className={`body-copy mt-3 text-white/65 ${featured ? "max-w-[48ch] text-[14.5px]" : "text-[13.5px]"}`}>
                    {s.d}
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <span className="kicker text-[10px] text-white/40">0{i + 1} / 05</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* & MORE — profile page 7 bottom line */}
        <div className="mt-14 border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="kicker text-[11px] font-bold tracking-wider text-lime">
                {lang === "ar" ? "خدمات مكملة" : "& MORE"}
              </span>
              <h3 className="h-title mt-2 text-white text-[20px] md:text-[24px]">
                {c.services.andMoreTitle}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {andMore.map((item) => (
                <div
                  key={item.title}
                  className="border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-lime/40"
                >
                  <span className="font-display text-base text-lime">{item.icon}</span>
                  <h4 className="mt-2 text-[13.5px] font-bold text-white">{item.title}</h4>
                  <p className="mt-1 text-[11.5px] text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 border-t border-white/10 pt-4 text-[13px] text-white/55">
            {c.services.andMoreLead}
          </p>
        </div>

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
