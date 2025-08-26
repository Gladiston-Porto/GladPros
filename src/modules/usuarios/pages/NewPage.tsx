// src/modules/usuarios/pages/NewPage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UserForm from "../components/UserForm";
import { createUser, type CreateUserInput } from "../services/usersApi";
import { useToast } from "@/components/ui/Toaster";

export default function UserNewPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  type ApiError = Error & { fields?: Record<string, string> };
  async function handleSubmit(data: CreateUserInput) {
    setSubmitting(true);
    setError(null);
    try {
      await createUser(data);
  showToast({ title: "Sucesso", message: "Usuário criado com sucesso", type: "success" });
  router.push("/usuarios");
    } catch (e: unknown) {
      const err = e as ApiError;
      // Se o erro tem campos específicos, vamos re-lançar para o UserForm capturar
      if (err?.fields) {
        throw err; // Re-lançar para que o UserForm possa capturar e mostrar os erros nos campos específicos
      }
      // Outros erros (genéricos) mostrar na página
  const msg = err?.message ?? "Erro inesperado";
  setError(msg);
  showToast({ title: "Erro", message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-title text-xl">Novo Usuário</h2>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <UserForm onSubmit={handleSubmit} onCancel={() => router.push("/usuarios")} submitting={submitting} />
    </div>
  );
}
