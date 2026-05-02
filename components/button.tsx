import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const buttonVariants = cva(
  "inline-flex h-9 md:h-10 items-center justify-center gap-2 rounded-full px-4 md:px-5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        secondary: "bg-[#ececec] text-black/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Button({
  className = "",
  variant = "default",
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      type={type}
      {...props}
    >
      {children}
      {icon && (
        <span
          className={cn(
            "rounded-full p-0.5 size-5 flex items-center justify-center",
            variant === "default" ? "bg-white/20" : "bg-black/20",
          )}
        >
          {icon}
        </span>
      )}
    </button>
  );
}
