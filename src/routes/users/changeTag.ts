import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { genericSuccessResponse } from "types/ApiResponse";
import { WrongTokenError } from "utils/templateHttpError";

interface Body {
    tag: string;
}

export const changeTag: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    {
        Body: Body;
        Params: { id: string };
    }
> = {
    method: "POST",
    url: "/:id/tag",
    schema: {
        body: {
            type: "object",
            required: ["tag"],
            properties: {
                tag: { type: "string", maxLength: 8 }
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
        if (!request.user) throw new WrongTokenError();

        await request.server.cache.usersManager.edit(
            {
                token: request.user.token,
                userID: request.params.id
            },
            {
                tag: !request.body.tag
                    ? null
                    : request.body.tag.replace(/\s+/i, " ").trim()
            },
            { force: true }
        );

        return response.code(200).send(genericSuccessResponse);
    }
};
