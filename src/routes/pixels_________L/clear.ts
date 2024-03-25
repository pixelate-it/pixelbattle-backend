import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { genericSuccessResponse } from "../../types/ApiReponse";


interface Body {
    color: string;
}

export const clear: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: Body }> = {
    method: 'POST',
    url: '/clear',
    schema: {
        body: {
            type: 'object',
            required: [],
            properties: {
                color: { type: 'string', maxLength: 7, pattern: "^#[0-9A-Fa-f]{6}$" }
            }
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const color = request.body.color ?? '#ffffff';
        const canvas = {
            width: request.server.game.width,
            height: request.server.game.height
        }
        await request.server.cache.canvasManager.clear(color);

        return response
            .code(200)
            .send({ ...genericSuccessResponse, canvas });
    }
}