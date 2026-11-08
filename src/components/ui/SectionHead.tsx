import { Reveal } from "./Reveal";

export function SectionHead({
  kicker,
  index,
  title,
  lead,
  align = "start",
}: {
  kicker: string;
  index?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      <Reveal>
        <div className={`flex items-center gap-3.5 ${centered ? "justify-center" : ""}`}>
          {index && (
            <span className="font-display text-[11px] font-bold tracking-[0.25em] text-lime">
              {index}
            </span>
          )}
          {index && <span className="h-px w-8 bg-lime/60" />}
          <span className="kicker text-white/60 font-semibold">{kicker}</span>
        </div>
      </Reveal>
      <Reveal delay={0.07}>
        <h2 className="h-title mt-4 text-white text-[28px] md:text-[36px]">{title}</h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.14}>
          <p
            className={`body-copy mt-3 max-w-[54ch] text-white/60 text-[14.5px] md:text-[15.5px] leading-relaxed ${
              centered ? "mx-auto" : ""
            }`}
          >
            {lead}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
