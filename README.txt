PATCH - Remove classified + Fix auth + Cookie consent
=====================================================

1. DELETE old classified file if exists:
   src/app/sitemap.ts (old metadata route)

   PowerShell:
   Remove-Item -Path "src\app\sitemap.ts" -Force -ErrorAction SilentlyContinue

2. Drag contents of this patch onto repo root and Replace.

Files:
- src/app/sitemap.xml/route.ts (static 6 routes, no DB classified filter, text/xml)
- src/components/ui/CookieConsent.tsx (NEW - banner with Necessary always on, Analytics toggle, no 0-cookie)
- src/components/seo/GoogleAnalytics.tsx (consent mode v2, respects cookie consent)
- src/app/(site)/layout.tsx (includes CookieConsent)
- src/components/layout/Footer.tsx (adds Cookie settings button)
- src/lib/supabase/config.ts (siteOrigin always apex https://spectrerex.com - fixes magic link redirect to home)
- src/middleware.ts (session persistence - cookies with SameSite Lax, refresh on every request)
- supabase/schema.sql (removed classified, redaction_blocks, date_redacted)
- supabase/seed.sql (removed classified entries, only 4 projects + 2 signals)
- src/db/schema.ts (removed classified column)
- src/lib/entries.ts, blocks.ts, redact.ts (stripped classified)
- src/app/(site)/projects/page.tsx, page.tsx, signals/page.tsx (no classified)
- admin files: actions.ts, EntryEditor.tsx, EntryListPage.tsx, preview, email, EntryArticle, BlockRenderer, EntryRow, entryEmail

3. Commit & push:
   git add -A
   git commit -m "strip classified, fix admin redirect & session, add cookie consent with analytics toggle"
   git push

4. Supabase SQL - run in SQL Editor (see SUPABASE_SQL.txt)

5. Vercel env: NEXT_PUBLIC_GA_ID=G-DELZZBKLTV (already set)

6. Supabase Dashboard: Auth -> URL Configuration -> Site URL must be https://spectrerex.com (you said you updated, good)
   SMTP already set to Resend - good.

