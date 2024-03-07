import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../errors";
import { SocketConnection } from "../../helpers/SocketHelper";

interface ApiInfo {
    name: string;
    cooldown: number;
    ended: boolean;
    canvas: {
        width: number;
        height: number;
    };
    online: number;
}

export const get: RouteOptions<Server, IncomingMessage, ServerResponse> = {
    method: 'GET',
    url: '/',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const online = new Set();
        request.server.websocketServer.clients.forEach(v => online.add((v as SocketConnection["socket"]).requestIp));

        const { game } = request.server;

        if(!game) {
            throw new EntityNotFoundError("games");
        }

        const info: ApiInfo = {
            name: game.name,
            cooldown: game.cooldown,
            ended: game.ended,
            canvas: {
                height: game.height,
                width: game.width
            },
            online: online.size
        }

        return response
            .code(200)
            .send(info);
    }
}