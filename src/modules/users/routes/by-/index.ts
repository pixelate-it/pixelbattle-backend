import type { FastifyInstance } from "fastify";
import { bindUser } from "@core/hooks";
import { getById } from "./id.route";
import { getByUsername } from "./username.route";
import { getByTag } from "./tag.route";

export function byRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(async (app) => {
        await app.register(bindUser);

        app.route(getById);
        app.route(getByUsername);
    });

    app.route(getByTag);

    done();
}
