import { RouteOptions } from "fastify";
import { SocketPayload } from "../../types/SocketActions";
import { SocketStream } from "@fastify/websocket";
import WebSocket from "ws";

export type SocketConnection = SocketStream & {
    socket: WebSocket.WebSocket & { requestIp: string; }
}

export const socket: RouteOptions = {
    method: 'GET',
    url: '/socket',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    handler(request, response) {
        return response.status(418).send('why did you check this?');
    },
    wsHandler(connection, request) {
        connection.setEncoding('utf8');

        const cloudflareIpHeaders = request.headers['cf-connecting-ip']
        const ip = cloudflareIpHeaders
            ? Array.isArray(cloudflareIpHeaders)
                ? cloudflareIpHeaders[0]
                : cloudflareIpHeaders
            : request.ip;

        (connection as SocketConnection).socket.requestIp = ip;

        const action: SocketPayload<"ENDED"> = {
            op: "ENDED",
            value: true,
        }

        connection.write(action);
    }
}