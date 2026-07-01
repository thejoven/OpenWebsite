import { cn } from "@/lib/utils";

export function OwLogo({
  className,
  markClassName
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span
      aria-label="OpenWebsite"
      className={cn(
        "inline-grid place-items-center rounded-full bg-[var(--admin-green)] text-black shadow-[rgba(0,0,0,0.5)_0px_8px_24px]",
        className
      )}
    >
      <svg
        aria-hidden
        className={cn("h-8 w-8", markClassName)}
        fill="none"
        viewBox="0 0 64 64"
      >
        <circle cx="22" cy="32" r="13" stroke="currentColor" strokeWidth="7" />
        <path
          d="M34 20L40 44L47 26L54 44L60 20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
      </svg>
    </span>
  );
}
