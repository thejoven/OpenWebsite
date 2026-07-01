import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none",
  {
    variants: {
      variant: {
        default: "bg-[#1f1f1f] text-[var(--admin-muted)]",
        success: "bg-[rgba(30,215,96,0.13)] text-[var(--admin-green)]",
        warning: "bg-[rgba(255,164,43,0.13)] text-[var(--admin-warning)]",
        destructive: "bg-[rgba(243,114,127,0.13)] text-[var(--admin-danger)]",
        info: "bg-[rgba(83,157,245,0.13)] text-[var(--admin-info)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ className, variant }))} {...props} />
  );
}

export { Badge, badgeVariants };
