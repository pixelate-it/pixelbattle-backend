import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";

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
        const user = request.server.database.users.findOneAndUpdate({
            userID: request.params.id
        }, {
            $set: {
                role: request.body.action ? "MOD" : "USER"
            }
        })

        if (!user) {
            throw new EntityNotFoundError("user")
        }


        return response
            .code(202)
            .send(genericSuccessResponse);
    }
};