import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { MongoUser } from "../../models/MongoUser";
import { EntityNotFoundError } from "../../errors";


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

        const pixel: Pick<MongoUser, "author" | "tag"> | null = await request.server.database.pixels
            .findOne(
                { x, y },
                {
                    projection: {
                        _id: 0,
                        author: 1,
                        tag: 1
                    }
                }
            );

        if (!pixel)
            throw new EntityNotFoundError("pixel")

        return response
            .code(200)
            .send(pixel);
    }
};