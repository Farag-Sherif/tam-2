import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useLang } from "../i18n/LangContext";
import { submitBrief, RateLimitError } from "../api/client";
import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Normalize Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩ / ۰۱۲۳۴۵۶۷۸۹) to ASCII.
 */
function normalizeDigits(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Validate a mobile number using libphonenumber-js.
 * Accepts local Egyptian format (01xxxxxxxxx), international (+20...), and
 * other supported country formats. Returns E.164 when valid.
 */
export function validatePhone(raw: string): { valid: boolean; e164: string } {
  const cleaned = normalizeDigits(raw).replace(/[\s\-().]/g, "").trim();
  if (!cleaned) return { valid: false, e164: "" };

  // With explicit country code
  if (cleaned.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(cleaned);
    return { valid: Boolean(parsed?.isValid()), e164: parsed?.number ?? "" };
  }

  // Local format — try Egypt (01xxxxxxxxx) first
  const eg = parsePhoneNumberFromString(cleaned, "EG");
  if (eg?.isValid()) return { valid: true, e164: eg.number };

  // Fallback: try as an international number without the plus sign
  const intl = parsePhoneNumberFromString(`+${cleaned}`);
  if (intl?.isValid()) return { valid: true, e164: intl.number };

  return { valid: false, e164: "" };
}

export function Contact() {
  const { c, dir, lang, siteData } = useLang();
  const contactApi = siteData?.contact;
  const footerApi = siteData?.footer;
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [reach, setReach] = useState("");
  const [details, setDetails] = useState("");
  const [reachError, setReachError] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Phone-or-email reach field: strict validation before submit
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(reach.trim());
  const phoneCheck = validatePhone(reach);
  const reachValid = isEmail || phoneCheck.valid;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reachValid) {
      setReachError(true);
      return;
    }
    setReachError(false);
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitBrief({
        name,
        contact: phoneCheck.valid && !isEmail ? phoneCheck.e164 : reach.trim(),
        details,
        locale: lang,
        website: honeypot,
      });

      setSent(true);
      if (res.message) setApiFeedback(res.message);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof RateLimitError
          ? lang === "ar"
            ? "تم إرسال عدة طلبات مؤخراً. يرجى الانتظار قليلاً قبل المحاولة مجدداً (429)."
            : "Too many requests. Please wait a moment before trying again (429)."
          : err instanceof Error
          ? err.message
          : lang === "ar"
          ? "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى."
          : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/10 bg-ink">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 55% at 12% 0%, rgba(15,6,102,0.55) 0%, transparent 65%), radial-gradient(45% 45% at 92% 92%, rgba(223,255,0,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
          <div>
            <span className="kicker text-white/55">{contactApi?.kicker ?? ""}</span>
            <h2 className="mt-6 text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold leading-[1.2] text-white font-ar">
              {contactApi?.title ?? ""}
            </h2>
            <p className="body-copy mt-5 max-w-[48ch] text-white/65">
              {contactApi?.subtitle ?? ""}
            </p>

            <form onSubmit={handleFormSubmit} className="mt-9 grid gap-5 sm:grid-cols-2">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                style={{ display: "none" }}
                aria-hidden="true"
              />

              <label className="block">
                <span className="kicker text-[11px] text-white/50">{c.contact.name}</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.contact.namePh}
                  className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 text-[14.5px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-lime"
                />
              </label>

              <label className="block">
                <span className="kicker text-[11px] text-white/50">{c.contact.reach}</span>
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  value={reach}
                  onChange={(e) => {
                    setReach(e.target.value);
                    setReachError(false);
                  }}
                  onBlur={() => {
                    if (reach.trim()) setReachError(!reachValid);
                  }}
                  placeholder={c.contact.reachPh}
                  aria-invalid={reachError}
                  aria-describedby={reachError ? "reach-error" : undefined}
                  className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 text-[14.5px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-lime"
                />
                {reachError && (
                  <span id="reach-error" className="mt-1.5 block text-[11.5px] text-red-300">
                    {c.contact.reachError}
                  </span>
                )}
              </label>

              <label className="block sm:col-span-2">
                <span className="kicker text-[11px] text-white/50">
                  {contactApi?.label_details ?? c.contact.detailsPh}
                </span>
                <textarea
                  rows={3}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={c.contact.detailsPh}
                  className="mt-2 w-full resize-none border-b border-white/20 bg-transparent py-2.5 text-[14.5px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-lime"
                />
              </label>

              {errorMessage && (
                <div className="sm:col-span-2 border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-200">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2.5 bg-lime px-7 py-3.5 text-[13.5px] font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {submitting
                      ? c.contact.submitting
                      : sent ? c.contact.sent : c.contact.submit}
                  </span>
                  <span aria-hidden="true" className="font-display text-[11px]">
                    {sent ? "✓" : dir === "rtl" ? "←" : "↗"}
                  </span>
                </button>

                {/* ONE "+" only — the decorative icon; label carries no plus */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 border border-lime/50 bg-lime/[0.08] px-6 py-3.5 text-[13.5px] font-bold text-lime transition-all duration-300 hover:border-lime hover:bg-lime hover:text-ink"
                >
                  <span aria-hidden="true" className="font-display text-sm leading-none">+</span>
                  <span>{c.contact.addDetailsBtn}</span>
                </button>

                <span className={`text-[12px] ${sent ? "text-lime font-medium" : "text-white/40"}`}>
                  {sent ? apiFeedback || c.contact.thanks : contactApi?.disclaimer ?? ""}
                </span>
              </div>
            </form>
          </div>

          {/* Contact card */}
          <div className="relative h-full border border-white/12 bg-white/[0.02] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <img
                src={siteData?.identity?.logo || "/brand/logo-stacked.png"}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/brand/logo-stacked.png";
                }}
                alt="TAM Booths & More"
                className="h-20 w-auto md:h-24 object-contain"
              />
              <div className="mt-7 h-px w-full bg-white/12" />
              <div className="mt-6 space-y-4">
                {(() => {
                  const identity = siteData?.identity;
                  const phoneVal =
                    identity?.phone?.trim() ||
                    (lang === "ar" ? "+2 010 1111 63 46" : "+2 010 1111 63 46");
                  const emailVal = identity?.email?.trim() || "Info@tam-eg.com";
                  const addressVal =
                    identity?.address?.trim() ||
                    (lang === "ar"
                      ? "مدينة العبور، الحي التاسع، شارع الثقافة، B18092، قطعه 4"
                      : "El Obour, District 9, Al-Thaqafa St., B18092, P4");

                  const getWhatsAppHref = (rawWa?: string | null, rawPhone?: string | null): string => {
                    if (rawWa && rawWa.trim()) {
                      const trimmed = rawWa.trim();
                      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                        return trimmed;
                      }
                      const digits = trimmed.replace(/\D/g, "");
                      if (digits) {
                        const formatted = digits.startsWith("01") ? `2${digits}` : digits;
                        return `https://wa.me/${formatted}`;
                      }
                    }
                    if (rawPhone && rawPhone.trim()) {
                      const digits = rawPhone.replace(/\D/g, "");
                      if (digits) {
                        const formatted = digits.startsWith("01") ? `2${digits}` : digits;
                        return `https://wa.me/${formatted}`;
                      }
                    }
                    return "https://wa.me/201011116346";
                  };

                  const waHref = getWhatsAppHref(identity?.whatsapp, identity?.phone);

                  const rows = [
                    {
                      label: c.contact.phoneLabel,
                      node: (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          style={{ direction: "ltr", unicodeBidi: "isolate" }}
                          className="inline-block font-mono text-[13.5px] text-lime hover:underline"
                        >
                          <bdi dir="ltr">{phoneVal}</bdi>
                        </a>
                      ),
                    },
                    {
                      label: c.contact.emailLabel,
                      node: (
                        <a
                          href={`mailto:${emailVal}`}
                          dir="ltr"
                          style={{ direction: "ltr", unicodeBidi: "isolate" }}
                          className="inline-block text-[12.5px] text-lime hover:underline"
                        >
                          <bdi dir="ltr">{emailVal}</bdi>
                        </a>
                      ),
                    },
                    {
                      label: c.contact.addressLabel,
                      node: (
                        <span className="inline-block text-[12.5px] leading-relaxed text-white/85">
                          {addressVal}
                        </span>
                      ),
                    },
                  ];

                  return rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-5 border-b border-white/5 pb-3"
                    >
                      <span className="shrink-0 text-[11px] font-medium text-white/40">{row.label}</span>
                      <span className="text-end text-[12.5px] leading-relaxed text-white/85">
                        {row.node}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <span className="text-[11px] font-medium text-white/45">{c.contact.connectLabel}</span>
              <div className="flex flex-wrap items-center gap-2.5">
                {(() => {
                  const identity = siteData?.identity;
                  const socials = identity?.socials;

                  const getWhatsAppHref = (rawWa?: string | null, rawPhone?: string | null): string => {
                    if (rawWa && rawWa.trim()) {
                      const trimmed = rawWa.trim();
                      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                        return trimmed;
                      }
                      const digits = trimmed.replace(/\D/g, "");
                      if (digits) {
                        const formatted = digits.startsWith("01") ? `2${digits}` : digits;
                        return `https://wa.me/${formatted}`;
                      }
                    }
                    if (rawPhone && rawPhone.trim()) {
                      const digits = rawPhone.replace(/\D/g, "");
                      if (digits) {
                        const formatted = digits.startsWith("01") ? `2${digits}` : digits;
                        return `https://wa.me/${formatted}`;
                      }
                    }
                    return "https://wa.me/201011116346";
                  };

                  const waHref = getWhatsAppHref(identity?.whatsapp, identity?.phone);

                  const socialItems = [
                    {
                      key: "whatsapp",
                      href: waHref,
                      label: c.contact.whatsappLabel,
                      color:
                        "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/25",
                      icon: <img src="/brand/whatsapp.svg" alt="" aria-hidden="true" className="h-5 w-5" />,
                      show: Boolean(waHref),
                    },
                    {
                      key: "facebook",
                      href: socials?.facebook || "https://www.facebook.com/tambooths",
                      label: c.contact.facebookLabel,
                      color:
                        "border-[#1877F2]/40 bg-[#1877F2]/10 text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/25",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
                        </svg>
                      ),
                      show: Boolean(socials ? socials.facebook && socials.facebook.trim() : true),
                    },
                    {
                      key: "linkedin",
                      href: socials?.linkedin,
                      label: c.contact.linkedinLabel,
                      color:
                        "border-[#0A66C2]/40 bg-[#0A66C2]/10 text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/25",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74V9.92H5.07v8.58h2.78Z" />
                        </svg>
                      ),
                      show: Boolean(socials?.linkedin && socials.linkedin.trim()),
                    },
                    {
                      key: "instagram",
                      href: socials?.instagram,
                      label: c.contact.instagramLabel,
                      color:
                        "border-[#E4405F]/40 bg-[#E4405F]/10 text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/25",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                      ),
                      show: Boolean(socials?.instagram && socials.instagram.trim()),
                    },
                    {
                      key: "x",
                      href: socials?.x || socials?.twitter,
                      label: c.contact.xLabel,
                      color: "border-white/30 bg-white/5 text-white hover:border-white hover:bg-white/20",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                      show: Boolean(
                        (socials?.x && socials.x.trim()) ||
                          (socials?.twitter && socials.twitter.trim())
                      ),
                    },
                    {
                      key: "youtube",
                      href: socials?.youtube,
                      label: c.contact.youtubeLabel,
                      color:
                        "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/25",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                      show: Boolean(socials?.youtube && socials.youtube.trim()),
                    },
                    {
                      key: "tiktok",
                      href: socials?.tiktok,
                      label: c.contact.tiktokLabel,
                      color:
                        "border-[#00f2fe]/40 bg-[#00f2fe]/10 text-[#00f2fe] hover:border-[#00f2fe] hover:bg-[#00f2fe]/25",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49v-6.5a8.16 8.16 0 0 0 4.9 1.63v-3.5a4.85 4.85 0 0 1-1-.6z" />
                        </svg>
                      ),
                      show: Boolean(socials?.tiktok && socials.tiktok.trim()),
                    },
                  ];

                  return socialItems
                    .filter(
                      (item): item is typeof item & { href: string } =>
                        Boolean(item.show && item.href)
                    )
                    .map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className={`flex h-10 w-10 items-center justify-center border transition-all duration-300 hover:-translate-y-0.5 ${item.color}`}
                      >
                        {item.icon}
                      </a>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-white/10 bg-ink">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-5 py-6 md:flex-row md:items-center md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <img src="/brand/logo-alt.png" alt="TAM" className="h-4 w-auto opacity-75" />
            <span className="text-[11px] text-white/35">
              {footerApi?.copyright || `© ${new Date().getFullYear()} TAM.`}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {footerApi?.guidelines && (
              <span className="font-display text-[9px] tracking-[0.2em] text-white/30">
                {footerApi.guidelines}
              </span>
            )}
            <a href="#top" className="text-[11px] text-white/55 transition-colors hover:text-lime">
              {c.contact.up}
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BoothConfigModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={{ name, reach, details }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// Local import to avoid circular type noise; the modal lives in its own file.
import { BoothConfigModal } from "./BoothConfigModal";
