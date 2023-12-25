import { RouteOptions } from "fastify";
import { MongoPixel } from "../../models/MongoPixel";


export const getTags: RouteOptions = {
    method: 'GET',
    url: '/tag',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '5s'
        }
    },
    async handler(request, response) {
        const pixels: Pick<MongoPixel, "tag">[] = await request.server.database.pixels
            .find(
                {},
                {
                    projection: {
                        _id: 0,
                        tag: 1
                    }
                }
            )
            .toArray();

        const data = pixels.reduce((info, pixel) => {
            if (pixel.tag === null) {
                info.unused++;

                return info
            }

            const tagAmount = info.tags[pixel.tag]
            info.tags[pixel.tag] = tagAmount ? tagAmount + 1 : 1
            info.used++;

            return info
        }, {
            used: 0,
            unused: 0,
            tags: {} as Record<string, number>
        })

        return response.send({
            pixels: {
                all: data.unused + data.used,
                used: data.used,
                unused: data.unused
            },
            tags: Object
                .entries(data.tags)
                .sort((x, y) => y[1] - x[1])
                .slice(0, 10)
        });
    }
};