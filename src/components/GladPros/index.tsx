"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Package,
  DollarSign,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useConfirm } from "../ui/ConfirmDialog";
import { useTheme } from "@/components/ThemeProvider";

/**
 * =============================
 * GladPros — DashboardShell (CLIENT)
 * =============================
 * OBJETIVO: Remover a duplicação do Sidebar nas páginas.
 * USO:
 *  - O layout server-side do dashboard (app/(dashboard)/layout.tsx) deve importar ESTE componente
 *    e envolver {children}. A page.tsx de cada módulo renderiza SOMENTE o conteúdo do módulo.
 *
 * EXEMPLO (server layout):
 *  import { requireServerUser } from "@/lib/requireServerUser";
 *  import DashboardShell from "@/components/GladPros";
 *  export default async function Layout({ children }) {
 *    const user = await requireServerUser();
 *    return <DashboardShell user={user}>{children}</DashboardShell>;
 *  }
 */

// Tipos mínimos
export type UserRole = "ADMIN" | "GERENTE" | "FINANCEIRO" | "USUARIO" | "ESTOQUE" | "CLIENTE";
export type AppUser = { name: string; role: UserRole; avatarUrl?: string };
export type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

// Navegação padrão do GladPros (pode ser sobrescrita via prop se desejar)
export const DEFAULT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/usuarios", label: "Usuários", icon: ShieldCheck },
  { href: "/propostas", label: "Propostas", icon: FileText },
  { href: "/projetos", label: "Projetos", icon: Briefcase },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
];

// Mapa de cores por nível
const ROLE_THEME: Record<UserRole, { chip: string; glow: string }> = {
  ADMIN: { chip: "bg-[#3E4095] text-white", glow: "shadow-[0_0_0_3px_rgba(62,64,149,0.2)]" },
  GERENTE: { chip: "bg-[#0098DA] text-white", glow: "shadow-[0_0_0_3px_rgba(0,152,218,0.2)]" },
  FINANCEIRO: { chip: "bg-[#F58634] text-white", glow: "shadow-[0_0_0_3px_rgba(245,134,52,0.2)]" },
  USUARIO: { chip: "bg-[#3E4095] text-white", glow: "shadow-[0_0_0_3px_rgba(62,64,149,0.2)]" },
  ESTOQUE: { chip: "bg-[#0098DA] text-white", glow: "shadow-[0_0_0_3px_rgba(0,152,218,0.2)]" },
  CLIENTE: { chip: "bg-[#ED3237] text-white", glow: "shadow-[0_0_0_3px_rgba(237,50,55,0.2)]" },
};

