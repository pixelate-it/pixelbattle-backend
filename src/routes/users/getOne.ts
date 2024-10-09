import type { RouteOptions } from "fastify";
import type { IncomingMessage, Server, ServerResponse } from "http";
import type { AuthInfo } from "models/MongoUser";
import { EntityNotFoundError } from "utils/templateHttpError";

type PossibleConnectionData = AuthInfo | null;

export const getOne: RouteOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    { Params: { id: string } }
> = {
    method: "GET",
    url: "/:id",
    config: {
        rateLimit: {
            max: 3,
            timeWindow: 1000
        }
    },
    handler: async (request, response) => {
        const user = await request.server.cache.usersManager.get({
            userID: request.params.id
        });

        if (!user) {
            throw new EntityNotFoundError("user");
        }

        return response.code(200).send({
            ...user.user,
            token: undefined,
            email: undefined,
            connections: Object.fromEntries(
                Object.entries<PossibleConnectionData>(
                    user.user.connections as unknown as Record<
                        keyof AuthInfo,
                        PossibleConnectionData
                    >
                ).filter(
                    ([_, value]) =>
                        value &&
                        (request.user?.userID === user.user.userID ||
                            value.visible)
                )
            )
        });
    }
};
