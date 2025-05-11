import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityInvalidError } from "@core/errors";

export const getByTag: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { tag: string }; Querystring: { limit: number; page: number } }
> = {
    method: "GET",
    url: "tag/:tag",
    schema: {
        querystring: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    minimum: 5,
                    maximum: 50,
                    default: 10
                },
                page: {
                    type: "integer",
                    minimum: 1,
                    default: 1
                }
            },
            required: [],
            additionalProperties: false
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "3s"
        }
    },
    async handler(request, response) {
        const { tag } = request.params;

        if (tag === "" || tag.length > 8) throw new EntityInvalidError("tag");

        const { limit, page } = request.query;

        const available = await request.server.database.users.countDocuments(
            {
                tag: request.params.tag
            },
            { hint: { tag: 1 } }
        );
        const list = await request.server.database.users
            .find(
                {
                    tag: request.params.tag
                },
                { hint: { tag: 1 }, projection: { userID: 1 } }
            )
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return response.code(200).send({
            users: list.map((u) => u.userID),
            pagination: {
                current: page,
                available: Math.ceil(available / limit)
            }
        });
    }
};
