import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  previousLabel,
  nextLabel,
  getHref
}: {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  getHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-10 flex items-center justify-between gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link
          className="focus-ring rounded-md border border-[#cfdae8] bg-white px-4 py-2 text-sm font-bold"
          href={getHref(page - 1)}
        >
          {previousLabel}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm font-bold text-[#5a6a7f]">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          className="focus-ring rounded-md border border-[#cfdae8] bg-white px-4 py-2 text-sm font-bold"
          href={getHref(page + 1)}
        >
          {nextLabel}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
