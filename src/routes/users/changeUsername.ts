import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { EntityInvalidError, WrongTokenError } from "utils/templateHttpError";
import { genericSuccessResponse } from "types/ApiResponse";

interface Body {
    username: string;
}

export const changeUsername: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    {
        Body: Body;
        Params: { id: string };
    }
> = {
    method: "POST",
    url: "/:id/username",
    schema: {
        body: {
            type: "object",
            required: ["username"],
            properties: {
                username: { type: "string", maxLength: 16 }
            }
        }
    },
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 3000
        }
    },
    async handler(request, response) {
        if (!request.user) throw new WrongTokenError();

        const username = request.body.username.replace(/\s+/i, " ").trim();
        if (username === "") throw new EntityInvalidError("username");

        await request.server.cache.usersManager.edit(
            {
                token: request.user.token,
                userID: request.params.id
            },
            { username },
            { force: true }
        );

        return response.code(200).send(genericSuccessResponse);
    }
};
