import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { MongoUser } from "../../models/MongoUser";
import { config } from "../../config";

interface ApiInfo {
    name: string;
    cooldown: number;
    ended: boolean;
    canvas: {
        width: number;
        height: number;
    };
    players: {
        total: number;
        online: number;
    }
}

export const get: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { x: number; y: number }; }> = {
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
        const total = await request.server.database.users
            .countDocuments();

        const online = new Set();
        request.server.websocketServer.clients.forEach(v => online.add(v));

        const info: ApiInfo = {
            name: config.game.name,
            cooldown: config.game.cooldown,
            ended: config.game.ended,
            canvas: {
                height: config.game.height,
                width: config.game.width
            },
            players: {
                total,
                online: online.size
            }
        }

        return response
            .code(200)
            .send(info);
    }
};