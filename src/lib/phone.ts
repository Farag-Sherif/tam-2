import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js/max";

/**
 * Normalize Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩ / ۰۱۲۳۴۵۶۷۸۹) to ASCII.
 */
export function normalizeDigits(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Validate a mobile number using libphonenumber-js.
 * Accepts:
 *  - local Egyptian format (01xxxxxxxxx)
 *  - international with country code (+2010xxxxxxx, +9665xxxxxxxx ...)
 *  - international without the plus sign (2010xxxxxxx)
 * Returns the normalized E.164 string when valid.
 */
export function validatePhone(raw: string): { valid: boolean; e164: string } {
  const cleaned = normalizeDigits(String(raw || ""))
    .replace(/[\s\-().]/g, "")
    .trim();
  if (!cleaned) return { valid: false, e164: "" };

  const check = (parsed: ReturnType<typeof parsePhoneNumberFromString> | undefined) => {
    if (!parsed?.isValid()) return { valid: false, e164: "" };
    // Must be an actual mobile (or mobile/fixed-line) number — not landline-only
    const t = parsed.getType();
    const ok = t === "MOBILE" || t === "FIXED_LINE_OR_MOBILE";
    return ok ? { valid: true, e164: parsed.number } : { valid: false, e164: "" };
  };

  // With explicit country code
  if (cleaned.startsWith("+")) {
    return check(parsePhoneNumberFromString(cleaned));
  }

  // Local format — try Egypt (01xxxxxxxxx) first
  const egResult = check(parsePhoneNumberFromString(cleaned, "EG"));
  if (egResult.valid) return egResult;

  // Fallback: international without the plus sign
  return check(parsePhoneNumberFromString(`+${cleaned}`));
}

/** Convenience for server payloads: only returns a value when valid. */
export function phoneOrEmpty(raw: string): string {
  const { valid, e164 } = validatePhone(raw);
  return valid ? e164 : "";
}

export { AsYouType };
