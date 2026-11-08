import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import { Reveal } from "./ui/Reveal";

/**
 * 07 OUR CLIENTS — profile page 20: logos grid only, no extra copy.
 */
export function Clients() {
  const { c, lang } = useLang();
  const profileClients = c.clients.list;

  return (
    <section id="clients" className="relative border-t border-white/10 py-20 md:py-28 bg-ink">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHead index="07" kicker={c.clients.kicker} title={c.clients.title} lead={c.clients.lead} />

        <div className="mt-12 grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4 border border-white/10">
          {profileClients.map((client, i) => (
            <Reveal key={client.name} delay={(i % 4) * 0.03}>
              <div
                className="group flex h-[110px] items-center justify-center bg-ink p-5 transition-all duration-300 hover:bg-indigo/25 md:h-[130px]"
                title={lang === "ar" ? client.nameAr : client.name}
              >
                <img
                  src={client.logo}
                  alt={lang === "ar" ? client.nameAr : client.name}
                  loading="lazy"
                  className="max-h-12 max-w-[135px] object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center text-[11px] text-white/35">{c.clients.note}</div>
      </div>
    </section>
  );
}
