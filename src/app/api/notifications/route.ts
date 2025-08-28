import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';

// GET /api/notifications - Buscar notificações do usuário
export async function GET(req: NextRequest) {
  try {
    const userId = parseInt(req.headers.get('x-user-id') || '');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    const result = await NotificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API] Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Criar nova notificação (apenas para admins)
export async function POST(req: NextRequest) {
  try {
    const userType = req.headers.get('x-user-type');
    
    if (userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { userId, type, title, message, data, expiresAt } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: userId, type, title, message' },
        { status: 400 }
      );
    }

    const notificationId = await NotificationService.create({
      userId,
      type,
      title,
      message,
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return NextResponse.json({
      success: true,
      notificationId
    });

  } catch (error) {
    console.error('[API] Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

