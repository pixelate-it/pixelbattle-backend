import { FastifyInstance } from "fastify";
import { NotEnoughPrivilegesError } from "../errors";
import fp from "fastify-plugin"
import { UserRole } from "../models/MongoUser";

interface UserRoleOptions {
    minLevel: UserRole
}

export const minUserRole = fp<UserRoleOptions>(async (app, options) => {
    app.addHook("preHandler", async (req) => {
        if (!([options.minLevel, "ADMIN"].includes(req.user!.role)))
            throw new NotEnoughPrivilegesError(options.minLevel)
    })

    return
})