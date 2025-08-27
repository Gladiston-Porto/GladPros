// Real-time notification system using WebSockets
import { Server as SocketIOServer } from 'socket.io'

export interface NotificationPayload {
  type: 'proposal_signed' | 'proposal_sent' | 'proposal_approved' | 'proposal_cancelled'
  data: {
    proposalId: string
    proposalNumber: string
    clientName?: string
    signedBy?: string
    timestamp: string
    message: string
  }
}

class NotificationService {
  private io: SocketIOServer | null = null

  initialize(server: import('http').Server) {
    if (!this.io) {
      this.io = new SocketIOServer(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      })

      this.io.on('connection', (socket) => {
        // Conexão estabelecida - eventos de socket registrados.

        // Join room for user notifications
  socket.on('join_user_room', (userId: string) => {
          socket.join(`user_${userId}`)
          // Room join registered for userId
        })

        socket.on('disconnect', () => {
          // Cliente desconectado - limpeza automática realizada pelo socket.io
        })
      })
    }
  }

  sendNotification(payload: NotificationPayload, userId?: string) {
    if (!this.io) {
      // Socket.IO não inicializado; silencioso em runtime.
      return
    }

    if (userId) {
      // Send to specific user
      this.io.to(`user_${userId}`).emit('notification', payload)
    } else {
      // Broadcast to all connected clients
      this.io.emit('notification', payload)
    }
  }

  sendProposalSignedNotification(proposalId: string, proposalNumber: string, clientName: string, signedBy: string) {
    const payload: NotificationPayload = {
      type: 'proposal_signed',
      data: {
        proposalId,
        proposalNumber,
        clientName,
        signedBy,
        timestamp: new Date().toISOString(),
        message: `Proposta ${proposalNumber} foi assinada por ${signedBy}`
      }
    }

    this.sendNotification(payload)
  }

  sendProposalSentNotification(proposalId: string, proposalNumber: string, clientName: string) {
    const payload: NotificationPayload = {
      type: 'proposal_sent',
      data: {
        proposalId,
        proposalNumber,
        clientName,
        timestamp: new Date().toISOString(),
        message: `Proposta ${proposalNumber} foi enviada para ${clientName}`
      }
    }

    this.sendNotification(payload)
  }
}

export const notificationService = new NotificationService()
export default notificationService
