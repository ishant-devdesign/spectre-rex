import { redirect } from "next/navigation";

/**
 * /admin has no dashboard of its own -- projects and signals are the whole
 * panel. Rather than duplicate the list here, it forwards to the projects
 * tab. Kept as a route because middleware, the login form's `next` param and
 * external bookmarks all point at /admin.
 */
export default function AdminPage() {
  redirect("/admin/projects");
}
