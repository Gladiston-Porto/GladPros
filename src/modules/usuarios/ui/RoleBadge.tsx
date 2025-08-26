// src/modules/usuarios/components/RoleBadge.tsx
"use client";
import type { UserRole } from "../types";

const colors: Record<UserRole, string> = {
  ADMIN: "bg-[#3E4095]/15 text-[#3E4095] dark:bg-[#3E4095]/20",
  GERENTE: "bg-[#0098DA]/15 text-[#0098DA] dark:bg-[#0098DA]/20",
  FINANCEIRO: "bg-[#F58634]/15 text-[#F58634] dark:bg-[#F58634]/20",
  USUARIO: "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-200",
  ESTOQUE: "bg-[#0098DA]/15 text-[#0098DA] dark:bg-[#0098DA]/20",
  CLIENTE: "bg-[#ED3237]/15 text-[#ED3237] dark:bg-[#ED3237]/20",
};

export default function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`rounded-full px-2 py-1 text-xs ${colors[role]}`}>{role}</span>;
}
