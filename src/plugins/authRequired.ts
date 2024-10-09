import fp from "fastify-plugin";
import { NotAuthorizedError } from "utils/templateHttpError";

export const authRequired = fp(async function authRequired(app) {
    app.addHook("preHandler", async (request) => {
        if (!request.user) throw new NotAuthorizedError();
    });
});
