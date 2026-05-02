import { ProductPlatform } from "@/data/projects";
import { cn } from "@/lib/utils";
import { GlobeIcon } from "lucide-react";
import { ReactNode } from "react";

export default function StoreBadge({
  platform,
  comingSoon,
}: {
  platform: ProductPlatform;
  comingSoon?: boolean;
}) {
  const platformContent: Record<
    ProductPlatform,
    { topLabel: string; title: string; icon: ReactNode }
  > = {
    ios: {
      topLabel: comingSoon ? "Coming soon on" : "Download on the",
      title: "App Store",
      icon: (
        <svg
          viewBox="0 0 64 80"
          aria-hidden="true"
          className="size-4 fill-white"
        >
          <path d="M53.4 42.6c-.1-9.1 7.4-13.5 7.8-13.8-4.2-6.2-10.8-7.1-13.1-7.2-5.6-.6-10.8 3.3-13.6 3.3-2.8 0-7.2-3.2-11.9-3.1-6.1.1-11.7 3.6-14.9 9.2-6.4 11.1-1.6 27.5 4.6 36.5 3 4.4 6.6 9.3 11.3 9.1 4.5-.2 6.2-2.9 11.7-2.9 5.5 0 7 2.9 11.8 2.8 4.9-.1 8-4.4 11-8.8 3.5-5 4.9-9.8 5-10-.1-.1-9.6-3.7-9.7-14.9zM44.4 15.5c2.5-3 4.2-7.2 3.7-11.5-3.6.1-8 2.4-10.6 5.4-2.3 2.6-4.4 6.9-3.8 11 4 .3 8.2-2 10.7-4.9z" />
        </svg>
      ),
    },
    android: {
      topLabel: comingSoon ? "Coming soon on" : "Get it on",
      title: "Google Play",
      icon: (
        <svg viewBox="0 0 64 64" aria-hidden="true" className="size-4">
          <polygon fill="#00D95F" points="6,4 36,32 6,60" />
          <polygon fill="#00A7FF" points="6,4 45,26 36,32" />
          <polygon fill="#FF4E45" points="6,60 45,38 36,32" />
          <polygon fill="#FFC107" points="45,26 58,33 45,38 36,32" />
        </svg>
      ),
    },
    web: {
      topLabel: "Visit",
      title: "Website",
      icon: <GlobeIcon className="size-4 text-white" strokeWidth={1.8} />,
    },
  };
  const content = platformContent[platform];

  return (
    <span
      className={cn(
        "inline-flex h-9 px-3 items-center rounded-sm border border-[#a6a6a6] bg-black text-white",
        "transition-all hover:brightness-125",
      )}
    >
      <span className="mr-3 inline-flex w-4 shrink-0 justify-center">
        {content.icon}
      </span>
      <span className="inline-flex flex-col leading-none">
        <span className="text-[8px] tracking-wide">{content.topLabel}</span>
        <span className="text-xs font-medium">{content.title}</span>
      </span>
    </span>
  );
}