// =============================
// DASHBOARD SHELL (DEFAULT EXPORT)
// =============================
export default function DashboardShell({
  user,
  children,
  nav = DEFAULT_NAV,
}: {
  user: AppUser;
  children: React.ReactNode;
  nav?: NavItem[];
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const { confirm, Dialog } = useConfirm();
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const roleTheme = useMemo(() => ROLE_THEME[(user?.role || "USUARIO") as UserRole], [user?.role]);

  // Logout unificado (confirmação + chamada API + redirecionamento)
  const handleLogout = async () => {
    if (isLoggingOut) return;
    const ok = await confirm({ title: "Sair", message: "Deseja encerrar a sessão?", confirmText: "Sair", tone: "danger" });
    if (!ok) return;
    setIsLoggingOut(true);
    try {
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      } catch {}
      // Limpeza defensiva de localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
    } finally {
      window.location.href = "/login";
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" data-testid="shell-root">
      {/* HEADER */}
        <HeaderBar
          collapsed={collapsed}
          roleTheme={roleTheme}
          user={user}
          theme={theme}
          onToggleTheme={() => {
            const newTheme = theme === "light" ? "dark" : "light";
            setTheme(newTheme);
          }}
        />

      {/* SIDEBAR */}
      <Sidebar
        nav={nav}
        activeHref={pathname || "/dashboard"}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
  onLogout={handleLogout}
  isLoggingOut={isLoggingOut}
      />

      {/* CONTENT */}
      <div className={`${collapsed ? "pl-[84px]" : "pl-[280px]"} pt-16 transition-all`}>
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6" data-testid="shell-content">
          {children}
        </main>
      </div>
  {/* Global confirm dialog mount for this shell */}
  <Dialog />
    </div>
  );
}

// =============================
// HEADER BAR
// =============================
export function HeaderBar({
  collapsed,
  roleTheme,
  user,
  theme,
  onToggleTheme,
}: {
  collapsed: boolean;
  roleTheme: { chip: string; glow: string };
  user: AppUser;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/30 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/90">
      <div className={`mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 ${collapsed ? "pl-24" : "pl-72"} transition-all`}>
        <div className="flex items-center gap-2">
          <span className="font-title text-base opacity-70">GladPros</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${roleTheme.chip}`}>{user.role}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              placeholder="Buscar…"
              className="w-[260px] rounded-xl border border-gray-300 bg-white px-9 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-[#0098DA] focus:ring-2 focus:ring-[#0098DA]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="relative rounded-xl p-2 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Alertas">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-content-center rounded-full bg-[#ED3237] text-[10px] text-white">3</span>
          </button>
          <button onClick={onToggleTheme} className="rounded-xl p-2 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Alternar tema">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button className="rounded-xl p-2 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Configurações">
            <Settings className="h-5 w-5" />
          </button>
          <div className={`ml-1 hidden items-center gap-2 rounded-2xl border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-700 md:flex ${roleTheme.glow}`}>
            <Image
              src={user.avatarUrl || "/images/LOGO_200.png"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
              alt="avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src.endsWith("/images/LOGO_200.png")) return
                target.src = "/images/LOGO_200.png"
              }}
            />
            <div className="mr-1 hidden sm:block">
              <div className="text-xs">{user.name}</div>
              <div className="text-[10px] opacity-60">Sessão ativa</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================
// SIDEBAR
// =============================
export function Sidebar({
  nav,
  activeHref,
  collapsed,
  onToggle,
  onLogout,
  isLoggingOut = false,
}: {
  nav: NavItem[];
  activeHref: string;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
}) {
  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen ${collapsed ? "w-[84px]" : "w-[280px]"} transition-all`} aria-label="Sidebar" data-testid="shell-sidebar">
      <div className="relative flex h-full flex-col border-r border-blue-200/50 bg-gradient-to-b from-[#3E4095] to-[#0098DA] text-white dark:border-blue-800/50">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-3">
            {collapsed ? (
              <div className="grid h-10 w-10 place-content-center rounded-xl bg-white/10 font-title shadow-md overflow-hidden">
                <Image src="/images/LOGO_ICONE2.png" alt="GP" width={36} height={36} />
              </div>
            ) : (
              <div className="relative h-9 w-[140px] leading-tight">
                <Image
                  src="/images/LOGO_200.png"
                  alt="GladPros"
                  fill
                  className="object-contain"
                  sizes="140px"
                  priority
                />
              </div>
            )}
          </div>
          <button onClick={onToggle} className="rounded-xl p-2 hover:bg-white/10" aria-label="Alternar sidebar">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="mt-2 flex-1 px-2">
          {nav.map((item, idx) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={activeHref === item.href || (activeHref?.startsWith(item.href) && item.href !== "/")}
              collapsed={collapsed}
              delay={idx * 0.03}
            />
          ))}
        </nav>

        <div className="px-3 pb-4 pt-2">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm text-white shadow ${isLoggingOut ? "bg-[#ED3237]/80 opacity-80 cursor-not-allowed" : "bg-[#ED3237] hover:brightness-110"}`}
            data-testid="sidebar-logout"
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {!collapsed && <span>Saindo…</span>}
              </span>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sair</span>}
              </>
            )}
          </button>
          <div className="mt-3 text-center text-[10px] opacity-70">v0.3 • Shell Único</div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  delay = 0,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
  delay?: number;
}) {
  return (
    <Link href={href} className="block focus:outline-none">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        title={collapsed ? label : undefined}
        className={`my-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/10 ${active ? "bg-white/15" : "opacity-90"}`}
      >
        <Icon className={`h-5 w-5 ${active ? "text-white" : "text-white/80"}`} />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="truncate">
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {active && <span className="ml-auto h-2 w-2 rounded-full bg-white/90" />}
      </motion.div>
    </Link>
  );
}

// =============================
// Painel genérico reutilizável
// =============================
export function Panel({ title, badge, className = "", children }: { title: string; badge?: number; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`} data-testid="panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-title text-lg">{title}</h3>
        {typeof badge === "number" && <span className="rounded-full bg-[#3E4095] px-2 py-0.5 text-xs text-white dark:bg-[#0098DA]">{badge}</span>}
      </div>
      {children ? (
        <div>{children}</div>
      ) : (
        <div className="grid h-44 place-content-center rounded-2xl border border-dashed border-gray-300 text-sm opacity-60 dark:border-gray-600">Área para gráficos/visualizações</div>
      )}
    </div>
  );
}
