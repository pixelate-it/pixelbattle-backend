import { RouteOptions } from "fastify";
import bmp from "@wokwi/bmp-ts"
import { MongoPixel } from "../../models/MongoPixel";
import { config } from "../../config";
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
        const pixels: Pick<MongoPixel, "color">[] = await this.database.pixels
            .find({}, { projection: { _id: 0, color: 1 } })
            .toArray();


        response
            .header('Content-Type', 'image/bmp')
            .code(200)
            .send(
                bmp.encode({
                    width: config.game.width,
                    height: config.game.height,
                    data: new Uint8Array(pixels.map(pix => utils.translateHex(pix.color)).flat()),
                    bitPP: 32,
                }).data
            );
    }
});