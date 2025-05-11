import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { AuthInfo } from "@models";
import type { PossibleConnectionData } from "./types";
import { EntityNotFoundError } from "@core/errors";

export const getById: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { id: string } }
> = {
    method: "GET",
    url: "id/:id",
    schema: {},
    config: {
        rateLimit: {
            max: 5,
            timeWindow: "1s"
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersService.get({
            userID: request.params.id
        });

        if (!user) {
            throw new EntityNotFoundError("user");
        }

        return response.code(200).send({
            ...user,
            token: undefined,
            email: undefined,
            connections: Object.fromEntries(
                Object.entries<PossibleConnectionData>(
                    user.connections as unknown as Record<
                        keyof AuthInfo,
                        PossibleConnectionData
                    >
                ).filter(
                    ([_, value]) =>
                        value &&
                        (request.user?.userID === user.userID || value.visible)
                )
            )
        });
    }
};
