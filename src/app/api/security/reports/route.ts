import { NextRequest, NextResponse } from "next/server";
import { SecurityService } from "@/lib/security";

// GET - Relatórios de segurança
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'failed-logins';
    const limit = parseInt(searchParams.get('limit') || '100');
    const hours = parseInt(searchParams.get('hours') || '24');
  const userIdParam = searchParams.get('userId');
  const userId = userIdParam ? parseInt(userIdParam) : undefined;

    let data;

    switch (type) {
      case 'login-attempts':
        if (userId && !Number.isNaN(userId)) {
          // Busca tentativas de um usuário específico (tanto sucesso quanto falha)
          data = await SecurityService.getLoginAttemptsByUser(userId, limit);
        } else {
          data = await SecurityService.getLoginAttempts(limit);
        }
        break;
      
      case 'failed-logins':
        data = await SecurityService.getFailedLogins(hours);
        break;
      
      case 'active-sessions':
        data = await SecurityService.getActiveSessions();
        break;
      
      default:
        return NextResponse.json(
          { message: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type,
      results: data,
      count: data.length
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

