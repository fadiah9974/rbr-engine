import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("child_consult_token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
