import type { RouteOptions } from "fastify";
import { getOnline } from "utils/getOnline";

interface GameInformation {
    name: string;
    cooldown: number;
    ended: boolean;
    canvas: {
        width: number;
        height: number;
    };
    online: number;
}

export const get: RouteOptions = {
    method: "GET",
    url: "/",
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    handler: (request, response) => {
        const { game } = request.server;
        const online = getOnline(request.server);

        const info: GameInformation = {
            name: game.name,
            cooldown: game.cooldown,
            ended: game.ended,
            canvas: {
                width: game.width,
                height: game.height
            },
            online
        };

        return response.code(200).send(info);
    }
};
