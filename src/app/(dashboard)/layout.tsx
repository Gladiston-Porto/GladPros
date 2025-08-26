// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import DashboardShell, { AppUser } from "@/components/GladPros";
import { requireServerUser } from "@/lib/requireServerUser";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = (await requireServerUser()) as unknown as AppUser; // garanta { name, role, avatarUrl? }
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
