import type { FastifyInstance } from "fastify";
import { authRequired, bindUser, minUserRole } from "plugins";
import { UserRole } from "models/MongoUser";
import { getOne } from "./getOne";
import { changeTag } from "./changeTag";
import { changeUsername } from "./changeUsername";
import { ban } from "./ban";
import { unban } from "./unban";

export function users(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(async (app) => {
        await app.register(bindUser);

        app.route(getOne);
    });

    app.register(async (app) => {
        await app.register(bindUser);
        await app.register(authRequired);

        app.route(changeTag);
        app.route(changeUsername);
    });

    app.register(async (app) => {
        await app.register(bindUser);
        await app.register(authRequired);
        await app.register(minUserRole, {
            minRole: UserRole.Moderator
        });

        app.route(ban);
        app.route(unban);
    });

    done();
}
