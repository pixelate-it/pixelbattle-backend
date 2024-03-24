import { RouteOptions } from "fastify";
import { readFile } from "fs/promises";

export const favicon: RouteOptions = {
    method: 'GET',
    url: '/favicon.ico',
    schema: {},
    config: {
        rateLimit: {
            max: 1,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        return response
            .header('Content-Type', 'image/x-icon')
            .code(200)
            .send(await readFile('./assets/favicon.ico'));
    }
}