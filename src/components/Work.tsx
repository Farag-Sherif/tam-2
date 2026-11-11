import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "../i18n/LangContext";
import { SectionHead } from "./ui/SectionHead";
import type { ProjectItem } from "../api/types";

/**
 * 06 SELECTED WORK — exhibition stands, displays & workshop highlights from CMS API.
 */
export function Work() {
  const { c, dir, siteData, apiStatus } = useLang();
  const work = siteData?.work;
  const projects = work?.projects ?? [];

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const categories = Array.from(
    new Set(projects.map((p) => (p.kicker || "").trim()).filter(Boolean))
  );

  const tabs: { id: string; label: string }[] = [
    { id: "all", label: c.workUi.allTab },
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  const effectiveTab =
    activeTab === "all" || categories.includes(activeTab) ? activeTab : "all";

  const filteredItems =
    effectiveTab === "all"
      ? projects
      : projects.filter((item) => (item.kicker || "").trim() === effectiveTab);

  const openProject = (w: ProjectItem, opener: HTMLButtonElement | null) => {
    openerRef.current = opener;
    setSelectedProject(w);
  };

  const closeProject = () => {
    setSelectedProject(null);
    // Return focus to the button that opened the dialog
    window.setTimeout(() => openerRef.current?.focus(), 0);
  };

  // Escape to close + focus trap while the dialog is open
  useEffect(() => {
    if (!selectedProject) return;

    // Focus the close button on open
    window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    const dialogEl = dialogRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeProject();
        return;
      }
      if (e.key === "Tab" && dialogEl) {
        const focusables = dialogEl.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  if (apiStatus !== "loading" && !work) return null;

  return (
    <section id="work" className="relative border-t border-white/10 bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        {!work ? (
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-56 bg-white/10 rounded" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-72 border border-white/10 bg-white/[0.02]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHead
                index="06"
                kicker={work.kicker ?? ""}
                title={work.title ?? ""}
                lead={work.subtitle ?? ""}
              />

              {tabs.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 border border-white/10 bg-white/[0.02] p-1.5" dir={dir}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-pressed={effectiveTab === tab.id}
                      className={`relative px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                        effectiveTab === tab.id
                          ? "bg-lime text-ink font-bold"
                          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" dir={dir}>
              <AnimatePresence mode="popLayout">
                {filteredItems.map((w, idx) => (
                  <motion.article
                    layout
                    key={w.slug || `${w.title}-${idx}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, delay: (idx % 6) * 0.04 }}
                    className="group relative overflow-hidden border border-white/12 bg-white/[0.02] transition-all duration-500 hover:border-lime/50 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-indigo/20">
                      {w.image_url && (
                        <img
                          src={w.image_url}
                          alt={w.title}
                          loading={idx < 4 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                      {w.kicker && (
                        <div className="absolute top-3.5 start-3.5">
                          <span className="border border-white/20 bg-ink/80 px-2.5 py-0.5 text-[10.5px] font-medium text-white/90 backdrop-blur-md">
                            {w.kicker}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="h-sub text-[16px] md:text-[18px] text-white group-hover:text-lime transition-colors">
                          {w.title}
                        </h3>
                        {w.category && (
                          <p className="mt-2 text-[12.5px] leading-relaxed text-white/60 line-clamp-2">
                            {w.category}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
                        {/* Real keyboard-accessible button (not a div/card handler) */}
                        <button
                          type="button"
                          onClick={(e) => openProject(w, e.currentTarget)}
                          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-lime/80 transition-colors hover:text-lime"
                        >
                          <span>{c.workUi.viewDetails}</span>
                          <span aria-hidden="true" className="font-display text-[10px]">
                            {dir === "rtl" ? "←" : "→"}
                          </span>
                        </button>
                        <span className="text-[10px] text-white/30 font-display">TAM</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              {(work.next_title || work.next_cta) && (
                <a
                  href="#contact"
                  className="group flex flex-col justify-center items-center border border-lime/40 bg-lime/[0.04] p-8 text-center transition-all duration-300 hover:border-lime hover:bg-lime/[0.08] hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-lime/50 text-lime mb-4">
                    <span className="text-xl">↗</span>
                  </div>
                  {work.next_label && (
                    <div className="font-display text-[10.5px] tracking-[0.24em] text-lime font-bold">
                      {work.next_label}
                    </div>
                  )}
                  {work.next_title && (
                    <div className="h-title mt-2 text-[20px] md:text-[22px] text-white">{work.next_title}</div>
                  )}
                  {work.next_body && (
                    <p className="mt-2 text-xs text-white/60 max-w-[26ch]">{work.next_body}</p>
                  )}
                  {work.next_cta && (
                    <div className="mt-5 inline-flex items-center gap-2 bg-lime px-5 py-2.5 text-[12.5px] font-bold text-ink">
                      <span>{work.next_cta}</span>
                      <span aria-hidden="true">↗</span>
                    </div>
                  )}
                </a>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Project Details Dialog — accessible: role, aria, trap, Escape, focus return, safe z-index */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={closeProject}
          >
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-dialog-title"
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/20 bg-ink p-6 md:p-8 shadow-2xl"
              dir={dir}
            >
              {/* Close button above all content (z-20, image can never cover it) */}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeProject}
                className="absolute top-4 end-4 z-20 flex h-9 w-9 items-center justify-center border border-white/25 bg-ink/90 text-white/80 hover:border-lime hover:text-lime transition-colors"
                aria-label={c.workUi.close}
              >
                <span aria-hidden="true">✕</span>
              </button>

              {selectedProject.image_url && (
                <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-black">
                  <img
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="mt-6">
                {selectedProject.kicker && (
                  <div className="flex items-center gap-2">
                    <span className="border border-lime/40 bg-lime/10 px-2.5 py-0.5 text-xs text-lime font-medium">
                      {selectedProject.kicker}
                    </span>
                  </div>
                )}
                <h3 id="project-dialog-title" className="h-title mt-3 text-[22px] md:text-[26px] text-white">
                  {selectedProject.title}
                </h3>
                {selectedProject.category && (
                  <p className="mt-2 text-sm text-lime font-medium">{selectedProject.category}</p>
                )}
                {selectedProject.description && (
                  <p className="body-copy mt-4 text-[14.5px] leading-relaxed text-white/75 border-t border-white/10 pt-4">
                    {selectedProject.description}
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="text-xs text-white/40">{c.workUi.contactSimilar}</div>
                <a
                  href="#contact"
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center gap-2 bg-lime px-5 py-2.5 text-xs font-bold text-ink hover:bg-lime/90 transition-colors"
                >
                  <span>{siteData?.hero?.cta_primary || c.nav.cta}</span>
                  <span aria-hidden="true">{dir === "rtl" ? "←" : "→"}</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
