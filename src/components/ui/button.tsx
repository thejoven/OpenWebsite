import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-bold leading-none transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--admin-green)] text-black shadow-[rgba(0,0,0,0.5)_0px_8px_24px] hover:bg-[#3be477]",
        secondary:
          "bg-[#1f1f1f] text-white shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset] hover:bg-[#252525]",
        destructive:
          "bg-transparent text-[var(--admin-danger)] shadow-[rgba(243,114,127,0.42)_0px_0px_0px_1px_inset] hover:bg-[rgba(243,114,127,0.1)]",
        ghost:
          "bg-transparent text-[var(--admin-muted)] hover:bg-[#1f1f1f] hover:text-white",
        link: "h-auto min-h-0 rounded-none p-0 text-[var(--admin-green)] underline-offset-4 hover:underline"
      },
      size: {
        default: "px-4 py-3",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-5 py-3",
        icon: "size-9 p-0"
      },
      label: {
        true: "tracking-[0.09em] uppercase",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      label: true
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  asChild = false,
  className,
  label,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, label, size, variant }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
