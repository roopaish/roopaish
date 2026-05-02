"use client";

import { AnimatePresence, motion } from "motion/react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/button";
import { profile } from "@/data/profile";
import { useContactFormModal } from "@/stores/contact-form-modal";
import {
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  TwitterIcon,
  XIcon,
} from "lucide-react";

export const socialIconMap = {
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
  X: TwitterIcon,
} as const;

export default function ContactFormModal() {
  const isOpen = useContactFormModal((state) => state.isOpen);
  const close = useContactFormModal((state) => state.close);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  function handleClose() {
    setSubmitError(null);
    setSubmitSuccess(null);
    close();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          body: description.trim(),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitError(result.message ?? "Something went wrong!");
        return;
      }

      setSubmitSuccess(
        result.message ?? "Thank you for reaching out. I will contact you soon.",
      );
      setDescription("");
      setEmail("");
    } catch {
      setSubmitError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.04 }}
            animate={{ scale: 180 }}
            exit={{ scale: 0.04 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-0 h-4 w-4 -translate-x-1/2 origin-center rounded-full bg-black md:bottom-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 160, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.995 }}
            transition={{
              duration: 0.36,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col justify-end"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm text-white/70">
                {/*Let&apos;s build it together*/}
                {profile.availability}
              </p>
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="size-9 rounded-full bg-white/12 p-0 text-white"
                aria-label="Close contact modal"
                icon={<XIcon className="size-4" color="white" />}
              />
            </div>

            <div className="rounded-t-3xl bg-white p-4 md:p-6">
              <h3 className="text-xl font-semibold text-black/90">
                Share your work details
              </h3>
              <p className="mt-1 text-sm text-black/55">
                Drop a short description and your email, I&apos;ll get back to
                you.
              </p>

              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <textarea
                  name="description"
                  required
                  minLength={20}
                  maxLength={1000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Description"
                  className="h-32 w-full resize-none rounded-xl bg-black/6 px-3 py-2 text-sm text-black/85 outline-none placeholder:text-black/45"
                />

                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="h-11 w-full rounded-xl bg-black/6 px-3 text-sm text-black/85 outline-none placeholder:text-black/45"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 text-sm font-medium"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
                {submitError ? (
                  <p className="text-sm text-red-600">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="text-sm text-green-700">{submitSuccess}</p>
                ) : null}
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/[0.04] px-3 py-2.5">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 text-sm text-black/75 hover:text-black"
                >
                  <MailIcon className="size-4" />
                  {profile.email}
                </a>

                <div className="flex items-center gap-1">
                  {profile.socials.map((social) => {
                    const Icon =
                      socialIconMap[
                        social.platform as keyof typeof socialIconMap
                      ] ?? GlobeIcon;

                    return (
                      <motion.a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -2, scale: 1.08, rotate: -4 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 16,
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-black bg-black text-white"
                        aria-label={social.platform}
                        title={social.platform}
                      >
                        <Icon className="size-4" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
