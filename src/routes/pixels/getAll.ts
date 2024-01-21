import { RouteOptions } from "fastify";
import { utils } from "../../extra/Utils";
import { MongoPixel } from "../../models/MongoPixel";
import { encode } from "fast-png"

export const getAll: RouteOptions = ({
    method: 'GET',
    url: '.png',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '2s'
        }
    },
    handler: async function handler(request, response) {
        const image = encode({
            width: request.server.game.width,
            height: request.server.game.height,
            channels: 3,
            data: new Uint8Array(request.server.cache.canvasManager.pixels.map((pix: MongoPixel) => utils.translateHex(pix.color)).flat()),
        })

        response
            .header('Content-Type', 'image/png')
            .code(200)
            .send(image);
    }
});