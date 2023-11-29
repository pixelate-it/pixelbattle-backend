import { FastifyInstance } from "fastify";
import { users } from "../routes/users";
import { pixels } from "../routes/pixels";
import { info } from "../routes/info";
import { bans } from "../routes/bans";
import { moderators } from "../routes/moderators";
import { favicon } from "../routes/favicon";
import { root } from "../routes/root";
import { login } from "../routes/login";
import fp from "fastify-plugin";

export const routes = fp(async (app: FastifyInstance) => {
    app.register(bans, { prefix: "/bans" })
    app.register(info, { prefix: "/info" })
    app.register(moderators, { prefix: "/moderators" })
    app.register(pixels, { prefix: "/pixels" })
    app.register(users, { prefix: "/users" })

    app.route(favicon)
    app.route(root)
    app.route(login)

    return
})