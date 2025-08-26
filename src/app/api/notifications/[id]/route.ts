import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';

// PUT /api/notifications/[id]/read - Marcar notificação como lida
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = parseInt(req.headers.get('x-user-id') || '');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

  const { id: notificationId } = await context.params;
    const success = await NotificationService.markAsRead(userId, notificationId);

    if (!success) {
      return NextResponse.json(
        { error: 'Falha ao marcar notificação como lida' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Deletar notificação
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = parseInt(req.headers.get('x-user-id') || '');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

  const { id: notificationId } = await context.params;
    const success = await NotificationService.delete(userId, notificationId);

    if (!success) {
      return NextResponse.json(
        { error: 'Falha ao deletar notificação' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] Erro ao deletar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
