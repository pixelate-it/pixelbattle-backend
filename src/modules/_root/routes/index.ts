import type { FastifyInstance } from "fastify";
import { root } from "./root.route";
import { favicon } from "./favicon.route";

export function rootRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.route(root);
    app.route(favicon);

    done();
}
