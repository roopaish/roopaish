"use client";

import Image from "next/image";
import { ReactNode } from "react";

import { Button } from "@/components/button";
import { socialIconMap } from "@/components/contact-form-modal";
import { Map } from "@/components/ui/map";
import { experiences } from "@/data/experiences";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { useBreakpoints } from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";
import { useContactFormModal } from "@/stores/contact-form-modal";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  DownloadIcon,
  HammerIcon,
  LeafIcon,
  LucideIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  StarsIcon,
} from "lucide-react";
import { motion } from "motion/react";
import SimpleBar from "simplebar-react";
import ProductsLaunched from "./products-launched";

type CompactCardProps = {
  title: string;
  className?: string;
  id?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
  icon?: LucideIcon;
};

function CompactCard({
  title,
  className,
  id,
  headerClassName,
  contentClassName,
  children,
  icon,
}: CompactCardProps) {
  const Icon = icon;

  return (
    <article
      id={id}
      className={cn(
        "rounded-lg border border-black/10 bg-white p-3 relative",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center text-xs gap-1 justify-center rounded-full bg-gray-100 shadow-xs px-3 py-1 font-medium text-black/60",
          headerClassName,
        )}
      >
        {Icon && <Icon className="size-3 text-black/60" />}
        {title}
      </span>
      <div className={cn("mt-4", contentClassName)}>{children}</div>
    </article>
  );
}

export default function CompactInfoGrid() {
  const { isMdUp } = useBreakpoints();
  const open = useContactFormModal((state) => state.open);

  return (
    <div className="bg-[#f6f6f4]">
      <section className="section px-4 pb-30 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 lg:grid-cols-12">
          <CompactCard
            title="Experience"
            className="md:col-span-2 lg:col-span-3"
            icon={BriefcaseIcon}
          >
            <SimpleBar
              style={isMdUp ? { height: 200 } : undefined}
              autoHide={!isMdUp}
              forceVisible={isMdUp}
              className={cn("pr-2", isMdUp && "compact-scrollbar-md")}
            >
              <ul className="space-y-0">
                {experiences.map((item, index) => (
                  <li
                    key={`${item.company}-${item.period}`}
                    className="relative pl-6 pb-4 last:pb-0"
                  >
                    <span
                      className={cn(
                        "absolute left-1.25 w-px bg-black/20",
                        index === 0 ? "top-3.25" : "top-0",
                        index === experiences.length - 1 ? "h-2.5" : "h-full",
                      )}
                    />
                    <span className="absolute top-2 left-0 h-2.5 w-2.5 rounded-full bg-black/90" />
                    <p className="text-sm md:text-md font-medium text-black/85 leading-tight">
                      {item.role}{" "}
                      {item.company ? "at " + item.company : ""}{" "}
                    </p>
                    <p className="text-xs text-black/45 mt-1">{item.period}</p>
                  </li>
                ))}
              </ul>
            </SimpleBar>
          </CompactCard>

          <CompactCard
            title="Portfolio"
            className="md:col-span-3 lg:col-span-6 h-full"
            icon={HammerIcon}
          >
            <ProductsLaunched />
          </CompactCard>

          <CompactCard
            title="Skills"
            className="md:col-span-3 lg:col-span-3"
            icon={StarsIcon}
          >
            <SimpleBar
              style={isMdUp ? { height: 200 } : undefined}
              autoHide={!isMdUp}
              forceVisible={isMdUp}
              className={cn("pr-2 pl-2", isMdUp && "compact-scrollbar-md")}
            >
              <ul className="space-y-0">
                {skills.frameworksAndTools.map((group, index) => (
                  <li
                    key={group.category}
                    className="relative pl-6 pb-4 last:pb-0"
                  >
                    <span
                      className={cn(
                        "absolute left-1.25 w-px bg-black/20",
                        index === 0 ? "top-3.25" : "top-0",
                        index === skills.frameworksAndTools.length - 1
                          ? "h-2.5"
                          : "h-full",
                      )}
                    />
                    <span className="absolute top-2 left-0 h-2.5 w-2.5 rotate-45 bg-black/70" />
                    <p className="text-sm font-medium tracking-wide text-black/65">
                      {group.category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {group.skills.map((skillItem) => (
                        <span
                          key={`${group.category}-${skillItem}`}
                          className="rounded-md bg-black/3 px-2 py-1 text-xs text-black/75"
                        >
                          {skillItem}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </SimpleBar>
          </CompactCard>

          <CompactCard
            title="Map"
            className="md:overflow-hidden not-md:order-6 p-0 md:col-span-2 lg:col-span-3 h-80 md:h-auto"
            contentClassName="mt-0 absolute inset-1"
            icon={MapPinIcon}
            headerClassName="absolute top-3 left-3 z-1"
          >
            <div className="h-full w-full rounded-lg md:overflow-hidden">
              <Map
                theme="light"
                center={[85.324, 27.7172]} // [lng, lat]
                zoom={10}
              />
            </div>
          </CompactCard>

          <CompactCard
            title="I love exploring nature."
            className="md:col-span-2 lg:col-span-4 md:overflow-hidden p-0"
            contentClassName="mt-0 md:absolute inset-1"
            headerClassName="absolute bottom-3 left-3 z-1"
            icon={LeafIcon}
          >
            <Image
              src="/adventure.avif"
              alt="Adventure"
              width={400}
              height={400}
              className="h-full w-full object-cover rounded-lg"
            />
          </CompactCard>

          <CompactCard
            title="Hire Me"
            className="md:col-span-3 lg:col-span-5 min-h-60"
            id="contact"
            icon={MessageCircleIcon}
          >
            <div className="space-y-3">
              <p className="text-base font-medium text-black/80">
                Do you have a project in mind?
                <br />
                <span className="text-sm text-black/40">
                  {profile.availability}
                </span>
              </p>
              <br />
              <Button
                type="button"
                onClick={open}
                className="h-10 gap-2 px-4 text-sm font-medium"
              >
                Let&apos;s Talk!
                <span className="ml-1 inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-white/85" />
                  <span className="size-1.5 rounded-full bg-white/65" />
                  <ArrowUpRightIcon className="size-4" />
                </span>
              </Button>

              <div className="flex gap-2 justify-between flex-wrap">
                <div className="flex items-center gap-1">
                  {[
                    {
                      platform: "Email",
                      url: `mailto:${profile.email}`,
                    },
                    ...profile.socials,
                  ].map((social) => {
                    const Icon =
                      socialIconMap[
                        social.platform as keyof typeof socialIconMap
                      ] ?? MailIcon;

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

                <a href="/resume.pdf" target="_blank" rel="noreferrer">
                  <Button icon={<DownloadIcon size={12} />}>Get Resume</Button>
                </a>
              </div>
            </div>
          </CompactCard>
        </div>
      </section>
    </div>
  );
}
