import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
}
