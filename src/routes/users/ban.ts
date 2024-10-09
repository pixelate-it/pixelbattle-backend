import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "utils/templateHttpError";
import { genericSuccessResponse } from "types/ApiResponse";
import type { BanInfo } from "models/MongoUser";

export const ban: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { id: string }; Body: BanInfo }
> = {
    method: "POST",
    url: "/:id/ban",
    schema: {
        body: {
            type: "object",
            required: ["timeout"],
            properties: {
                reason: { type: "string" },
                timeout: { type: "number" }
            }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersManager.edit(
            { userID: request.params.id },
            {
                banned: {
                    moderatorID: request.user!.userID,
                    reason: request.body.reason || null,
                    timeout: request.body.timeout
                }
            },
            { force: true }
        );

        if (!user) {
            throw new EntityNotFoundError("user");
        }

        return response.status(200).send(genericSuccessResponse);
    }
};
