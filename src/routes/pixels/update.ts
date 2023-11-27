import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { MongoUser } from "../../models/MongoUser";
import { MongoPixel } from "../../models/MongoPixel";
import { LoggingHelper } from "../../helpers/LoggingHelper";
import { config } from "../../config";
import { TokenBannedError, UserCooldownError, EntityNotFoundError, EndedError, WrongTokenError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";


interface Body {
    color: string;
    x: number;
    y: number;
    token?: string;
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
                token: { type: 'string' },
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

        if (!request.user) {
            throw new WrongTokenError()
        }

        if (config.game.ended) {
            throw new EndedError()
        }

        if (request.user?.isBanned) {
            throw new TokenBannedError()
        }

        const now = performance.now()
        if (request.user.cooldown > now) {
            const time = Number(((request.user.cooldown - now) / 1000).toFixed(1))

            throw new UserCooldownError(time)
        }


        done();
    },
    async handler(request, response) {
        if (!request.user) {
            throw new WrongTokenError()
        }


        const x = Number(request.body.x);
        const y = Number(request.body.y)
        const color = request.body.color;

        const pixel: Pick<MongoPixel, "_id"> | null = await request.server.database.pixels
            .findOne({ x, y }, { projection: { _id: 1 } });


        if (!pixel) {
            throw new EntityNotFoundError("pixel")
        }

        const cooldown =  performance.now() + request.user.role !== "USER" ? 50 : config.game.cooldown;

        await request.server.database.users
            .updateOne(
                {
                    token: request.body.token
                },
                {
                    $set: {
                        cooldown
                    }
                }
            );

        await request.server.database.pixels
            .updateOne(
                { x, y },
                {
                    $set: {
                        color,
                        author: request.user.username,
                        tag: request.user.role !== "USER"
                            ? null
                            : request.user.tag
                    }
                }
            );

        request.server.websocketServer.clients.forEach((client) =>
            client.readyState === 1 &&
            client.send(JSON.stringify({
                op: 'PLACE',
                x, y,
                color
            })
            )
        );

        LoggingHelper.sendPixelPlaced(
            {
                tag: request.user.role !== "USER"
                    ? 'Pixelate It! Team'
                    : request.user.tag,
                userID: request.user.userID,
                x, y,
                color
            }
        );

        return response
            .code(200)
            .send(genericSuccessResponse);
    }
}