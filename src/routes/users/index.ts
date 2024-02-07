import { FastifyInstance } from "fastify";
import { getUser } from "./getOne";
import { changeTag } from "./changeTag";
import { bindUser } from "../../plugins/bindUser";
import { authRequired } from "../../plugins/authRequired";
import { minUserRole } from "../../plugins/minUserRole";
import { ban } from "./ban";
import { unban } from "./unban";

export function users(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getUser);

    app.register(async (app, _, done) => {
        await app.register(bindUser);
        await app.register(authRequired);

        app.route(changeTag);

        done();
    });

    app.register(async (app, _, done) => {
        await app.register(bindUser);
        await app.register(authRequired);
        await app.register(minUserRole, {
            minRole: 2
        });

        app.route(ban);
        app.route(unban);

        done();
    });

    done();
}