import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../apiErrors";


export const getOne: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { x: number; y: number }; }> = {
    method: 'GET',
    url: '/',
    schema: {
        querystring: {
            x: { type: 'integer' },
            y: { type: 'integer' }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const x = request.query.x;
        const y = request.query.y;

        const pixel = request.server.cache.canvasManager.select({ x, y });

        if(!pixel)
            throw new EntityNotFoundError("pixel");

        return response
            .code(200)
            .send({
                ...pixel,
                color: request.server.cache.canvasManager.getColor({ x, y })
            });
    }
}