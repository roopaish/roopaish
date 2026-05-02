"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";

import { Button } from "@/components/button";
import SimpleBar from "simplebar-react";

type ProductGalleryProps = {
  name: string;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  grid?: number;
};

export default function ProductGallery({
  name,
  images,
  isOpen,
  onClose,
  grid = 1,
}: ProductGalleryProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key={`${name}-gallery`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-9999 p-4 md:p-8"
        >
          <button
            type="button"
            aria-label="Close gallery overlay"
            onClick={onClose}
            className="absolute inset-0 z-0"
          >
            <span className="sr-only">Close</span>
          </button>

          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.04 }}
            animate={{ scale: shouldReduceMotion ? 1 : 180 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.04 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-0 h-4 w-4 -translate-x-1/2 origin-center rounded-full bg-black md:bottom-8"
          />

          <motion.div
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: 160, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 120, scale: 0.995 }
            }
            transition={{
              duration: 0.36,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col justify-end"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm text-white/70">{name}</p>
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="size-9 rounded-full bg-white/12 p-0 text-white"
                aria-label="Close gallery"
                icon={<XIcon className="size-4" color="white" />}
              />
            </div>

            <div className="rounded-t-3xl bg-white p-3 md:p-4">
              <SimpleBar className="max-h-[70vh] pr-2">
                <div
                  className="rounded-xl gap-3 grid"
                  style={{
                    gridTemplateColumns: `repeat(${grid},1fr)`,
                  }}
                >
                  {images.map((src, index) => (
                    <div key={`${name}-${src}`}>
                      <p className="ml-4 rounded-t-lg py-1 bg-black text-white w-20 text-center text-sm font-medium">
                        {index + 1} of {images.length}
                      </p>
                      <Image
                        src={src}
                        alt={`${name} gallery ${index + 1}`}
                        width={1600}
                        height={1000}
                        className="overflow-hidden rounded-xl border border-black/10 bg-white object-contain"
                      />
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
