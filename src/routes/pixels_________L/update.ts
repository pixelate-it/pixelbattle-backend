import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { LoggingHelper } from "../../helpers/LoggingHelper";
import { config } from "../../config";
import { TokenBannedError, UserCooldownError, EntityNotFoundError, EndedError, WrongTokenError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";
import { toJson } from "../../extra/toJson";
import { SocketPayload } from "../../types/SocketActions";
import { UserRole } from "../../models/MongoUser";
import { WebSocket } from "ws";

function randomHex(size = 6) {
    return '#' + [...Array(size)]
        .map(() =>
            Math.floor(Math.random() * 16)
                .toString(16)
        ).join('');
} // https://github.com/pixelate-it/pixelbattle-extender/blob/master/index.js#L12C1-L18C2

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
            max: 8,
            timeWindow: '1s'
        }
    },
    async preHandler(request, response, done) {
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
        const color = randomHex(); // lol who cares about "request.body.color" ?
        const pixel = request.server.cache.canvasManager.select({ x, y });

        if(!pixel) {
            throw new EntityNotFoundError("pixel");
        }

        const cooldown = Date.now() + (request.user.role !== UserRole.User ? config.moderatorCooldown : request.server.game.cooldown);

        await request.server.cache.usersManager.edit({ token: request.user.token }, { cooldown });
        const cacheKey = `${request.user.userID}-${x}-${y}-${color}` as const;

        if(!request.server.cache.set.has(cacheKey)) {
            const tag = request.user.role !== UserRole.User
                ? null
                : request.user.tag;


            request.server.cache.canvasManager.paint({
                x,
                y,
                color,
                tag,
                author: request.user.username
            });

            request.server.websocketServer.clients.forEach((client) => {
                if(client.readyState !== WebSocket.OPEN) return;

                const payload: SocketPayload<"PLACE"> = {
                    op: 'PLACE',
                    x,
                    y,
                    color,
                }

                client.send(toJson(payload));
            });

            const cloudflareIpHeaders = request.headers['cf-connecting-ip'];

            LoggingHelper.sendPixelPlaced(
                {
                    tag,
                    userID: request.user.userID,
                    nickname: request.user.username,
                    ip: cloudflareIpHeaders
                        ? Array.isArray(cloudflareIpHeaders)
                            ? cloudflareIpHeaders[0]
                            : cloudflareIpHeaders
                        : request.ip,
                    x, y,
                    color
                }
            );


            request.server.cache.set.add(cacheKey);
            setTimeout(() => request.server.cache.set.delete(cacheKey), 600); // CORS spam fix
        }

        return response
            .code(200)
            .send(genericSuccessResponse);
    }
}