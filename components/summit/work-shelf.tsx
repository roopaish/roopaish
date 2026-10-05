"use client";

import { copy, type SummitProject } from "@/data/summit";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PrintDesk } from "./print-desk";

// The work, standing on a wooden shelf like CDs in their cases. The frame rises
// into place, then the cases drop into their slots one by one; hovering a case
// pulls it up out of the rack. Clicking one sends the shelf away and the case
// opens like a jewel case, its lid swinging open on the hinge to show what is
// inside; going back closes the lid and the shelf drops back in.
export function WorkShelf({ projects, open, onClose }: { projects: SummitProject[]; open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [selected, setSelected] = useState<SummitProject | null>(null);
  // Going back plays the lid closing first, and only then returns to the shelf.
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setSelected(null);
      setClosing(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) setClosing(true);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, selected]);

  if (!mounted) return null;

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 190, damping: 22, mass: 0.9 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="shelf"
          role="dialog"
          aria-modal="true"
          aria-label={copy.works.shelfTitle}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="wood-board relative w-full max-w-5xl"
            style={{ transformPerspective: 1200 }}
            initial={{ y: reduce ? 0 : 90, scale: reduce ? 1 : 0.92, rotateX: reduce ? 0 : 14, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : 50, scale: reduce ? 1 : 0.96, opacity: 0 }}
            transition={spring}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wood-recess relative min-h-[34rem] rounded-[14px] text-gray-100">
              <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
                <div>
                  <h3 className="font-story text-2xl sm:text-3xl">{copy.works.shelfTitle}</h3>
                  <p className="mt-1 text-sm text-gray-100/65">{selected ? selected.title : copy.works.shelfHint}</p>
                </div>
                <button
                  type="button"
                  autoFocus
                  aria-label={copy.works.shelfClose}
                  onClick={onClose}
                  data-cursor="close"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-gray-100 transition-colors hover:bg-black/50"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* the shelf leaves before the case opens, and drops back in after it closes */}
              <AnimatePresence mode="wait">
                {selected ? (
                  <Opened
                    key="opened"
                    project={selected}
                    reduce={!!reduce}
                    closing={closing}
                    onBack={() => setClosing(true)}
                    onClosed={() => {
                      setSelected(null);
                      setClosing(false);
                    }}
                  />
                ) : (
                  // the shelf scrolls on its own, so the page behind stays put
                  <div key="rack" data-lenis-prevent className="max-h-[calc(90vh-10rem)] overflow-y-auto overscroll-contain px-5 pb-8 pt-10 sm:px-8">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                      {projects.map((project, index) => (
                        <Disc key={project.title} project={project} index={index} reduce={!!reduce} onOpen={() => setSelected(project)} />
                      ))}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// One CD in a jewel case: the cover under clear plastic, a hinge down the
// left, a plank under it, and the name below.
function Disc({ project, index, reduce, onOpen }: { project: SummitProject; index: number; reduce: boolean; onOpen: () => void }) {
  return (
    <div>
      <div className="relative">
        <motion.button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${project.title}`}
          data-cursor="open it up"
          className="relative block aspect-square w-full rounded-[5px] border border-white/35 bg-black/75 p-[5%] shadow-[0_10px_16px_rgb(0_0_0/0.45)]"
          initial={{ y: reduce ? 0 : -160, opacity: 0, rotate: reduce ? 0 : index % 2 ? 7 : -7 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={reduce ? undefined : { y: 170, opacity: 0, rotate: index % 2 ? -5 : 5, transition: { duration: 0.34, ease: [0.5, 0, 0.9, 0.4], delay: index * 0.025 } }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 15, delay: 0.2 + index * 0.09 }}
          whileHover={reduce ? undefined : { y: -22, rotate: index % 2 ? 2 : -2, transition: { type: "spring", stiffness: 320, damping: 18, delay: 0 } }}
        >
          <img src={project.image} alt={`${project.title} cover`} draggable={false} className="size-full rounded-[2px] object-cover object-top" />
          {/* the hinge */}
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[6%] rounded-l-[4px] border-r border-white/20 bg-gradient-to-r from-white/20 to-white/5" />
          {/* a glint across the plastic */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[5px] bg-[linear-gradient(125deg,rgb(255_255_255/0.4),rgb(255_255_255/0)_38%,rgb(255_255_255/0)_62%,rgb(255_255_255/0.14))]" />
        </motion.button>
        <motion.span
          aria-hidden="true"
          className="wood-plank pointer-events-none absolute -inset-x-3 -bottom-2 h-3"
          exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
        />
      </div>
      <motion.p className="mt-6 truncate text-center text-sm text-gray-100/85" exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.2 } }}>
        <span className="mr-2 text-gray-100/45">{project.number}</span>
        {project.title}
      </motion.p>
    </div>
  );
}

const LID_OPEN_S = 0.95;

const container = {
  hidden: { transition: { staggerChildren: 0 } },
  shown: (reduce: boolean) => ({ transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.5 } }),
};
const reveal = { hidden: { opacity: 0, y: 18, filter: "blur(6px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)" } };

// An open jewel case: the lid (the cover) swings up on its left hinge, and
// inside are the pictures (laid out loose on a desk, free to move around), the name, the
// description and the way out to the live site, which opens in a new tab.
// `closing` swings the lid shut again, then calls `onClosed`.
function Opened({ project, reduce, closing, onBack, onClosed }: { project: SummitProject; reduce: boolean; closing: boolean; onBack: () => void; onClosed: () => void }) {
  const { images, title, tags, blurb, live, number, image } = project;
  return (
    <motion.div
      className="relative px-4 pb-4 pt-6 sm:px-8 sm:pb-8"
      initial={{ y: reduce ? 0 : 60, opacity: 0, scale: reduce ? 1 : 0.94 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: reduce ? 0 : 40, opacity: 0, transition: { duration: reduce ? 0 : 0.25 } }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 24 }}
    >
      {/* the case: a clear tray holding the inside, with the lid on top */}
      <div className="relative rounded-[8px] border border-white/35 bg-black/55 shadow-[0_18px_30px_rgb(0_0_0/0.5)]">
        <div data-lenis-prevent className="max-h-[calc(90vh-14rem)] overflow-y-auto overscroll-contain p-4 sm:p-7">
          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10"
            variants={container}
            custom={reduce}
            initial="hidden"
            animate={closing ? "hidden" : "shown"}
          >
            <motion.div variants={reveal} className="min-w-0 rounded-[10px] border border-white/15 bg-black/35">
              <PrintDesk title={title} images={images} />
            </motion.div>

            <div className="flex min-w-0 flex-col items-start">
              <motion.button variants={reveal} type="button" onClick={onBack} disabled={closing} data-cursor="back to the shelf" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-100/70 transition-colors hover:text-gray-100">
                <ArrowLeft className="size-4" /> {copy.works.shelfBack}
              </motion.button>
              <motion.div variants={reveal} className="flex flex-wrap gap-2">
                {[number, ...tags].map((label) => (
                  <span key={label} className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-100/80">{label}</span>
                ))}
              </motion.div>
              <motion.h3 variants={reveal} className="mt-4 font-story text-3xl sm:text-4xl">{title}</motion.h3>
              <motion.p variants={reveal} className="mt-4 max-w-xl text-gray-100/75">{blurb}</motion.p>
              {live && (
                <motion.a
                  variants={reveal}
                  href={live}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="open it ↗"
                  className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gray-100 px-6 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
                >
                  {copy.works.shelfOpen} <ArrowUpRight className="size-4" />
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>

        {/* the lid: the cover, hinged on the left. It swings up and away to open, and comes back down to close. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[8px] border border-white/35 bg-black/80 p-[2.5%] shadow-[0_10px_24px_rgb(0_0_0/0.5)] [backface-visibility:hidden]"
          style={{ transformOrigin: "left center", transformPerspective: 1800 }}
          initial={{ rotateY: 0, opacity: 1 }}
          animate={closing ? { rotateY: 0, opacity: 1 } : { rotateY: -100, opacity: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : closing
                ? { rotateY: { duration: 0.7, ease: [0.45, 0, 0.2, 1], delay: 0.15 }, opacity: { duration: 0 } }
                : { rotateY: { duration: LID_OPEN_S, ease: [0.5, 0, 0.2, 1], delay: 0.2 }, opacity: { duration: 0.01, delay: 0.2 + LID_OPEN_S * 0.8 } }
          }
          onAnimationComplete={() => closing && onClosed()}
        >
          <img src={image} alt="" draggable={false} className="size-full rounded-[4px] object-cover object-top" />
          <span className="absolute inset-y-0 left-0 w-[3%] border-r border-white/20 bg-gradient-to-r from-white/25 to-white/5" />
          <span className="absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.4),rgb(255_255_255/0)_38%,rgb(255_255_255/0)_62%,rgb(255_255_255/0.14))]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
