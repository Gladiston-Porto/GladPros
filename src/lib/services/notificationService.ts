// Real-time notification system using WebSockets
import { Server as SocketIOServer } from 'socket.io'
// NextApiRequest/NextApiResponse removidos porque não são usados neste serviço

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

  initialize(server: unknown) {
    if (!this.io) {
  // server might be an http.Server instance; narrow cast here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this.io = new SocketIOServer(server as any, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      })

      this.io.on('connection', (socket) => {
        // conexão de cliente estabelecida
        console.log('Cliente conectado:', socket.id)

        // Join room for user notifications
        socket.on('join_user_room', (userId: string) => {
          socket.join(`user_${userId}`)
          console.log(`Usuario ${userId} joined room`)
        })

        socket.on('disconnect', () => {
          // desconexão do cliente
          console.log('Cliente desconectado:', socket.id)
        })
      })
    }
  }

  sendNotification(payload: NotificationPayload, userId?: string) {
    if (!this.io) {
      console.warn('Socket.IO not initialized')
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
