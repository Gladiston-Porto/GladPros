import React from "react";

// GladPros brand helpers
export const gp = {
  blue: "#0A2C52", // dark blue
  orange: "#D6631C", // dark orange
};

// Tiny UI atoms (kept local so preview works without external libs)
export const Label = ({ children, required, className }: { children: React.ReactNode; required?: boolean; className?: string }) => (
  <label className={`block text-sm font-medium text-slate-700 ${className || ""}`}>
    {children}
    {required ? <span className="text-red-500"> *</span> : null}
  </label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-[var(--gp-orange)]",
      props.className ?? "",
    ].join(" ")}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={props.rows ?? 4}
    {...props}
    className={[
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-[var(--gp-orange)]",
      props.className ?? "",
    ].join(" ")}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={[
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-[var(--gp-orange)]",
      props.className ?? "",
    ].join(" ")}
  />
);

export const Section = ({ title, subtitle, children, right }: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {right}
    </div>
    {children}
  </section>
);

export const Badge = ({ children, color = "slate" }: { children: React.ReactNode; color?: "slate" | "green" | "orange" | "red" }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${map[color]}`}>{children}</span>;
};

export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={[
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold",
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-colors duration-200",
      props.className || ""
    ].join(" ")}
  />
);

export function currency(n: number | undefined) {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
