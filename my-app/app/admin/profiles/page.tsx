import { RenderAdminSectionPage } from "@/app/admin/admin-section-page";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return <RenderAdminSectionPage section="profiles" rawPage={page} />;
}
