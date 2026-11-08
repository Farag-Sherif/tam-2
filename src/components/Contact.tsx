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
  const { c, dir, lang } = useLang();
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
            <span className="kicker text-white/55">{c.contact.kicker}</span>
            <h2 className="mt-6 text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold leading-[1.2] text-white font-ar">
              {c.contact.title}
            </h2>
            <p className="body-copy mt-5 max-w-[48ch] text-white/65">{c.contact.lead}</p>

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
                <span className="kicker text-[11px] text-white/50">{c.contact.details}</span>
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
                      ? lang === "ar" ? "جاري الإرسال..." : "Sending..."
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
                  {sent ? apiFeedback || c.contact.thanks : c.contact.reply}
                </span>
              </div>
            </form>
          </div>

          {/* Contact card — data exactly as the profile contact page */}
          <div className="relative h-full border border-white/12 bg-white/[0.02] p-6 md:p-8">
            <img src="/brand/logo-stacked.png" alt="TAM Booths & More" className="h-20 w-auto md:h-24" />
            <div className="mt-7 h-px w-full bg-white/12" />
            <div className="mt-6 space-y-4">
              {c.contact.rows.map(([k, v]) => {
                const isPhone = k.includes("Phone") || k.includes("الهاتف");
                const isEmail = k.includes("Email") || k.includes("البريد");
                const isWebsite = k.includes("Website") || k.includes("الموقع");

                let valNode: React.ReactNode = v;
                if (isPhone) {
                  valNode = (
                    <a
                      href="https://wa.me/201011116346"
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      style={{ direction: "ltr", unicodeBidi: "isolate" }}
                      className="inline-block font-mono text-[13.5px] text-lime hover:underline"
                    >
                      <bdi dir="ltr">{v}</bdi>
                    </a>
                  );
                } else if (isEmail) {
                  valNode = (
                    <a
                      href="mailto:inof@bluebrain-co.com"
                      dir="ltr"
                      style={{ direction: "ltr", unicodeBidi: "isolate" }}
                      className="inline-block text-[12.5px] text-lime hover:underline"
                    >
                      <bdi dir="ltr">{v}</bdi>
                    </a>
                  );
                } else if (isWebsite) {
                  valNode = (
                    <a
                      href="https://www.bluebrain-co.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      style={{ direction: "ltr", unicodeBidi: "isolate" }}
                      className="inline-block text-[12.5px] text-lime hover:underline"
                    >
                      <bdi dir="ltr">{v}</bdi>
                    </a>
                  );
                }
                return (
                  <div key={k} className="flex items-start justify-between gap-5 border-b border-white/5 pb-3">
                    <span className="shrink-0 text-[11px] font-medium text-white/40">{k}</span>
                    <span className="text-end text-[12.5px] leading-relaxed text-white/85">{valNode}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <a
                href="https://wa.me/201011116346"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3.5 text-xs font-bold text-white transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366] hover:text-ink"
              >
                <span>{lang === "ar" ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp"}</span>
                <span
                  dir="ltr"
                  style={{ direction: "ltr", unicodeBidi: "isolate" }}
                  className="font-mono text-lime font-bold group-hover:text-ink transition-colors"
                >
                  <bdi dir="ltr">(+2 010 1111 63 46)</bdi>
                </span>
              </a>
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
              © {new Date().getFullYear()} TAM. {c.contact.footerNote}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-display text-[9px] tracking-[0.2em] text-white/30">
              {c.contact.version}
            </span>
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
