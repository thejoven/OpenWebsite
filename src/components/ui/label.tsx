import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("grid gap-1.5", className)}
      data-slot="label"
      {...props}
    />
  );
}

function LabelText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("admin-label mb-0", className)} {...props} />;
}

export { Label, LabelText };
