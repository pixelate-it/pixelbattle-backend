import fp from "fastify-plugin";
import type { MongoUser } from "@models";

declare module "fastify" {
    interface FastifyRequest {
        user: MongoUser | null;
    }
}

export const bindUser = fp(async function bindUser(app) {
    app.decorateRequest("user", null);

    /*app.addHook("preHandler", async (request) => {
        const cookies: RequestCookie = request.cookies;

        if (!cookies.token && !cookies.userid) return;

        const userCache = await request.server.cache.usersManager.get({
            token: cookies.token,
            userID: cookies.userid
        });

        if (!userCache) return;

        request.user = userCache.user;
    });*/
});
