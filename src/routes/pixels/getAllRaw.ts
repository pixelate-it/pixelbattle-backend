import { RouteOptions } from "fastify";
import { MongoPixelInternal } from "../../models/MongoPixel";
import { utils } from "../../extra/Utils";


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
        return response
            .header('Content-Type', 'image/json')
            .code(200)
            .send({
                pixels: request.server.cache.canvasManager.pixels.map((pix: MongoPixelInternal) => ({ x: pix.x, y: pix.y, color: utils.translateRGB(pix.color) })),
                width: request.server.game.width,
                height: request.server.game.height
            });
    }
});