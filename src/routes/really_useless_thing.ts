import { RouteOptions } from "fastify";

export const really_useless_thing: RouteOptions = {
    method: 'GET',
    url: '/',
    schema: {},
    handler: function (request, response) {
        return response
            .code(200)
            .send({ error: false, reason: 'welcome to r/place (LOL)' });
    }
}