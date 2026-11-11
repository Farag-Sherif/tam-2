import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";

/**
 * 07 OUR CLIENTS — partner/client tiles served dynamically from CMS API.
 */
export function Clients() {
  const { siteData, apiStatus } = useLang();
  const clients = siteData?.clients;
  const items = clients?.items ?? [];

  if (apiStatus !== "loading" && !clients) return null;

  return (
    <section id="clients" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!clients ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-56 bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4 border border-white/10">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-[110px] md:h-[130px] bg-ink" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <SectionHead
              index="07"
              kicker={clients.kicker ?? ""}
              title={clients.title ?? ""}
              lead={clients.subtitle ?? ""}
            />

            {items.length > 0 && (
              <div className="mt-12 grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4 border border-white/10">
                {items.map((client, i) => {
                  const content = (
                    <div
                      className="group flex h-[110px] w-full items-center justify-center bg-ink p-5 transition-all duration-300 hover:bg-indigo/25 md:h-[130px]"
                      title={client.name}
                    >
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.name}
                          loading="lazy"
                          className="max-h-12 max-w-[135px] object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 bg-white/15 transition-colors duration-300 group-hover:bg-lime"
                          />
                          <span className="font-display text-[11px] md:text-[12px] tracking-[0.2em] text-white/50 transition-colors duration-300 group-hover:text-white">
                            {client.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <Reveal key={client.id ?? `${client.name}-${i}`} delay={(i % 4) * 0.03}>
                      {client.website ? (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </Reveal>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
