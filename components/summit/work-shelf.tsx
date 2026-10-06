"use client";

import { copy, type SummitProject } from "@/data/summit";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpRight, CreditCard, Code2, Github, ShoppingCart, Smartphone, User, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookStack, LEAVE_CARD_S, LEAVE_STAGGER_S, OtherCard, ShelfCard, Vine } from "./shelf-rack";

// The work, standing on a wooden bookcase as dark glass cards with a plaque in
// front of each. The frame rises into place, then the cards drop onto the
// boards one by one; hovering a card pulls it up. Clicking one sends the shelf
// away and the project opens: its screenshots as square cases on a wooden desk,
// beside the description. Going back drops the shelf in again. Closing the
// shelf plays it all backwards: the cards lift away, then the frame sinks.
export function WorkShelf({ projects, open, onClose }: { projects: SummitProject[]; open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [selected, setSelected] = useState<SummitProject | null>(null);
  // The shelf keeps the height it had as a list, whichever project is open.
  const rackRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(0);
  const openProject = (project: SummitProject) => {
    setHeld(rackRef.current?.offsetHeight ?? 0);
    setSelected(project);
  };
  // Closing from the shelf lifts the cards away first, then lets the frame go.
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (open) {
      setSelected(null);
      setHeld(0);
      setLeaving(false);
    }
    return () => clearTimeout(leaveTimer.current);
  }, [open]);

  // Two cards' worth of slots too: the "other projects" card and the book stack.
  const slots = projects.length + 2;
  const dismiss = () => {
    if (leaving) return;
    if (reduce || selected) return onClose();
    setLeaving(true);
    // the frame starts sinking as the last card is leaving
    leaveTimer.current = setTimeout(onClose, ((slots - 1) * LEAVE_STAGGER_S + LEAVE_CARD_S - 0.1) * 1000);
  };
  const leave = { leaving, total: slots };
  // The X steps out of an open project first, and only closes the shelf when
  // it is already showing.
  const goBack = () => {
    if (!selected) return dismiss();
    setSelected(null);
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, selected, leaving]);

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
          onClick={dismiss}
        >
          <motion.div
            className="wood-board relative w-full max-w-6xl"
            style={{ transformPerspective: 1200 }}
            initial={{ y: reduce ? 0 : 90, scale: reduce ? 1 : 0.92, rotateX: reduce ? 0 : 14, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : 90, scale: reduce ? 1 : 0.92, rotateX: reduce ? 0 : 14, opacity: 0, transition: { duration: reduce ? 0 : 0.4, ease: [0.5, 0, 0.9, 0.4] } }}
            transition={spring}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="wood-recess relative min-h-[34rem] overflow-hidden rounded-[14px] text-gray-100">
              <div aria-hidden="true" className="shelf-lights pointer-events-none absolute inset-0" />
              {[30, 72].map((left) => (
                <span key={left} aria-hidden="true" className="pointer-events-none absolute top-0 h-2 w-20 -translate-x-1/2 rounded-b-full bg-[#fff0cf] shadow-[0_0_24px_8px_rgb(255_214_150/0.55)]" style={{ left: `${left}%` }} />
              ))}
              <Vine className="-left-2 top-0 h-52 w-20 sm:h-72 sm:w-28" />
              <Vine className="-right-2 top-0 h-40 w-16 sm:h-52 sm:w-20" flip />
              <div className="relative flex items-start justify-end gap-4 px-5 pt-5 sm:px-12 sm:pt-7">
                <p aria-hidden="true" className="absolute right-24 top-6 hidden -rotate-6 font-hand text-2xl leading-[1.05] text-gray-100/70 md:block">
                  {copy.works.shelfNote[0]}<br />{copy.works.shelfNote[1]}
                </p>
                <button
                  type="button"
                  autoFocus
                  aria-label={selected ? copy.works.shelfBack : copy.works.shelfClose}
                  onClick={goBack}
                  data-cursor={selected ? "back to the shelf" : "close"}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-gray-100 transition-colors hover:bg-black/50"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* the shelf leaves before the case opens, and drops back in after it closes */}
              <div style={{ minHeight: held || undefined }}>
              <AnimatePresence mode="wait">
                {selected ? (
                  <Opened key="opened" project={selected} reduce={!!reduce} height={held} onBack={() => setSelected(null)} />
                ) : (
                  // the shelf scrolls on its own, so the page behind stays put
                  <div key="rack" ref={rackRef} data-lenis-prevent className="relative max-h-[calc(90vh-10rem)] overflow-y-auto overscroll-contain px-3 pb-8 pt-8 sm:px-8 xl:pr-32">
                    <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
                      {projects.map((project, index) => (
                        <ShelfCard key={project.title} project={project} index={index} reduce={!!reduce} leave={leave} onOpen={() => openProject(project)} />
                      ))}
                      <OtherCard index={projects.length} number={String(projects.length + 1).padStart(2, "0")} reduce={!!reduce} leave={leave} />
                    </div>
                    <BookStack reduce={!!reduce} leave={leave} />
                  </div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const featureIcons: Record<NonNullable<SummitProject["features"]>[number]["icon"], LucideIcon> = {
  cart: ShoppingCart,
  payments: CreditCard,
  account: User,
  responsive: Smartphone,
  code: Code2,
};

const container = {
  hidden: {},
  shown: (reduce: boolean) => ({ transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.15 } }),
};
const reveal = { hidden: { opacity: 0, y: 18, filter: "blur(6px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)" } };

// An open project: its pictures as square cases laid out on a wooden desk (click
// one for a closer look), beside the name, the description and the way out to
// the live site, which opens in a new tab.
function Opened({ project, reduce, height, onBack }: { project: SummitProject; reduce: boolean; height: number; onBack: () => void }) {
  const { images, title, tags, blurb, live, code, features, number } = project;
  const [looking, setLooking] = useState<string | null>(null);

  // Esc puts the picture away first, rather than leaving the project.
  useEffect(() => {
    if (!looking) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setLooking(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [looking]);

  return (
    <motion.div
      className="relative flex flex-col px-4 pb-4 pt-2 sm:px-8 sm:pb-6"
      style={{ height: height || undefined }}
      initial={{ y: reduce ? 0 : 60, opacity: 0, scale: reduce ? 1 : 0.94 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: reduce ? 0 : 40, opacity: 0, transition: { duration: reduce ? 0 : 0.25 } }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 24 }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[10px]">
        <div data-lenis-prevent className={`overflow-y-auto overscroll-contain p-1 sm:p-2 ${height ? "h-full" : "max-h-[calc(90vh-14rem)]"}`}>
          <motion.div
            className="grid min-h-full gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-7"
            variants={container}
            custom={reduce}
            initial="hidden"
            animate="shown"
          >
            <motion.div variants={reveal} className="wood-desk flex min-w-0 items-center rounded-[10px] p-4 sm:p-6">
              <div className={`mx-auto grid w-full gap-4 sm:gap-5 ${images.length === 1 ? "max-w-sm grid-cols-1" : images.length >= 5 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
                {images.map((src, index) => (
                  <Case key={src} src={src} title={title} index={index} reduce={reduce} onLook={() => setLooking(src)} />
                ))}
              </div>
            </motion.div>

            <div className="flex min-w-0 flex-col items-start rounded-[10px] border border-white/20 bg-[#1b1a1c]/90 p-5 shadow-[0_14px_22px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.12)] sm:p-6">
              <motion.button variants={reveal} type="button" onClick={onBack} data-cursor="back to the shelf" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-100/70 transition-colors hover:text-gray-100">
                <ArrowLeft className="size-4" /> {copy.works.shelfBack}
              </motion.button>
              <motion.div variants={reveal} className="flex flex-wrap gap-2">
                {[number, ...tags].map((label) => (
                  <span key={label} className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-100/80">{label}</span>
                ))}
              </motion.div>
              <motion.h3 variants={reveal} className="mt-3 font-story text-3xl sm:text-4xl">{title}</motion.h3>
              <motion.p variants={reveal} className="mt-3 max-w-xl text-gray-100/75">{blurb}</motion.p>
              {features && (
                <motion.ul variants={reveal} className="mt-5 flex flex-col gap-3 text-sm text-gray-100/85">
                  {features.map(({ icon, text }) => {
                    const Icon = featureIcons[icon];
                    return (
                      <li key={text} className="flex items-center gap-3">
                        <Icon aria-hidden="true" className="size-5 shrink-0 text-gray-100" />
                        {text}
                      </li>
                    );
                  })}
                </motion.ul>
              )}
              {(live || code) && (
                <motion.div variants={reveal} className="mt-6 flex flex-wrap gap-3">
                  {live && (
                    <a
                      href={live}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="open it ↗"
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-gray-100 px-6 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
                    >
                      {copy.works.shelfOpen} <ArrowUpRight className="size-4" />
                    </a>
                  )}
                  {code && (
                    <a
                      href={code}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="read the code ↗"
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-medium text-gray-100 transition-colors hover:bg-white/10"
                    >
                      <Github className="size-4" /> {copy.works.shelfCode}
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* a picture taken off the desk for a closer look: as wide as the case, the whole of it, scrolling when it is tall */}
        <AnimatePresence>
          {looking && (
            <motion.div
              key="look"
              role="dialog"
              aria-label={`${title}, full picture`}
              className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain p-3 sm:p-4" onClick={(event) => event.target === event.currentTarget && setLooking(null)}>
                <img src={looking} alt={`${title}, full picture`} draggable={false} className="block h-auto w-full rounded-[6px] shadow-[0_18px_40px_rgb(0_0_0/0.6)]" />
              </div>
              <button
                type="button"
                autoFocus
                aria-label="Put the picture back"
                data-cursor="put it back"
                onClick={() => setLooking(null)}
                className="absolute right-5 top-4 grid size-9 place-items-center rounded-full border border-white/30 bg-black/60 text-gray-100 transition-colors hover:bg-black/80"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// One picture as a square CD case: the cover under clear plastic, a hinge down
// the left, a glint across it. It drops onto the desk, and lifts when hovered.
function Case({ src, title, index, reduce, onLook }: { src: string; title: string; index: number; reduce: boolean; onLook: () => void }) {
  const tilt = index % 2 ? 2 : -2;
  return (
    <motion.button
      type="button"
      onClick={onLook}
      aria-label={`Look closer at ${title} picture ${index + 1}`}
      data-cursor="take a closer look"
      className="relative block aspect-square w-full rounded-[5px] border border-white/35 bg-black/75 p-[5%] shadow-[0_10px_16px_rgb(0_0_0/0.45)]"
      initial={{ y: reduce ? 0 : -50, opacity: 0, rotate: reduce ? 0 : -tilt * 2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 16, delay: 0.25 + index * 0.08 }}
      whileHover={reduce ? undefined : { y: -8, rotate: tilt, transition: { type: "spring", stiffness: 320, damping: 18, delay: 0 } }}
    >
      <img src={src} alt="" loading="lazy" draggable={false} className="size-full rounded-[2px] object-cover object-top" />
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[6%] rounded-l-[4px] border-r border-white/20 bg-gradient-to-r from-white/20 to-white/5" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[5px] bg-[linear-gradient(125deg,rgb(255_255_255/0.4),rgb(255_255_255/0)_38%,rgb(255_255_255/0)_62%,rgb(255_255_255/0.14))]" />
    </motion.button>
  );
}
