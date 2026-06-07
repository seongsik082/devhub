import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/constants";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(sessionCookieName);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/posts/new",
    "/posts/:postId",
    "/account/:path*",
    "/todos/:path*",
    "/todos",
    "/cart/:path*",
    "/cart",
    "/orders/:path*",
    "/orders",
    "/admin/:path*",
    "/admin",
  ],
};
