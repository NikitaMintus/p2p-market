import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn('Client has no token');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'secretKey'
      });
      client.join(`user_${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} User: ${payload.sub}`);
    } catch (e) {
      this.logger.error('Invalid token', e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    const queryToken = client.handshake.query.token;
     if (typeof queryToken === 'string') {
        return queryToken;
    }
    return undefined;
  }

  notifyUser(userId: string, message: any) {
    this.server.to(`user_${userId}`).emit('notification', message);
  }
}



