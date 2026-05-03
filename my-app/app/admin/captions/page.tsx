import { RenderAdminSectionPage } from "@/app/admin/admin-section-page";

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <RenderAdminSectionPage section="captions" rawPage={page} />;
}
