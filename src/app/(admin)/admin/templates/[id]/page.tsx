import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates";
import { TemplateEditor } from "@/components/admin/TemplateEditor";

export const dynamic = "force-dynamic";

export default async function TemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();
  return <TemplateEditor template={template} />;
}
