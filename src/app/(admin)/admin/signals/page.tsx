import { EntryListPage } from "@/components/admin/EntryListPage";

export const dynamic = "force-dynamic";

export default function AdminSignalsPage() {
  return <EntryListPage kind="signal" />;
}
