import { NotEnoughPrivilegesError } from "../errors";
import fp from "fastify-plugin"
import { UserRole } from "../models/MongoUser";

interface UserRoleOptions {
    minRole: UserRole
}

export const minUserRole = fp<UserRoleOptions>(async (app, options) => {
    app.addHook("preHandler", async (req) => {
        console.log(req.user)
        if (!([options.minRole, "ADMIN"].includes(req.user!.role)))
            throw new NotEnoughPrivilegesError(options.minRole)
    })

    return
})