import { NotAuthorizedError } from "../errors";
import fp from "fastify-plugin";



export const authRequired = fp(async (app) => {
    app.addHook("preHandler", async (req) => {
        if(!req.user)
            throw new NotAuthorizedError();
    });

    return;
});