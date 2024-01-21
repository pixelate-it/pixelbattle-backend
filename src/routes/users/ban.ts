import { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { EntityNotFoundError } from "../../errors";
import { genericSuccessResponse } from "../../types/ApiReponse";
import { BanInfo } from "../../models/MongoUser";


interface Body {
    reason?: string;
    time: number;
    moderatorID: string;
}

export const ban: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: { id: string }; Body: BanInfo }> = {
    method: 'POST',
    url: '/:id/ban',
    schema: {
        body: {
            type: 'object',
            required: ['timeout', "moderatorID"],
            properties: {
                reason: { type: "string" },
                timeout: { type: "number" },
                moderatorID: { type: "string" }
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
        
        const user = await request.server.cache.usersManager.edit(
            { userID: request.params.id },
            { banned: {
                moderatorID: request.body.moderatorID,
                reason: request.body.reason ?? null,
                timeout: performance.now() + request.body.timeout,
            }}
        )



        if (!user) {
            throw new EntityNotFoundError("user");
        }


        return response
            .status(200)
            .send(genericSuccessResponse)
    }
}