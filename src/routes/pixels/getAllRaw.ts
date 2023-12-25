import { RouteOptions } from "fastify";


export const getAllRaw: RouteOptions = ({
    method: 'GET',
    url: '.json',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    handler: async function handler(request, response) {
        response
            .header('Content-Type', 'image/json')
            .code(200)
            .send({
                pixels: request.server.cache.canvasManager.pixels.map(pix => ({ x: pix.x, y: pix.y, color: pix.color })),
                width: request.server.game.width,
                height: request.server.game.height
            });
    }
});