import {  FastifyRequest } from "fastify";
import { MongoUser } from "../models/MongoUser";
import fp from "fastify-plugin"
import { NotAuthorizedError } from "../errors";

declare module 'fastify' {
    interface FastifyRequest {
        user: MongoUser | null
    }
}

export const bindUser = fp(async (app) => {
    app.decorateRequest("user", null);

    app.addHook("preHandler", async (req: FastifyRequest<{ Body: { token: string }; }>, _) => {
        const userCache = await req.server.cache.usersManager.get({ token: req.body.token });

        if (!userCache)
            throw new NotAuthorizedError()

        req.user = userCache.user;
    })

    return
})