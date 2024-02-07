import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../errors";


export const getUser: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: { id: string }; }> = {
    method: 'GET',
    url: '/:id',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersManager.get({ userID: request.params.id });

        if(!user) {
            throw new EntityNotFoundError("user");
        }

        return response.send({
            ...user.user,
            token: undefined,
            _id: undefined,
            banned: user.user.banned,
            isBanned: !!user.user.banned,
            isMod: Boolean(user.user.role)
        });
    }
}