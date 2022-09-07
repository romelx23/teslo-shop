import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageWsService: MessageWsService) {}
  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected', client.id);
    // throw new Error('Method not implemented.');
  }
  handleDisconnect(client: Socket) {
    console.log('client disconnected', client.id);
    // throw new Error('Method not implemented.');
  }
}
