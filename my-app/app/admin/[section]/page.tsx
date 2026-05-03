import { RenderAdminSectionPage } from "@/app/admin/admin-section-page";

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string; error?: string; success?: string }>;
}) {
  const { section } = await params;
  const { page: rawPage, error, success } = await searchParams;
  return <RenderAdminSectionPage section={section} rawPage={rawPage} flashError={error} flashSuccess={success} />;
}
