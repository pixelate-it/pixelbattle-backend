import { FastifyInstance } from "fastify";
import { getAll } from "./getAll";
import { bindUser } from "../../plugins/bindUser";
import { minUserRole } from "../../plugins/minUserRole";
import { authRequired } from "../../plugins/authRequired";

export function bans(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll)

    done()
}