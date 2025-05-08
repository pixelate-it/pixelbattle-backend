import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "@core/errors";

export const getOne: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Querystring: { x: number; y: number } }
> = {
    method: "GET",
    url: "/",
    schema: {
        querystring: {
            type: "object",
            properties: {
                x: { type: "integer" },
                y: { type: "integer" }
            },
            required: ["x", "y"],
            additionalProperties: false
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        const x = request.query.x;
        const y = request.query.y;

        const pixel = request.server.cache.canvasService.getPixel({ x, y });

        if (!pixel) throw new EntityNotFoundError("pixel");

        return response.code(200).send({
            ...pixel,
            color: request.server.cache.canvasService.getColor({ x, y })
        });
    }
};
