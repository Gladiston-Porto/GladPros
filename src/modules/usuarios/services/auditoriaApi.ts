import { AuditoriaResponse } from "@/types/auditoria";

export async function getAuditoriaUsuario(userId: number): Promise<AuditoriaResponse[]> {
  const response = await fetch(`/api/usuarios/${userId}/auditoria`);
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar auditoria: ${response.status}`);
  }
  
  return response.json();
}
