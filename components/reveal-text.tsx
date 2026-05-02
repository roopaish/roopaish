"use client";

import { HTMLMotionProps, motion, Variants } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & {
  text: string;
  delay?: number;
  once?: boolean;
};

export default function RevealText({
  text,
  delay,
  once = false,
  ...props
}: RevealProps) {
  const lines = text.split("\n");
  const revealDelay = delay ?? 0;

  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.02 + revealDelay,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.022,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 24, rotateX: -75 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.span
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: once, amount: 0.35 }}
      aria-label={text}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => (
          <motion.span
            key={line}
            variants={lineVariants}
            className={lines.length > 1 ? "block" : ""}
          >
            {line.split("").map((char, charIndex) => (
              <motion.span
                key={`${lineIndex}-${charIndex}`}
                variants={letterVariants}
                className="inline-block will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
