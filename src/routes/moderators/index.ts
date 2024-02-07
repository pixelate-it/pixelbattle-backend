import { FastifyInstance } from "fastify";
import { getAll } from "./getAll";
import { bindUser } from "../../plugins/bindUser";
import { minUserRole } from "../../plugins/minUserRole";
import { edit } from "./edit";
import { authRequired } from "../../plugins/authRequired";

export function moderators(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll);

    app.register(async (app, _, done) => {
        await app.register(bindUser);
        await app.register(authRequired);
        await app.register(minUserRole, {
            minRole: 2
        });

        app.route(edit);
        done();
    })

    done();
}