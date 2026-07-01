import Link from "next/link";
import { defaultLocale } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="container grid min-h-screen place-items-center py-20 text-center">
      <div>
        <p className="text-sm font-bold uppercase text-[#0e4fa0]">404</p>
        <h1 className="mt-3 text-4xl font-black">Page not found</h1>
        <Link className="mt-8 inline-flex rounded-md bg-[#0e4fa0] px-5 py-3 font-bold text-white" href={`/${defaultLocale}`}>
          Go home
        </Link>
      </div>
    </main>
  );
}
