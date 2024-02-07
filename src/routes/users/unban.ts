import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";


export const unban: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: { id: string }; }> = {
    method: 'POST',
    url: '/:id/unban',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersManager.edit(
            { userID: request.params.id, },
            { banned: null }
        );

        if(!user) {
            throw new EntityNotFoundError("user");
        }

        return response
            .status(200)
            .send(genericSuccessResponse);
    }
}