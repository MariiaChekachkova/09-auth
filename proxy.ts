import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "@/lib/api/serverApi";
import { parseSetCookie } from "cookie";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = false;
  const response = NextResponse.next();

  if (accessToken) {
    isAuthenticated = true;
  } else if (refreshToken) {
    try {
      const apiResponse = await checkSession();
      if (apiResponse.data.success) {
        isAuthenticated = true;
        const setCookie = apiResponse.headers["set-cookie"];
        if (setCookie) {
          const cookieArray = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];
          for (const cookieStr of cookieArray) {
            const parsed = parseSetCookie(cookieStr);
            if (parsed.value) {
              response.cookies.set(parsed.name, parsed.value, parsed);
            }
          }
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
