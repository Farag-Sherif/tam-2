import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "../i18n/LangContext";
import { submitBrief, RateLimitError } from "../api/client";
import { validatePhone } from "../lib/phone";

const BRAND_PALETTE = [
  { name: "Blue", hex: "#2563EB" },
  { name: "Dark Ink", hex: "#0F172A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "TAM Lime", hex: "#DFFF00" },
];

const CURRENT_YEAR = new Date().getFullYear();

export interface ConfiguratorData {
  width: number;
  depth: number;
  height: number;
  boothType: "inline" | "corner" | "peninsula" | "island";
  selectedStyles: string[];
  selectedColors: string[];
  selectedFeatures: string[];
  industry: string;
  name: string;
  phone: string;
  company: string;
  budget: number;
  notes: string;
  logoFileName?: string;
}

export interface BoothConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name?: string;
    reach?: string;
    details?: string;
  };
  onComplete?: (data: ConfiguratorData) => void;
}

export function BoothConfigModal({
  isOpen,
  onClose,
  initialData,
  onComplete,
}: BoothConfigModalProps) {
  const { c, dir, lang } = useLang();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccessMsg, setApiSuccessMsg] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  // Step 1: Dimensions
  const [width, setWidth] = useState(6);
  const [depth, setDepth] = useState(4);
  const [height, setHeight] = useState(3);

  // Step 2: Booth Type
  const [boothType, setBoothType] = useState<"inline" | "corner" | "peninsula" | "island">("island");

  // Step 3: Style & Industry
  const [selectedStyles, setSelectedStyles] = useState<string[]>(() =>
    lang === "ar" ? ["عصري", "تقني"] : ["Modern", "Tech"]
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(["#2563EB", "#DFFF00"]);
  const [industry, setIndustry] = useState("");
  const [logoFileName, setLogoFileName] = useState("");

  // Step 4: Features
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["led_screen", "reception"]);

  // Step 5: Budget & Notes
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.reach || "");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState(10000);
  const [notes, setNotes] = useState(initialData?.details || "");
  const hasPrefilled = Boolean(initialData?.name || initialData?.reach || initialData?.details);

  // Handle escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Remember what had focus, then focus the close button (focus-in)
    const previouslyFocused = document.activeElement as HTMLElement | null;
    window.setTimeout(() => {
      document.getElementById("configurator-close")?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Focus trap: keep Tab cycling inside the dialog panel
      if (e.key === "Tab") {
        const panel = document.getElementById("booth-configurator-panel");
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([tabindex="-1"]), input:not([tabindex="-1"]), select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
      // Focus return to the element that opened the dialog
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  const area = (width * depth).toFixed(1);
  const volume = (width * depth * height).toFixed(1);

  // Validation rules per step
  const isStep1Valid = width >= 2 && width <= 50 && depth >= 2 && depth <= 50 && height >= 2 && height <= 10;
  const isStep2Valid = Boolean(boothType);
  const isStep3Valid = selectedStyles.length > 0 && industry.trim().length > 0 && selectedColors.length > 0;
  const isStep4Valid = selectedFeatures.length > 0;
  const phoneCheck = validatePhone(phone);
  const isStep5Valid = name.trim().length >= 2 && phoneCheck.valid && budget >= 1000;

  // Strict step accessibility gate
  const canAccessStep = (targetStep: number): boolean => {
    if (targetStep <= 1) return true;
    if (!isStep1Valid) return false;
    if (targetStep === 2) return true;
    if (!isStep2Valid) return false;
    if (targetStep === 3) return true;
    if (!isStep3Valid) return false;
    if (targetStep === 4) return true;
    if (!isStep4Valid) return false;
    if (targetStep === 5) return true;
    if (!isStep5Valid) return false;
    return true;
  };

  const isCurrentStepValid: boolean = (() => {
    switch (step) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      case 5:
        return isStep5Valid;
      case 6:
        return true;
      default:
        return false;
    }
  })();

  const currentStepWarning: string = (() => {
    switch (step) {
      case 1:
        return isStep1Valid ? "" : c.configurator.validation.step1;
      case 2:
        return isStep2Valid ? "" : c.configurator.validation.step2;
      case 3:
        return isStep3Valid ? "" : c.configurator.validation.step3;
      case 4:
        return isStep4Valid ? "" : c.configurator.validation.step4;
      case 5:
        return isStep5Valid ? "" : c.configurator.validation.step5;
      default:
        return "";
    }
  })();

  const toggleStyle = (st: string) => {
    setSelectedStyles((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(hex)) return prev.filter((c) => c !== hex);
      if (prev.length >= 3) return [prev[1], prev[2], hex];
      return [...prev, hex];
    });
  };

  const toggleFeature = (fid: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(fid) ? prev.filter((f) => f !== fid) : [...prev, fid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentStepValid) return;

    setSubmitting(true);
    setApiError(null);

    const configData: ConfiguratorData = {
      width,
      depth,
      height,
      boothType,
      selectedStyles,
      selectedColors,
      selectedFeatures,
      industry,
      name,
      phone,
      company,
      budget,
      notes,
      logoFileName,
    };

    try {
      const res = await submitBrief({
        name,
        contact: phoneCheck.e164 || phone.trim(),
        details:
          notes ||
          `${width}x${depth}m (${height}m H) ${boothType.toUpperCase()} stand — ${industry || "Exhibition"}`,
        locale: lang,
        website: honeypot,
        specification: {
          width,
          depth,
          height,
          booth_type: boothType,
          industry,
          styles: selectedStyles,
          colors: selectedColors,
          features: selectedFeatures,
          budget,
          company,
          notes,
        },
      });

      if (res.message) {
        setApiSuccessMsg(res.message);
      }
      setSubmitted(true);
      if (onComplete) {
        onComplete(configData);
      }
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        setApiError(
          lang === "ar"
            ? "تم تجاوز معدل الإرسال المسموح (خطأ 429). يرجى الانتظار قليلاً قبل المحاولة مجدداً."
            : "Rate limit exceeded (429). Please wait a moment before trying again."
        );
      } else {
        setApiError(
          err instanceof Error
            ? err.message
            : lang === "ar"
            ? "تعذر إرسال المواصفات إلى الخادم."
            : "Failed to submit specifications to the API server."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        id="booth-configurator-panel"
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col border border-white/15 bg-[#0A0D08]/95 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white my-auto overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booth-configurator-title"
      >
          {/* Top Radial Ambient Glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 0%, rgba(15, 5, 102, 0.8) 0%, transparent 70%), radial-gradient(35% 35% at 90% 90%, rgba(223, 255, 0, 0.08) 0%, transparent 70%)",
            }}
          />

          {/* Modal Header */}
          <div className="relative shrink-0 border-b border-white/10 px-6 py-5 md:px-8 md:py-6 bg-ink/90">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
                  <span className="kicker text-[11px] text-white/50 tracking-wider">
                    {c.configurator.kicker}
                  </span>
                  <span className="font-mono text-[10px] text-lime/80 border border-lime/30 px-1.5 py-0.5">
                    v1.0 · {CURRENT_YEAR}
                  </span>
                </div>
                <h2 id="booth-configurator-title" className="mt-1 text-xl md:text-2xl font-bold text-white font-display">
                  {c.configurator.title}
                </h2>
                <p className="mt-1 text-xs text-white/60 max-w-2xl line-clamp-1">
                  {c.configurator.lead}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                id="configurator-close"
                onClick={onClose}
                aria-label={c.contact.closeModal}
                className="group flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 bg-white/[0.03] text-white/60 transition-all duration-200 hover:border-lime hover:bg-lime hover:text-ink"
              >
                <span className="text-base font-bold leading-none">✕</span>
              </button>
            </div>

            {/* Pre-fill Notification Badge */}
            {hasPrefilled && (
              <div className="mt-3 flex items-center gap-2 border border-lime/30 bg-lime/[0.07] px-3 py-1.5 text-[11px] text-lime">
                <span>✓</span>
                <span>{c.contact.prefilledAlert}</span>
              </div>
            )}

            {/* Stepper Navigation Bar */}
            <div className="mt-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
              {c.configurator.steps.map((sLabel, idx) => {
                const stepNum = idx + 1;
                const isCurrent = step === stepNum && !submitted;
                const isCompleted = step > stepNum || submitted;
                const accessible = canAccessStep(stepNum);

                return (
                  <button
                    key={sLabel}
                    type="button"
                    disabled={!accessible && !submitted}
                    onClick={() => {
                      if (!accessible && !submitted) return;
                      if (submitted) setSubmitted(false);
                      setStep(stepNum);
                    }}
                    title={
                      !accessible && !submitted
                        ? c.configurator.validation.lockedStepTooltip
                        : sLabel
                    }
                    className={`group flex items-center gap-2 shrink-0 rounded-full px-3 py-1.5 text-[11px] transition-all duration-200 border ${
                      isCurrent
                        ? "border-lime bg-lime text-ink font-bold shadow-[0_0_15px_rgba(223,255,0,0.35)]"
                        : isCompleted
                        ? "border-lime/40 bg-lime/[0.08] text-white hover:border-lime hover:text-lime"
                        : accessible
                        ? "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white"
                        : "border-white/5 bg-white/[0.01] text-white/25 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-display font-bold ${
                        isCurrent
                          ? "bg-ink text-lime"
                          : isCompleted
                          ? "bg-lime text-ink"
                          : accessible
                          ? "bg-white/10 text-white/60"
                          : "bg-white/5 text-white/20"
                      }`}
                    >
                      {isCompleted ? "✓" : !accessible ? "🔒" : stepNum}
                    </span>
                    <span className="font-medium whitespace-nowrap">{sLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Content Area (Scrollable) */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                /* Success Screen */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-lime bg-lime/10 text-lime text-3xl shadow-[0_0_35px_rgba(223,255,0,0.4)]">
                    ✓
                  </div>
                  <h3 className="h-title mt-6 text-2xl md:text-3xl font-bold text-white">
                    {c.configurator.step6.successTitle}
                  </h3>
                  <p className="body-copy mt-3 max-w-xl mx-auto text-white/70 text-[14px]">
                    {apiSuccessMsg || c.configurator.step6.successLead}
                  </p>

                  <div className="mt-7 border border-white/10 bg-white/[0.02] p-5 max-w-lg mx-auto text-start">
                    <div className="text-[11px] font-display text-lime font-bold tracking-wider">
                      {c.configurator.step6.specSheet}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/40">{c.configurator.step1.area}:</span>{" "}
                        <span className="text-white font-bold">{area} m²</span>
                      </div>
                      <div>
                        <span className="text-white/40">{c.configurator.step2.title}:</span>{" "}
                        <span className="text-white font-bold uppercase">{boothType}</span>
                      </div>
                      <div>
                        <span className="text-white/40">{c.configurator.step5.budgetLabel}:</span>{" "}
                        <span className="text-lime font-bold">
                          ${budget.toLocaleString()} {lang === "ar" ? "دولار" : "USD"}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40">{c.configurator.step5.name}:</span>{" "}
                        <span className="text-white font-bold">{name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 bg-lime px-6 py-3 text-xs font-bold text-ink shadow-[0_0_20px_rgba(223,255,0,0.35)] hover:shadow-[0_0_30px_rgba(223,255,0,0.5)] transition-all"
                    >
                      <span>{c.contact.closeModal}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-xs font-semibold text-white/80 hover:border-lime hover:text-lime transition-all"
                    >
                      {c.configurator.step6.restartBtn}
                    </button>
                  </div>
                </motion.div>
              ) : step === 1 ? (
                /* Step 1: Dimensions */
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step1.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step1.sub}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-3">
                    {/* Width Controller */}
                    <div className="border border-white/10 bg-white/[0.015] p-5 text-center">
                      <div className="kicker text-[11px] text-white/50 flex items-center justify-center gap-1.5">
                        <span>↔</span>
                        <span>{c.configurator.step1.width}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setWidth((prev) => Math.max(2, prev - 1))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={width}
                          onChange={(e) => setWidth(Math.max(2, Math.min(50, Number(e.target.value) || 2)))}
                          className="w-16 bg-transparent text-center font-display text-2xl font-bold text-lime outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setWidth((prev) => Math.min(50, prev + 1))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2 text-[11px] text-white/40">
                        {width}m × {depth}m = {area} m²
                      </div>
                    </div>

                    {/* Depth Controller */}
                    <div className="border border-white/10 bg-white/[0.015] p-5 text-center">
                      <div className="kicker text-[11px] text-white/50 flex items-center justify-center gap-1.5">
                        <span>↕</span>
                        <span>{c.configurator.step1.depth}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setDepth((prev) => Math.max(2, prev - 1))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={depth}
                          onChange={(e) => setDepth(Math.max(2, Math.min(50, Number(e.target.value) || 2)))}
                          className="w-16 bg-transparent text-center font-display text-2xl font-bold text-lime outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setDepth((prev) => Math.min(50, prev + 1))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2 text-[11px] text-white/40">
                        {depth}m
                      </div>
                    </div>

                    {/* Height Controller */}
                    <div className="border border-white/10 bg-white/[0.015] p-5 text-center">
                      <div className="kicker text-[11px] text-white/50 flex items-center justify-center gap-1.5">
                        <span>↑</span>
                        <span>{c.configurator.step1.height}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.max(2.5, prev - 0.5))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step={0.5}
                          min={2}
                          max={10}
                          value={height}
                          onChange={(e) => setHeight(Math.max(2, Math.min(10, Number(e.target.value) || 2)))}
                          className="w-16 bg-transparent text-center font-display text-2xl font-bold text-lime outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.min(8, prev + 0.5))}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 hover:border-lime hover:text-lime transition-all text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2 text-[11px] text-white/40">
                        {height}m
                      </div>
                    </div>
                  </div>

                  {/* Visual Footprint & Calculation Bar */}
                  <div className="mt-6 grid grid-cols-2 gap-4 border border-white/10 bg-indigo/30 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-e border-white/10 pe-4">
                      <span className="text-xs text-white/50">{c.configurator.step1.area}</span>
                      <span className="font-display text-xl sm:text-2xl font-bold text-lime">
                        {area} <span className="text-xs font-sans text-white/70">m²</span>
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 ps-2">
                      <span className="text-xs text-white/50">{c.configurator.step1.volume}</span>
                      <span className="font-display text-xl sm:text-2xl font-bold text-lime">
                        {volume} <span className="text-xs font-sans text-white/70">m³</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : step === 2 ? (
                /* Step 2: Booth Type */
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step2.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step2.sub}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {c.configurator.step2.types.map((type) => {
                      const isSelected = boothType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setBoothType(type.id as typeof boothType)}
                          className={`group flex flex-col items-center justify-between p-5 text-center transition-all duration-300 border ${
                            isSelected
                              ? "border-lime bg-lime/10 shadow-[0_0_20px_-5px_rgba(223,255,0,0.3)]"
                              : "border-white/10 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex h-16 w-16 items-center justify-center">
                            {type.id === "inline" && (
                              <svg width="44" height="44" viewBox="0 0 48 48" className="stroke-current">
                                <rect x="8" y="8" width="32" height="32" fill="none" strokeWidth="2" strokeDasharray="32 0 32 32" className={isSelected ? "stroke-lime" : "stroke-white/40"} />
                                <line x1="8" y1="8" x2="40" y2="8" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <line x1="8" y1="8" x2="8" y2="40" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <line x1="40" y1="8" x2="40" y2="40" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <path d="M24 38 L24 24 M20 28 L24 24 L28 28" fill="none" strokeWidth="1.5" className={isSelected ? "stroke-lime" : "stroke-white/30"} />
                              </svg>
                            )}
                            {type.id === "corner" && (
                              <svg width="44" height="44" viewBox="0 0 48 48" className="stroke-current">
                                <line x1="8" y1="8" x2="40" y2="8" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <line x1="8" y1="8" x2="8" y2="40" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <rect x="8" y="8" width="32" height="32" fill="none" strokeWidth="1" strokeDasharray="4 4" className={isSelected ? "stroke-lime/50" : "stroke-white/20"} />
                                <path d="M24 34 L32 26 M32 32 L32 26 L26 26" fill="none" strokeWidth="1.5" className={isSelected ? "stroke-lime" : "stroke-white/30"} />
                              </svg>
                            )}
                            {type.id === "peninsula" && (
                              <svg width="44" height="44" viewBox="0 0 48 48" className="stroke-current">
                                <line x1="8" y1="8" x2="40" y2="8" strokeWidth="3" className={isSelected ? "stroke-lime" : "stroke-white/80"} />
                                <rect x="8" y="8" width="32" height="32" fill="none" strokeWidth="1" strokeDasharray="4 4" className={isSelected ? "stroke-lime/50" : "stroke-white/20"} />
                                <path d="M24 38 L24 22 M20 26 L24 22 L28 26" fill="none" strokeWidth="1.5" className={isSelected ? "stroke-lime" : "stroke-white/30"} />
                              </svg>
                            )}
                            {type.id === "island" && (
                              <svg width="44" height="44" viewBox="0 0 48 48" className="stroke-current">
                                <rect x="14" y="14" width="20" height="20" fill={isSelected ? "rgba(223,255,0,0.15)" : "none"} strokeWidth="2" className={isSelected ? "stroke-lime" : "stroke-white/70"} />
                                <rect x="6" y="6" width="36" height="36" fill="none" strokeWidth="1" strokeDasharray="3 3" className={isSelected ? "stroke-lime/40" : "stroke-white/20"} />
                                <circle cx="24" cy="24" r="3" fill={isSelected ? "#DFFF00" : "#FFFFFF"} />
                              </svg>
                            )}
                          </div>

                          <div className="mt-3">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-lime transition-colors">
                              {type.name}
                            </h4>
                            <span className="mt-1 block text-[10.5px] text-white/50 font-medium">
                              {type.sides}
                            </span>
                          </div>

                          <div className="mt-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold border ${
                                isSelected
                                  ? "border-lime bg-lime text-ink"
                                  : "border-white/10 text-white/40"
                              }`}
                            >
                              {isSelected
                                ? lang === "ar"
                                  ? "✓ تم الاختيار"
                                  : "✓ SELECTED"
                                : lang === "ar"
                                ? "اختيار"
                                : "SELECT"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : step === 3 ? (
                /* Step 3: Style & Industry */
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step3.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step3.sub}
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Industry Dropdown (Mandatory) */}
                    <div>
                      <label className="kicker text-[11px] text-white/60 block flex items-center gap-1">
                        <span>{c.configurator.step3.industryLabel}</span>
                        <span className="text-lime font-bold">*</span>
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={`mt-2 w-full border bg-ink px-4 py-2.5 text-xs md:text-sm text-white outline-none transition-colors ${
                          !industry ? "border-lime/60 focus:border-lime" : "border-white/20 focus:border-lime"
                        }`}
                      >
                        <option value="" disabled className="bg-ink text-white/40">
                          {c.configurator.step3.industryPh}
                        </option>
                        {c.configurator.step3.industries.map((ind) => (
                          <option key={ind} value={ind} className="bg-ink text-white">
                            {ind}
                          </option>
                        ))}
                      </select>
                      {!industry && (
                        <p className="mt-1 text-[11px] text-lime/80 font-medium">
                          * {c.configurator.validation.step3}
                        </p>
                      )}
                    </div>

                    {/* Design Style */}
                    <div>
                      <label className="kicker text-[11px] text-white/60 block flex items-center gap-1">
                        <span>{c.configurator.step3.styleLabel}</span>
                        <span className="text-lime font-bold">*</span>
                      </label>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {c.configurator.step3.styles.map((styleName) => {
                          const isChosen = selectedStyles.includes(styleName);
                          return (
                            <button
                              key={styleName}
                              type="button"
                              onClick={() => toggleStyle(styleName)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                                isChosen
                                  ? "border-lime bg-lime text-ink shadow-[0_0_15px_rgba(223,255,0,0.3)]"
                                  : "border-white/15 bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              {styleName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Brand Colors */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="kicker text-[11px] text-white/60 block flex items-center gap-1">
                          <span>{c.configurator.step3.colorLabel}</span>
                          <span className="text-lime font-bold">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-lime">
                          {selectedColors.length}/3 {c.configurator.step3.colorSelected}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                        {BRAND_PALETTE.map((pal) => {
                          const isSelected = selectedColors.includes(pal.hex);
                          return (
                            <button
                              key={pal.name}
                              type="button"
                              onClick={() => toggleColor(pal.hex)}
                              title={pal.name}
                              className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                                isSelected
                                  ? "ring-2 ring-lime ring-offset-2 ring-offset-ink scale-105"
                                  : "opacity-80 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: pal.hex }}
                            >
                              {isSelected && (
                                <span
                                  className={`text-[10px] font-bold ${
                                    pal.hex === "#FFFFFF" || pal.hex === "#DFFF00"
                                      ? "text-ink"
                                      : "text-white"
                                  }`}
                                >
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Brand Logo Upload (Optional) */}
                    <div>
                      <label className="kicker text-[11px] text-white/50 block">
                        {c.configurator.step3.logoLabel}
                      </label>
                      <label className="mt-2 flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/20 bg-white/[0.015] px-4 py-4 text-center hover:border-lime/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setLogoFileName(file.name);
                          }}
                          className="hidden"
                        />
                        <span className="text-lg text-lime">📁</span>
                        <span className="mt-1 text-xs text-white/70">
                          {logoFileName || c.configurator.step3.logoUpload}
                        </span>
                        {logoFileName && (
                          <span className="mt-1 text-[10px] text-lime font-mono">
                            ✓ {c.configurator.step3.logoAttached}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </motion.div>
              ) : step === 4 ? (
                /* Step 4: Booth Features */
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step4.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step4.sub}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {c.configurator.step4.features.map((feat) => {
                      const isSelected = selectedFeatures.includes(feat.id);
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className={`group flex items-start gap-3.5 p-4 text-start transition-all duration-300 border ${
                            isSelected
                              ? "border-lime bg-lime/10 shadow-[0_0_20px_-5px_rgba(223,255,0,0.25)]"
                              : "border-white/10 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-base transition-colors ${
                              isSelected ? "bg-lime text-ink" : "bg-white/10 text-white/60"
                            }`}
                          >
                            {feat.id === "led_screen" && "🖥️"}
                            {feat.id === "reception" && "🛎️"}
                            {feat.id === "meeting_room" && "🤝"}
                            {feat.id === "storage" && "📦"}
                            {feat.id === "double_deck" && "🏗️"}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-lime transition-colors">
                                {feat.name}
                              </h4>
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                                  isSelected ? "bg-lime text-ink" : "border border-white/20 text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                              {feat.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : step === 5 ? (
                /* Step 5: Budget & Notes / Contact Info */
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step5.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step5.sub}
                    </p>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="kicker text-[11px] text-white/60 block flex items-center justify-between">
                          <span>
                            {c.configurator.step5.name} <span className="text-lime">*</span>
                          </span>
                          {name && <span className="text-[10px] text-lime font-mono">✓</span>}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={c.configurator.step5.namePh}
                          className="mt-2 w-full border-b border-white/20 bg-transparent py-2 text-xs md:text-sm text-white outline-none focus:border-lime placeholder:text-white/25 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="kicker text-[11px] text-white/60 block flex items-center justify-between">
                          <span>
                            {c.configurator.step5.phone} <span className="text-lime">*</span>
                          </span>
                          {phone && phoneCheck.valid && <span className="text-[10px] text-lime font-mono">✓</span>}
                        </label>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={c.configurator.step5.phonePh}
                          aria-invalid={Boolean(phone.trim()) && !phoneCheck.valid}
                          className="mt-2 w-full border-b bg-transparent py-2 text-xs md:text-sm text-white outline-none transition-colors placeholder:text-white/25 border-white/20 focus:border-lime"
                        />
                        {phone.trim() && !phoneCheck.valid && (
                          <span className="mt-1.5 block text-[11px] text-red-300">
                            {c.configurator.validation.phone}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="kicker text-[11px] text-white/50 block">
                          {c.configurator.step5.company}
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder={c.configurator.step5.companyPh}
                          className="mt-2 w-full border-b border-white/20 bg-transparent py-2 text-xs md:text-sm text-white outline-none focus:border-lime placeholder:text-white/25 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Budget Slider */}
                    <div className="border border-white/10 bg-white/[0.015] p-5">
                      <div className="flex items-center justify-between">
                        <span className="kicker text-[11px] text-white/50">
                          {c.configurator.step5.budgetLabel}
                        </span>
                        <span className="font-display text-lg font-bold text-lime">
                          ${budget.toLocaleString()}{" "}
                          <span className="text-xs font-sans text-white/60">
                            {lang === "ar" ? "دولار" : "USD"}
                          </span>
                        </span>
                      </div>

                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="mt-3.5 h-1.5 w-full cursor-pointer appearance-none bg-white/20 accent-lime outline-none"
                      />

                      <div className="mt-1.5 flex justify-between text-[10px] font-mono text-white/35">
                        <span>$1,000</span>
                        <span>$10,000</span>
                        <span>$25,000</span>
                        <span>$50,000+</span>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="kicker text-[11px] text-white/50 block">
                        {c.configurator.step5.notes}
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={c.configurator.step5.notesPh}
                        className="mt-2 w-full resize-none border border-white/20 bg-ink p-3 text-xs text-white outline-none focus:border-lime placeholder:text-white/25 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Step 6: Review & Final Submit */
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: dir === "rtl" ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === "rtl" ? 15 : -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="h-title text-xl font-bold text-white">
                      {c.configurator.step6.title}
                    </h3>
                    <p className="body-copy mt-1 text-xs text-white/55">
                      {c.configurator.step6.sub}
                    </p>
                  </div>

                  {/* Architectural Spec Sheet Card */}
                  <div className="mt-6 border border-white/12 bg-white/[0.015] p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-xs sm:text-sm font-bold text-lime">TAM SPECIFICATION</span>
                        <span className="text-[10px] text-white/30 font-mono">v1.0 · {CURRENT_YEAR}</span>
                      </div>
                      <span className="font-display text-[9px] tracking-widest text-white/40">CONFIDENTIAL</span>
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {/* Dimension Spec */}
                      <div className="border-b sm:border-b-0 sm:border-e border-white/10 pb-3 sm:pb-0 sm:pe-4">
                        <div className="flex items-center justify-between">
                          <span className="kicker text-[10px] text-lime font-bold">01. {c.configurator.step6.dimensionsHeader}</span>
                          <button type="button" onClick={() => setStep(1)} className="text-[10px] text-white/40 hover:text-lime underline">
                            {c.configurator.step6.editBtn}
                          </button>
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="text-white/60">
                            {width}m (W) × {depth}m (D) × {height}m (H)
                          </div>
                          <div>
                            <span className="text-white font-bold">{area} m²</span> ({volume} m³ volume)
                          </div>
                        </div>
                      </div>

                      {/* Booth Type Spec */}
                      <div className="border-b sm:border-b-0 pb-3 sm:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="kicker text-[10px] text-lime font-bold">02. {c.configurator.step6.boothTypeHeader}</span>
                          <button type="button" onClick={() => setStep(2)} className="text-[10px] text-white/40 hover:text-lime underline">
                            {c.configurator.step6.editBtn}
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-white font-bold uppercase">
                          {boothType} booth
                        </div>
                      </div>

                      {/* Style Spec */}
                      <div className="border-b sm:border-b-0 sm:border-e border-white/10 pb-3 sm:pb-0 sm:pe-4 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="kicker text-[10px] text-lime font-bold">03. {c.configurator.step6.styleHeader}</span>
                          <button type="button" onClick={() => setStep(3)} className="text-[10px] text-white/40 hover:text-lime underline">
                            {c.configurator.step6.editBtn}
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-white/70">
                          <div><strong className="text-white">{selectedStyles.join(", ")}</strong></div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            {selectedColors.map((hex) => (
                              <span key={hex} className="h-3 w-3 rounded-full inline-block border border-white/30" style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                          {industry && <div className="mt-1 text-white/50">{industry}</div>}
                        </div>
                      </div>

                      {/* Features Spec */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between">
                          <span className="kicker text-[10px] text-lime font-bold">04. {c.configurator.step6.featuresHeader}</span>
                          <button type="button" onClick={() => setStep(4)} className="text-[10px] text-white/40 hover:text-lime underline">
                            {c.configurator.step6.editBtn}
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedFeatures.length > 0 ? (
                            selectedFeatures.map((fid) => (
                              <span key={fid} className="border border-white/20 bg-white/[0.04] px-2 py-0.5 text-[10px] text-lime font-medium">
                                {fid.replace("_", " ").toUpperCase()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/40">Standard</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client & Budget row */}
                    <div className="mt-5 border-t border-white/10 pt-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10.5px] text-white/40 block">{c.configurator.step6.budgetHeader}</span>
                        <span className="text-xs text-white">
                          {name} {company ? `(${company})` : ""} · {phone}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-[10.5px] text-white/40 block">{c.configurator.step5.budgetLabel}</span>
                        <span className="font-display text-base font-bold text-lime">
                          ${budget.toLocaleString()} {lang === "ar" ? "دولار" : "USD"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Action Footer */}
          {!submitted && (
            <div className="shrink-0 border-t border-white/10 bg-ink/95 px-6 py-4 md:px-8 flex flex-wrap items-center justify-between gap-3">
              {/* Back Button */}
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 text-xs font-semibold text-white/70 hover:border-lime hover:text-lime transition-all"
                >
                  {c.configurator.back}
                </button>
              ) : (
                <div />
              )}

              {/* Validation / API Error Alert in center */}
              {apiError ? (
                <div className="flex items-center gap-1.5 text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-sm">
                  <span>⚠️</span>
                  <span>{apiError}</span>
                </div>
              ) : !isCurrentStepValid ? (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-sm">
                  <span>⚠️</span>
                  <span>{currentStepWarning || c.contact.stepRequiredWarning}</span>
                </div>
              ) : null}

              {/* Bot Honeypot Input */}
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

              {/* Next / Submit Button */}
              {step < 6 ? (
                <button
                  type="button"
                  disabled={!isCurrentStepValid}
                  onClick={() => {
                    if (isCurrentStepValid) {
                      setStep((prev) => Math.min(6, prev + 1));
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-lime px-7 py-2.5 text-xs font-bold text-ink shadow-[0_0_20px_-4px_rgba(223,255,0,0.4)] hover:shadow-[0_0_30px_rgba(223,255,0,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <span>{c.configurator.continue}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !isStep5Valid}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2.5 bg-lime px-8 py-2.5 text-xs font-bold text-ink shadow-[0_0_25px_-5px_rgba(223,255,0,0.5)] hover:shadow-[0_0_35px_rgba(223,255,0,0.7)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <span>{submitting ? c.configurator.step6.submitting : c.configurator.step6.submitBtn}</span>
                  <span className="font-display text-xs">↗</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
  );
}
