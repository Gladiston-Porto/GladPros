import { ReactNode } from "react";
import DashboardShell, { AppUser } from "@/components/GladPros";
import { requireServerUser } from "@/lib/requireServerUser";

export default async function ClientesLayout({ children }: { children: ReactNode }) {
  const user = (await requireServerUser()) as unknown as AppUser;
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
