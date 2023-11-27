import { FastifyInstance } from "fastify";
import { getAll } from "./getAll";
import { edit } from "./edit";
import { bindUser } from "../../plugins/bindUser";
import { minUserRole } from "../../plugins/minUserRole";
import { authRequired } from "../../plugins/authRequired";

export function bans(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll)

    app.register(async (app, _, done) => {
        await app.register(bindUser)
        await app.register(authRequired)
        await app.register(minUserRole, {
            minLevel: "MOD"
        })

        app.route(edit)

        done()
    })

    done()
}