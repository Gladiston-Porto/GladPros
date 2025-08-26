"use client";
import React, { useEffect, useState } from "react";
import type { Usuario, UserRole } from "../types";

const roles: UserRole[] = ["ADMIN", "GERENTE", "USUARIO", "FINANCEIRO", "ESTOQUE", "CLIENTE"];

type FormUsuario = Partial<Usuario> & {
  dataNascimento?: string; // input type="date" (YYYY-MM-DD)
};

type ValidationErrors = {
  [key: string]: string;
};

export default function UserForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: FormUsuario;
  onSubmit: (data: FormUsuario) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<FormUsuario>({
    ativo: true,
    role: "USUARIO",
    status: "ATIVO",
    ...initial,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reidrata o formulário quando os dados iniciais mudarem (ex.: ao carregar usuário para edição)
  useEffect(() => {
    setForm((prev) => ({
      ativo: prev.ativo ?? true,
      role: prev.role ?? "USUARIO",
      status: prev.status ?? "ATIVO",
      ...initial,
    }));
  }, [initial]);

  function set<K extends keyof FormUsuario>(k: K, v: FormUsuario[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    // Limpar erro do campo quando o usuário modifica o valor
    if (errors[k as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[k as string];
        return newErrors;
      });
    }
  }

  function formatPhone(v?: string) {
    if (!v) return "";
    const d = v.replace(/\D/g, "").slice(0, 10);
    const part1 = d.slice(0, 3);
    const part2 = d.slice(3, 6);
    const part3 = d.slice(6, 10);
    if (part3) return `(${part1})${part2}-${part3}`;
    if (part2) return `(${part1})${part2}`;
    if (part1) return `(${part1}`;
    return "";
  }

  function formatDateInput(v?: string) {
    if (!v) return "";
    const d = v.replace(/\D/g, "").slice(0, 8); // MMDDYYYY
    const mm = d.slice(0, 2);
    const dd = d.slice(2, 4);
    const yyyy = d.slice(4, 8);
    if (yyyy) return `${mm}/${dd}/${yyyy}`;
    if (dd) return `${mm}/${dd}`;
    return mm;
  }

  function dateToISO(formatted?: string) {
    if (!formatted) return undefined;
    const m = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return undefined;
  const [, mm, dd, yyyy] = m; // MM/DD/YYYY
    // basic validity
    const month = Number(mm);
    const day = Number(dd);
    const year = Number(yyyy);
    if (month < 1 || month > 12) return undefined;
    if (day < 1 || day > 31) return undefined;
    return `${year.toString().padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // Função para processar erros vindos da API
  type ApiFieldError = Error & { fields?: Record<string, string> };
  function handleApiError(error: unknown) {
    const e = error as ApiFieldError;
    if (e?.fields) {
      setErrors(e.fields);
    } else if (e?.message) {
      // Erro genérico - mostrar no console por enquanto
      console.error("Erro de API:", e.message);
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({}); // Limpar erros anteriores
        
        try {
          // convert MM/DD/YYYY -> YYYY-MM-DD for backend compatibility
          const payload = { ...form } as typeof form;
          const iso = dateToISO(String(form.dataNascimento ?? ""));
          if (iso) payload.dataNascimento = iso;
          await onSubmit(payload);
        } catch (error: unknown) {
          handleApiError(error);
        }
      }}
      className={`max-w-3xl w-full mx-auto space-y-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5 ${submitting ? "opacity-90 cursor-wait" : ""}`}
    >
      <div className="space-y-3">
        <label className="text-sm block">
          <span className="mb-1 block opacity-80">Nome completo</span>
          <input
            className={`w-full rounded-xl border px-3 py-2 ${errors.nomeCompleto ? 'border-red-500' : ''}`}
            disabled={!!submitting}
            value={form.nomeCompleto ?? ""}
            onChange={(e) => set("nomeCompleto", e.target.value)}
            required
          />
          {errors.nomeCompleto && (
            <span className="text-xs text-red-600 mt-1 block">{errors.nomeCompleto}</span>
          )}
        </label>
        <label className="text-sm block">
          <span className="mb-1 block opacity-80">E-mail</span>
          <input
            type="email"
            className={`w-full rounded-xl border px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
            disabled={!!submitting}
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          {errors.email && (
            <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>
          )}
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-12 items-center">
        <label className="text-sm col-span-4">
          <span className="mb-1 block opacity-80">Data de aniversário</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/DD/YYYY"
            className={`w-full h-10 rounded-xl border px-3 py-2 uppercase ${errors.dataNascimento ? 'border-red-500' : ''}`}
            disabled={!!submitting}
            value={formatDateInput(String(form.dataNascimento ?? ""))}
            onChange={(e) => set("dataNascimento", formatDateInput(e.target.value))}
          />
          {errors.dataNascimento && (
            <span className="text-xs text-red-600 mt-1 block">{errors.dataNascimento}</span>
          )}
        </label>

        <label className="text-sm col-span-4">
          <span className="mb-1 block opacity-80">Telefone</span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(XXX)XXX-XXXX"
            className={`w-full h-10 rounded-xl border px-3 py-2 ${errors.telefone ? 'border-red-500' : ''}`}
            disabled={!!submitting}
            value={formatPhone(String(form.telefone ?? ""))}
            onChange={(e) => set("telefone", e.target.value)}
            onBlur={(e) => set("telefone", formatPhone(e.target.value))}
            onInput={(e) => {
              const vStr = String((e.target as HTMLInputElement).value);
              const digits = vStr.replace(/\D/g, "");
              set("telefone", formatPhone(digits));
            }}
          />
          {errors.telefone && (
            <span className="text-xs text-red-600 mt-1 block">{errors.telefone}</span>
          )}
        </label>

        <div className="text-sm col-span-4 relative">
          <label>
            <span className="mb-1 block opacity-80">Nível</span>
            <select
              className="w-full h-10 rounded-xl border px-3 py-2"
              disabled={!!submitting}
              value={form.role ?? "USUARIO"}
              onChange={(e) => set("role", e.target.value as UserRole)}
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <div className="absolute left-0 top-full mt-2">
            <label className="text-sm inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.ativo}
                disabled={!!submitting}
                onChange={(e) => set("ativo", e.target.checked)}
              />
              Ativo
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm block">
          <span className="mb-1 block opacity-80">Endereço 1</span>
          <input
            className="w-full rounded-xl border px-3 py-2"
            disabled={!!submitting}
            value={form.endereco1 ?? ""}
            onChange={(e) => set("endereco1", e.target.value)}
          />
        </label>
        <label className="text-sm block">
          <span className="mb-1 block opacity-80">Endereço 2</span>
          <input
            className="w-full rounded-xl border px-3 py-2"
            disabled={!!submitting}
            value={form.endereco2 ?? ""}
            onChange={(e) => set("endereco2", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-12 items-center">
        <label className="text-sm col-span-7">
          <span className="mb-1 block opacity-80">Cidade</span>
          <input
            className="w-full rounded-xl border px-3 py-2 h-10"
            disabled={!!submitting}
            value={form.cidade ?? ""}
            onChange={(e) => set("cidade", e.target.value)}
          />
        </label>
        <label className="text-sm col-span-3">
          <span className="mb-1 block opacity-80">Estado</span>
          <input
            className="w-full rounded-xl border px-3 py-2 h-10 max-w-[140px]"
            disabled={!!submitting}
            value={form.estado ?? ""}
            onChange={(e) => set("estado", e.target.value)}
          />
        </label>
        <label className="text-sm col-span-2">
          <span className="mb-1 block opacity-80">CEP</span>
          <input
            className={`w-full rounded-xl border px-3 py-2 h-10 max-w-[120px] ${errors.cep ? 'border-red-500' : ''}`}
            disabled={!!submitting}
            value={form.cep ?? ""}
            onChange={(e) => {
              // Permitir apenas números no CEP
              const onlyNumbers = e.target.value.replace(/\D/g, "");
              set("cep", onlyNumbers);
            }}
            placeholder="12345678"
            maxLength={8}
          />
          {errors.cep && (
            <span className="text-xs text-red-600 mt-1 block">{errors.cep}</span>
          )}
        </label>
      </div>

      <label className="text-sm block">
        <span className="mb-1 block opacity-80">Anotações</span>
        <textarea
          className="w-full rounded-xl border px-3 py-2"
          rows={4}
          disabled={!!submitting}
          value={form.anotacoes ?? ""}
          onChange={(e) => set("anotacoes", e.target.value)}
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white hover:brightness-110 disabled:opacity-70"
        >
          {submitting && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
          )}
          <span>{submitting ? "Salvando…" : "Salvar"}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[#0098DA] px-4 py-2 text-sm text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
