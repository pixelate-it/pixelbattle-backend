import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { game } from "routes/game";
import { pixels } from "routes/pixels";
import { users } from "routes/users";
import { login } from "routes/login";
import { root } from "routes/root";
import { socket } from "routes/socket";
import { favicon } from "routes/favicon";
import { bindUser } from "plugins";
import { moderators } from "routes/moderators";

export const routes = fp(async function routes(app: FastifyInstance) {
    app.register(game, { prefix: `/${game.name}` });
    app.register(moderators, { prefix: `/${moderators.name}` });
    app.register(pixels, { prefix: `/${pixels.name}` });
    app.register(users, { prefix: `/${users.name}` });
    app.register(login, { prefix: `/${login.name}` });

    app.register(async (app) => {
        await app.register(bindUser);

        app.route(socket);
    });

    app.route(root);
    app.route(favicon);
});
