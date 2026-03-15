import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-white/30 text-foreground border border-white/50 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)] hover:bg-white/45 hover:border-white/60 dark:bg-white/10 dark:border-white/20 dark:text-white",
        destructive:
          "bg-white/20 text-destructive-foreground border border-white/40 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)] hover:bg-white/30 hover:border-white/50 dark:bg-white/10 dark:text-white",
        outline:
          "border border-white/50 bg-white/15 text-foreground backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)] hover:bg-white/25 hover:border-white/60 dark:bg-white/5 dark:text-white",
        secondary:
          "bg-white/20 text-foreground border border-white/40 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)] hover:bg-white/30 hover:border-white/50 dark:bg-white/10 dark:text-white",
        ghost:
          "bg-white/10 text-foreground border border-transparent backdrop-blur-xl hover:bg-white/20 hover:border-white/30 dark:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
