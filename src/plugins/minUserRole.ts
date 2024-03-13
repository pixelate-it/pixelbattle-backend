import { NotEnoughPrivilegesError } from "../apiErrors";
import fp from "fastify-plugin";
import { UserRole } from "../models/MongoUser";

interface UserRoleOptions {
    minRole: UserRole;
}

export const minUserRole = fp<UserRoleOptions>(async (app, options) => {
    app.addHook("preHandler", async (req) => {
        if(options.minRole > req.user!.role)
            throw new NotEnoughPrivilegesError(options.minRole);
    });

    return;
});