import { NextResponse, type NextRequest } from "next/server";

type Role = "SUPER_ADMIN" | "ADMIN" | "PENGGUNA";

type TokenPayload = {
  exp?: number;
  role?: Role;
};

const protectedRoutes: { pattern: RegExp; roles: Role[] }[] = [
  { pattern: /^\/users\/create-admin(?:\/)?$/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/users\/create-super-admin(?:\/)?$/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/users(?:\/.*)?$/, roles: ["SUPER_ADMIN", "ADMIN"] },
  { pattern: /^\/organizations(?:\/.*)?$/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/database(?:\/.*)?$/, roles: ["SUPER_ADMIN"] },
  { pattern: /^\/variables(?:\/.*)?$/, roles: ["ADMIN"] },
  { pattern: /^\/categories(?:\/.*)?$/, roles: ["ADMIN"] },
  { pattern: /^\/rules(?:\/.*)?$/, roles: ["ADMIN"] },
  { pattern: /^\/cases(?:\/.*)?$/, roles: ["PENGGUNA"] },
  { pattern: /^\/dashboard(?:\/)?$/, roles: ["SUPER_ADMIN", "ADMIN", "PENGGUNA"] },
];

function decodeJwtPayload(token: string): TokenPayload | null {
  const payload = token.split(".")[1];

  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(normalizedPayload);

    return JSON.parse(decodedPayload) as TokenPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: TokenPayload) {
  if (!payload.exp) return true;

  return payload.exp * 1000 <= Date.now();
}

function getRouteRoles(pathname: string) {
  return protectedRoutes.find((route) => route.pattern.test(pathname))?.roles;
}

function isRscRequest(request: NextRequest) {
  return request.nextUrl.searchParams.has("_rsc");
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";

  const response = NextResponse.redirect(url);
  response.cookies.delete("child_consult_token");

  return response;
}

function redirectToDashboard(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  url.search = "";

  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedRoles = getRouteRoles(pathname);

  if (!allowedRoles) {
    return NextResponse.next();
  }

  const token = request.cookies.get("child_consult_token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  if (!payload || isExpired(payload)) {
    if (isRscRequest(request)) {
      return NextResponse.json(
        { message: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    return redirectToLogin(request);
  }

  if (!payload.role || !allowedRoles.includes(payload.role)) {
    if (isRscRequest(request)) {
      return NextResponse.json(
        { message: "Akses tidak tersedia" },
        { status: 403 }
      );
    }

    return redirectToDashboard(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/users/:path*",
    "/organizations/:path*",
    "/database/:path*",
    "/variables/:path*",
    "/categories/:path*",
    "/rules/:path*",
    "/cases/:path*",
  ],
};
