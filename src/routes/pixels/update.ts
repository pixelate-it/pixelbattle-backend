import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { LoggingHelper } from "../../helpers/LoggingHelper";
import { config } from "../../config";
import { TokenBannedError, UserCooldownError, EntityNotFoundError, EndedError, WrongTokenError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";
import { toJson } from "../../extra/toJson";
import { SocketPayload } from "../../types/SocketActions";


interface Body {
    color: string;
    x: number;
    y: number;
}


export const update: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: Body }> = {
    method: 'PUT',
    url: '/',
    schema: {
        body: {
            type: 'object',
            required: ['color', 'x', 'y'],
            properties: {
                color: { type: 'string', pattern: "^#[0-9A-Fa-f]{6}$" },
                x: { type: 'integer' },
                y: { type: 'integer' }
            }
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: '1s'
        }
    },
    async preHandler(request, response, done) {
        // console.log(request.user)

        if(!request.user) {
            throw new WrongTokenError();
        }

        if(request.server.game.ended) {
            throw new EndedError();
        }

        if(request.user.banned) {
            throw new TokenBannedError();
        }

        const now = Date.now();
        if(request.user.cooldown > now) {
            const time = Number(((request.user.cooldown - now) / 1000).toFixed(1));

            throw new UserCooldownError(time);
        }

        done();
    },
    async handler(request, response) {
        if(!request.user) {
            throw new WrongTokenError();
        }

        const x = Number(request.body.x);
        const y = Number(request.body.y);
        const color = request.body.color;
        const pixel = request.server.cache.canvasManager.select({ x, y });

        if(!pixel) {
            throw new EntityNotFoundError("pixel");
        }

        const cooldown = Date.now() + (request.user.role !== 0 ? config.moderatorCooldown : request.server.game.cooldown);

        await request.server.cache.usersManager.edit({ token: request.user.token }, { cooldown });
        const cacheKey = `${request.user.userID}-${x}-${y}-${color}` as const;

        if(!request.server.cache.map.has(cacheKey)) {
            const tag = request.user.role !== 0
                ? 'Pixelate It! Team'
                : request.user.tag;


            request.server.cache.canvasManager.paint({
                x,
                y,
                color,
                tag,
                author: request.user.username
            });

            request.server.websocketServer.clients.forEach((client) => {
                if(client.readyState !== 1) return;

                const payload: SocketPayload<"PLACE"> = {
                    op: 'PLACE',
                    x,
                    y,
                    color,
                }

                client.send(toJson(payload));
            });

            LoggingHelper.sendPixelPlaced(
                {
                    tag,
                    userID: request.user.userID,
                    x, y,
                    color
                }
            );


            request.server.cache.map.set(cacheKey, true);
            setTimeout(() => request.server.cache.map.delete(cacheKey), 600); // CORS spam fix
        }

        return response
            .code(200)
            .send(genericSuccessResponse);
    }
}