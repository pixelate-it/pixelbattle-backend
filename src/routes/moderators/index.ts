import type { FastifyInstance } from "fastify";
import { bindUser, authRequired, minUserRole } from "plugins";
import { UserRole } from "../../models/MongoUser";
import { getAll } from "./getAll";
import { edit } from "./edit";

export function moderators(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll);

    app.register(async (app) => {
        await app.register(bindUser);
        await app.register(authRequired);
        await app.register(minUserRole, {
            minRole: UserRole.Admin
        });

        app.route(edit);
    });

    done();
}
