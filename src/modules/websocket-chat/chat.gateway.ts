import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './tenant-aware-chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    tenantSlug: string;
    userId: string;
  };
}

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Iniciando chat👩‍💻');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const tenantSlug = client.handshake.auth?.tenantSlug;
    if (!tenantSlug) {
      this.logger.error('Conexión rechazada: No se proporcionó tenantSlug.');
      client.disconnect(true);
      return;
    }

    const isValidTenant = await this.chatService.validateTenant(tenantSlug);
    if (!isValidTenant) {
      this.logger.error(
        `Conexión rechazada: usuario inválido '${tenantSlug}'.`,
      );
      client.disconnect(true);
      return;
    }

    client.data.tenantSlug = tenantSlug;
    // client.data.userId = 'id-del-usuario-extraido-del-jwt'; // Lógica de autenticación
    this.logger.log(`Usuario conectado: ${client.id} al db: ${tenantSlug}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.data.tenantSlug) {
      this.logger.log(
        `Usuario desconectado: ${client.id} del db: ${client.data.tenantSlug}`,
      );
    } else {
      this.logger.log(
        `Usuario desconectado: ${client.id} (sin tenant asignado)`,
      );
    }
  }

  private getTenantRoomName(tenantSlug: string, room: string): string {
    return `${tenantSlug}__${room}`;
  }

  @SubscribeMessage('event_join')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() room: string,
  ) {
    const tenantSlug = client.handshake.auth?.tenantSlug;
    const tenantRoom = this.getTenantRoomName(tenantSlug, room);

    this.logger.log(`Cliente ${client.id} uniéndose a la sala ${tenantRoom}`);
    client.join(tenantRoom);
  }

  @SubscribeMessage('event_message')
  handleIncommingMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { room: string; message: string },
  ) {
    const tenantSlug = client.handshake.auth?.tenantSlug;
    const { room, message } = payload;
    const tenantRoom = this.getTenantRoomName(tenantSlug, room);

    this.logger.log(`Retransmitiendo mensaje a la sala ${tenantRoom}`);

    client.to(tenantRoom).emit('new_message', {
      user: client.id,
      message: message,
      createdAt: new Date(),
    });
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() room: string,
  ) {
    const tenantSlug = client.handshake.auth?.tenantSlug;

    const tenantRoom = this.getTenantRoomName(tenantSlug, room);

    this.logger.log(`Cliente ${client.id} abandonando la sala ${tenantRoom}`);

    client.leave(`room_${tenantRoom}`);
    this.server.to(tenantRoom).emit('user_left', {
      user: client.id,
      message: `El usuario ${client.id.substring(0, 5)} se ha ido.`,
    });
  }
}
