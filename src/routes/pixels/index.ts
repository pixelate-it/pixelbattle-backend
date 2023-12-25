import { FastifyInstance } from "fastify";
import { getAll } from "./getAll";
import { getOne } from "./getOne";
import { getTags } from "./getTags";
import { socket } from "./socket";
import { bindUser } from "../../plugins/bindUser";
import { authRequired } from "../../plugins/authRequired";
import { update } from "./update";
import { getAllRaw } from "./getAllRaw";

export function pixels(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(getAll)
    app.route(getAllRaw)
    app.route(getOne)
    app.route(getTags)
    app.route(socket)

    app.register(async (app, _, done) => {
        await app.register(bindUser)
        await app.register(authRequired)

        app.route(update)

        done()
    })

    done()
}