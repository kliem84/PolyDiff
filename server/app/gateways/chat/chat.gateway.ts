import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            if (origin === undefined || origin === 'https://admin.socket.io') {
                callback(null, true);
            } else {
                callback(null, '*');
            }
        },
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway {
    @SubscribeMessage('message')
    handleMessage(client: unknown, payload: unknown): string {
        return 'Hello world!';
    }
}
