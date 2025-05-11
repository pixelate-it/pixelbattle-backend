import type { FastifyInstance } from "fastify";
import { root } from "./root.route";
import { favicon } from "./favicon.route";
import { socket } from "./socket.route";
import { bindUser } from "@core/hooks";

export function rootRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(root);
    app.route(favicon);

    app.register(async (app) => {
        await app.register(bindUser);

        app.route(socket);
    });

    done();
}
