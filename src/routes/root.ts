import { RouteOptions } from "fastify";

export const root: RouteOptions = {
    method: 'GET',
    url: '/',
    schema: {},
    handler: function (request, response) {
        return response
            .code(200)
            .send({ error: false, reason: 'PixelAPI v3 works! Good time for chill :D' });
    }
}