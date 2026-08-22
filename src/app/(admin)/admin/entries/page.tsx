import { redirect } from "next/navigation";

/** Superseded by the per-kind tabs; kept so older links still resolve. */
export default function EntriesIndexPage() {
  redirect("/admin/projects");
}
