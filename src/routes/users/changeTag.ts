import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { genericSuccessResponse } from "../../types/ApiReponse";



interface Body {
    tag: string;
}

export const changeTag: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: Body; Params: { id: string } }> = {
    method: 'POST',
    url: '/:id/tag',
    schema: {
        body: {
            type: 'object',
            required: ['tag'],
            properties: {
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
        await request.server.cache.usersManager.edit(
            {
                token: request.headers.authorization?.slice("Bearer ".length),
                userID: request.params.id
            },
            { tag: (!request.body.tag) ? null : request.body.tag.replace(/\s+/i, ' ').trim() },
            { force: true }
        );
        // await request.server.database.users
        //     .updateOne(
        //         {
        //             token: request.body.token,
        //             userID: request.params.id
        //         },
        //         {
        //             $set: {
        //                 tag: (!request.body.tag) ? null : request.body.tag.replace(/\s+/i, ' ').trim()
        //             }
        //         }
        //     );

        return response
            .code(200)
            .send(genericSuccessResponse);
    }
}