import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes } from "react";

const siteButton = cva(
  "inline-flex h-12 items-center justify-center border px-7 text-sm font-medium transition-[background-color,color,transform] duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "border-foreground bg-foreground text-background hover:-translate-y-0.5 hover:bg-foreground/85",
        paper:
          "border-foreground bg-background text-foreground hover:-translate-y-0.5 hover:bg-muted",
        filter:
          "h-9 rounded-full border-border bg-transparent px-4 text-muted-foreground hover:border-foreground hover:text-foreground data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background",
      },
      size: {
        default: "",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "ink", size: "default" },
  },
);

type SiteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof siteButton> & { asChild?: boolean };

export function SiteButton({
  className,
  variant,
  size,
  asChild,
  type,
  ...props
}: SiteButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(siteButton({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}
