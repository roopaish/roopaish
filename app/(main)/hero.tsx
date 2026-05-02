"use client";

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

import RevealText from "@/components/reveal-text";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

type HeroStep = "request" | "email" | "done";
const MIN_BODY_LENGTH = 20;

export default function Hero() {
  const [step, setStep] = useState<HeroStep>("request");
  const [request, setRequest] = useState("");
  const [email, setEmail] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRequestStep = step === "request";
  const isEmailStep = step === "email";
  const isRequestExpanded = isRequestStep && isExpanded;
  const trimmedRequest = request.trim();
  const isRequestValid = trimmedRequest.length >= MIN_BODY_LENGTH;
  const canSubmit = isRequestStep
    ? true
    : isEmailStep
      ? !!email.trim() && !isSubmitting
      : false;
  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: 320,
        damping: 30,
        mass: 0.72,
      };
  const bubbleTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };
  const fadeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.25, 1, 0.5, 1] as const };

  useEffect(() => {
    if (!isRequestStep || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const collapsedHeight = 44;

    textarea.style.height = "0px";
    const expandedHeight = Math.max(96, textarea.scrollHeight);
    textarea.style.height = `${isExpanded ? expandedHeight : collapsedHeight}px`;
  }, [isExpanded, isRequestStep, request]);

  useEffect(() => {
    if (!isRequestExpanded || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const length = textarea.value.length;
    textarea.focus();
    textarea.setSelectionRange(length, length);
  }, [isRequestExpanded]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (isRequestStep) {
      if (!isRequestValid) {
        setSubmitError(
          `Please share at least ${MIN_BODY_LENGTH} characters about your project.`,
        );
        return;
      }

      setStep("email");
      setIsExpanded(false);
      return;
    }

    if (isEmailStep) {
      if (!email.trim()) return;

      try {
        setIsSubmitting(true);
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            body: request.trim(),
          }),
        });
        const result = (await response.json()) as { message?: string };

        if (!response.ok) {
          setSubmitError(result.message ?? "Something went wrong!");
          return;
        }

        setStep("done");
      } catch {
        setSubmitError("Something went wrong!");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="bg-[#f6f6f4]">
      <section className="section px-4 md:px-8 pt-30 pb-20">
        <div>
          <div className="mb-7 h-24 w-24 overflow-hidden rounded-2xl bg-orange-600 md:h-28 md:w-28">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={112}
              height={112}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>

          <h1 className="mx-auto text-3xl md:text-5xl leading-tight font-semibold tracking-[-0.04em] text-black/90 font-manrope">
            <RevealText
              once
              text={`Hi I'm ${profile.name} — ${profile.role}.`}
            />
            <br />
            <span className="text-black/40">
              I build digital products, brands and experiences.
            </span>
          </h1>

          <p className="mt-4 max-w-[60ch] text-base md:text-2xl font-medium tracking-tight leading-normal text-black/50">
            {profile.summary}
          </p>

          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end">
            <form
              onSubmit={handleSubmit}
              className="flex md:flex-row flex-col w-full items-end gap-3"
            >
              <motion.div
                layout
                transition={layoutTransition}
                className="w-full md:max-w-100 rounded-4xl border border-[#e4e4e1] bg-white p-2 pl-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {isRequestStep ? (
                    <motion.div
                      key="request-field"
                      layout
                      transition={layoutTransition}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    >
                      <motion.textarea
                        ref={textareaRef}
                        layout
                        rows={1}
                        initial={false}
                        transition={layoutTransition}
                        value={request}
                        onFocus={() => setIsExpanded(true)}
                        onChange={(event) => {
                          setRequest(event.target.value);
                          if (submitError) {
                            setSubmitError(null);
                          }
                        }}
                        minLength={MIN_BODY_LENGTH}
                        placeholder="Do you have a project in mind? let me know"
                        className={cn(
                          "w-full resize-none bg-transparent pr-2 text-base text-[#262624] outline-none placeholder:text-[#a6a6a3]",
                          isRequestExpanded
                            ? "min-h-24 py-2 leading-6"
                            : "h-11 overflow-hidden py-0 leading-[44px]",
                        )}
                      />
                    </motion.div>
                  ) : (
                    <motion.input
                      key="email-input"
                      layout
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={fadeTransition}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      className="h-11 w-full bg-transparent text-base text-[#262624] outline-none placeholder:text-[#a6a6a3]"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence initial={false} mode="popLayout">
                {step !== "done" ? (
                  <motion.div
                    key="actions"
                    layout
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                    transition={bubbleTransition}
                    className="flex shrink-0 items-center gap-2 self-end"
                  >
                    <AnimatePresence initial={false}>
                      {(isExpanded || isEmailStep) && (
                        <motion.button
                          key={isEmailStep ? "back-button" : "close-button"}
                          layout
                          type="button"
                          initial={{
                            opacity: 0,
                            scale: shouldReduceMotion ? 1 : 0.72,
                            y: shouldReduceMotion ? 0 : 10,
                          }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            scale: shouldReduceMotion ? 1 : 0.82,
                            y: shouldReduceMotion ? 0 : 6,
                          }}
                          transition={bubbleTransition}
                          onClick={() => {
                            if (isEmailStep) {
                              setStep("request");
                              setIsExpanded(true);
                              return;
                            }

                            if (isExpanded) {
                              setIsExpanded(false);
                            }
                          }}
                          className="inline-flex h-14 items-center justify-center rounded-full border border-[#dcdcd8] bg-white px-5 text-sm font-medium text-[#4f4f4d] transition hover:border-[#cececa] hover:text-[#242423] cursor-pointer"
                        >
                          {isEmailStep ? (
                            <ArrowLeftIcon size={16} />
                          ) : (
                            <XIcon size={16} />
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <motion.button
                      layout
                      transition={layoutTransition}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        "inline-flex h-14 shrink-0 self-end items-center justify-center gap-2 rounded-full border border-[#dcdcd8] px-5 text-sm font-medium text-[#4f4f4d] transition hover:border-[#cececa] hover:text-[#242423]",
                        isExpanded || isEmailStep
                          ? "bg-black cursor-pointer text-white hover:text-white"
                          : "bg-transparent",
                        !canSubmit && "cursor-not-allowed opacity-70",
                      )}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        {isRequestStep && !isExpanded ? (
                          <motion.span
                            key="availability"
                            layout
                            initial={{
                              opacity: 0,
                              scale: shouldReduceMotion ? 1 : 0.92,
                              y: shouldReduceMotion ? 0 : 6,
                            }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              scale: shouldReduceMotion ? 1 : 0.96,
                              y: shouldReduceMotion ? 0 : -4,
                            }}
                            transition={bubbleTransition}
                            className="inline-flex items-center gap-2"
                          >
                            <span className="relative flex size-3 items-center justify-center">
                              <motion.span
                                className="absolute inset-0 size-3 rounded-full bg-[#8de58e]/70"
                                animate={
                                  shouldReduceMotion
                                    ? { opacity: 0.55, scale: 1 }
                                    : {
                                        scale: [1, 1.9, 1],
                                        opacity: [0.55, 0, 0.55],
                                      }
                                }
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0 }
                                    : {
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeOut",
                                      }
                                }
                              />
                              <span className="size-2 rounded-full bg-[#79d779]" />
                            </span>
                            <span>Available for Work</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key={isEmailStep ? "submit-label" : "next-label"}
                            layout
                            initial={{
                              opacity: 0,
                              scale: shouldReduceMotion ? 1 : 0.92,
                              y: shouldReduceMotion ? 0 : 8,
                            }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              scale: shouldReduceMotion ? 1 : 0.96,
                              y: shouldReduceMotion ? 0 : -6,
                            }}
                            transition={bubbleTransition}
                            className="inline-flex items-center gap-2"
                          >
                            {isEmailStep ? (
                              isSubmitting ? (
                                "Submitting..."
                              ) : (
                                "Submit"
                              )
                            ) : (
                              <>
                                Next <ArrowRightIcon size={16} />
                              </>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="done-message"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    transition={fadeTransition}
                    className="px-2 text-sm text-[#4f4f4d]"
                  >
                    {"Thanks, I will reach out soon."}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
            {submitError ? (
              <p className="mt-2 px-2 text-sm text-red-600">{submitError}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
