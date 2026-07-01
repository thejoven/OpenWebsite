import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "rounded-[8px] bg-[#181818] px-4 py-3 text-sm font-bold shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]",
  {
    variants: {
      variant: {
        default: "text-[var(--admin-muted-strong)]",
        destructive:
          "text-[var(--admin-danger)] shadow-[rgba(243,114,127,0.42)_0px_0px_0px_1px_inset]",
        success:
          "text-[var(--admin-green)] shadow-[rgba(30,215,96,0.42)_0px_0px_0px_1px_inset]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ className, variant }))}
      role="alert"
      {...props}
    />
  );
}

export { Alert };
