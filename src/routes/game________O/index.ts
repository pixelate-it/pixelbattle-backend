import { FastifyInstance } from "fastify";
import { get } from "./get";
import { authRequired } from "../../plugins/authRequired";
import { bindUser } from "../../plugins/bindUser";
import { minUserRole } from "../../plugins/minUserRole";
import { change } from "./change";
import { UserRole } from "../../models/MongoUser";

export function info(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(get);

    app.register(async (app,_, done) => {
        await app.register(bindUser);
        await app.register(authRequired);
        await app.register(minUserRole, {
            minRole: UserRole.Admin
        });

        app.route(change);

        done();
    });

    done();
}