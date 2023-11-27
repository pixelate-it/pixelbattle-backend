import { FastifyInstance, FastifyRequest } from "fastify";
import { MongoUser } from "../models/MongoUser";
import fp from "fastify-plugin"

declare module 'fastify' {
    interface FastifyRequest {
        user: MongoUser | null
    }
}

export const bindUser = fp(async (app) => {
    app.decorateRequest("user", null);

    app.addHook("preHandler", async (req: FastifyRequest<{Body: { token: string }; }>, reply) => {
        const user = await req.server.database.users.findOne({
            token: req.body.token
        })


        req.user = user;
    })

    return
})