import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, siteOrigin } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/** Magic-link landing point: swap the code for a session, then gate it. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = siteOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=expired`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* A link can be valid and still not belong to an admin. */
  if (!isAdminEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?denied=1`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/admin"}`);
}
