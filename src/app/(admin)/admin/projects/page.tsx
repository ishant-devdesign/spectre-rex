import { EntryListPage } from "@/components/admin/EntryListPage";

export const dynamic = "force-dynamic";

export default function AdminProjectsPage() {
  return <EntryListPage kind="project" />;
}
