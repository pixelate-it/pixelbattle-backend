import { RouteOptions } from "fastify";
import bmp from "@wokwi/bmp-ts"
import { utils } from "../../extra/Utils";

export const getAll: RouteOptions = ({
    method: 'GET',
    url: '.bmp',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '2s'
        }
    },
    handler: async function handler(request, response) {
        response
            .header('Content-Type', 'image/bmp')
            .code(200)
            .send(
                bmp.encode({
                    width: request.server.game.width,
                    height: request.server.game.height,
                    data: new Uint8Array(request.server.cache.canvasManager.pixels.map(pix => utils.translateHex(pix.color)).flat()),
                    bitPP: 32,
                }).data
            );
    }
});