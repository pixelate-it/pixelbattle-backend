import { WebSocketServer } from "ws";

interface websocketServer extends Omit<WebSocketServer, "clients"> {
    clients: Set<WebSocket>;
}

interface ClientConnection {
    latency: number;
    when: number;
}

declare module "ws" {
    interface WebSocket {
        ip: string;
        connection: ClientConnection;
    }
}

declare module "fastify" {
    interface FastifyInstance {
        websocketServer: websocketServer;
    }
}
