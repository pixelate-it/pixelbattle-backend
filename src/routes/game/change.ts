import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../apiErrors";
import { SocketServerPayload } from "../../types/SocketActions";
import { genericSuccessResponse } from "../../types/ApiReponse";
import { WebSocket } from "ws";

interface ApiBody {
    name?: string;
    ended?: boolean;
    cooldown?: number;
}

export const change: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: ApiBody }> = {
    method: 'POST',
    url: '/change',
    schema: {
        body: {
            type: 'object',
            required: [],
            properties: {
                name: { type: 'string', maxLength: 32 },
                ended: { type: 'boolean' },
                cooldown: { type: 'integer', minimum: 1 }
            }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const { game } = request.server;

        if(!game) {
            throw new EntityNotFoundError("game");
        }

        if((request.body.ended !== game.ended) && (typeof request.body.ended === 'boolean')) {
            game.ended = request.body.ended;

            if(request.body.ended) {
                clearInterval(request.server.cache.interval);

                request.server.cache.canvasManager.sendPixels();
            } else {
                await request.server.cache.canvasManager.init();

                request.server.cache.createInterval();
            }

            request.server.websocketServer.clients.forEach((client) => {
                if(client.readyState !== WebSocket.OPEN) return;

                const payload: SocketServerPayload<"ENDED"> = {
                    op: "ENDED",
                    value: game.ended
                }

                client.send(JSON.stringify(payload));
            });
        }


        game.cooldown = request.body.cooldown ?? game.cooldown;
        game.name = request.body.name ?? game.name;

        await request.server.database.games.updateOne({ id: 0 }, { $set: { ended: game.ended, cooldown: game.cooldown, name: game.name } }, { hint: { id: 1 } });

        return response
            .code(202)
            .send(genericSuccessResponse);
    }
}