import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { MongoUser } from "../../models/MongoUser";
import { genericSuccessResponse } from "../../types/ApiReponse";



interface Body {
    token: string;
    tag: string;
}

export const changeTag: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: Body; Params: { id: string } }> = {
    method: 'POST',
    url: '/:id/tag',
    schema: {
        body: {
            type: 'object',
            required: ['token', 'tag'],
            properties: {
                token: { type: 'string' },
                tag: { type: 'string', maxLength: 8 }
            }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        await request.server.database.users
            .updateOne(
                {
                    token: request.body.token,
                    userID: request.params.id
                },
                {
                    $set: {
                        tag: (!request.body.tag) ? null : request.body.tag.replace(/\s+/i, ' ').trim()
                    }
                }
            );

        return response
            .code(200)
            .send(genericSuccessResponse);
    }
};