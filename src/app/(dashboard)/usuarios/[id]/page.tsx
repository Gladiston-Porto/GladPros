// src/app/(dashboard)/usuarios/[id]/page.tsx
import UserDetailPage from "@/modules/usuarios/pages/DetailPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage id={String(id)} />;
}
