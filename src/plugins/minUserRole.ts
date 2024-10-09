import fp from "fastify-plugin";
import type { UserRole } from "models/MongoUser";
import { NotEnoughPrivilegesError } from "utils/templateHttpError";

interface UserRoleOptions {
    minRole: UserRole;
}

export const minUserRole = fp<UserRoleOptions>(async function minUserRole(
    app,
    options
) {
    app.addHook("preHandler", async (request) => {
        if (options.minRole > request.user!.role)
            throw new NotEnoughPrivilegesError(options.minRole);
    });
});
