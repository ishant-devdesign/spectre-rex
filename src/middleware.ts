import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isAdminEmail,
  supabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Guards /admin and keeps the auth cookie fresh.
 *
 * Two separate checks: a session must exist, and its email must be on the
 * allowlist. A valid Supabase user is not an admin — anyone who can
 * receive a magic link would otherwise be one.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  /* Fail closed. Without Supabase there is no way to authenticate, so
     everything except the login screen (which explains the setup) is
     refused — an unconfigured deploy must not expose the panel. */
  if (!supabaseConfigured()) {
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorised = Boolean(user) && isAdminEmail(user?.email);
  const isLogin = pathname.startsWith("/admin/login");

  if (pathname.startsWith("/admin") && !isLogin && !authorised) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    if (user && !authorised) url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  if (isLogin && authorised) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
