import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../apiErrors";
import { genericSuccessResponse } from "../../types/ApiReponse";
import { UserRole } from '../../models/MongoUser';

interface Body {
    action: boolean;
}

export const edit: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: Body; Params: { id: string } }> = {
    method: 'POST',
    url: '/:id/edit',
    schema: {
        body: {
            type: 'object',
            required: ['action'],
            properties: {
                action: { type: 'boolean' }
            }
        }
    },
    config: {
        rateLimit: {
            max: 1,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        const user = await request.server.cache.usersManager.edit(
            { userID: request.params.id }, 
            { role: Number(request.body.action) as UserRole }
        );

        if(!user) {
            throw new EntityNotFoundError("user");
        }


        return response
            .code(202)
            .send(genericSuccessResponse);
    }
}